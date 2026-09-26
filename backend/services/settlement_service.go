package services

import (
	"errors"
	"fmt"
	"time"

	"expenseflow-backend/models"
	"expenseflow-backend/repositories"
	"expenseflow-backend/websocket"
	"github.com/google/uuid"
)

type SettlementService struct {
	repo repositories.Repository
	hub  *websocket.Hub
}

func NewSettlementService(repo repositories.Repository, hub *websocket.Hub) *SettlementService {
	return &SettlementService{
		repo: repo,
		hub:  hub,
	}
}

func (s *SettlementService) CreateSettlement(req *models.SettleRequest) (*models.Settlement, error) {
	fromUser, err := s.repo.FindUserByID(req.FromUserID)
	if err != nil {
		return nil, errors.New("sender user not found")
	}

	toUser, err := s.repo.FindUserByID(req.ToUserID)
	if err != nil {
		return nil, errors.New("recipient user not found")
	}

	var groupName string
	if req.GroupID != "" {
		if grp, err := s.repo.GetGroupByID(req.GroupID); err == nil && grp != nil {
			groupName = grp.Name
		}
	}

	st := &models.Settlement{
		ID: uuid.New().String(),
		FromUser: models.UserRef{
			ID:     fromUser.ID,
			Name:   fromUser.Name,
			Email:  fromUser.Email,
			Avatar: fromUser.Avatar,
		},
		ToUser: models.UserRef{
			ID:     toUser.ID,
			Name:   toUser.Name,
			Email:  toUser.Email,
			Avatar: toUser.Avatar,
		},
		Amount:    req.Amount,
		GroupID:   req.GroupID,
		GroupName: groupName,
		Status:    "pending",
		CreatedAt: time.Now(),
	}

	if err := s.repo.CreateSettlement(st); err != nil {
		return nil, err
	}

	// Notify receiver
	notif := &models.Notification{
		ID:        uuid.New().String(),
		UserID:    toUser.ID,
		Type:      "owed",
		Message:   fmt.Sprintf("%s initiated a settlement of ₹%.2f to you", fromUser.Name, req.Amount),
		Read:      false,
		Link:      "/settlements",
		CreatedAt: time.Now(),
	}
	_ = s.repo.CreateNotification(notif)

	if s.hub != nil {
		s.hub.Broadcast("SETTLEMENT_CREATED", st)
	}

	return st, nil
}

func (s *SettlementService) SettlePayment(settlementID string, req *models.SettlePaymentRequest) (*models.Settlement, error) {
	st, err := s.repo.GetSettlementByID(settlementID)
	if err != nil {
		return nil, errors.New("settlement not found")
	}

	if st.Status == "settled" {
		return st, nil
	}

	now := time.Now()
	st.Status = "settled"
	st.SettledAt = &now

	if req != nil && req.PaymentMethod != "" {
		st.PaymentMethod = req.PaymentMethod
		st.UpiID = req.UpiID
		if req.Currency != "" {
			st.Currency = req.Currency
		}
	} else if st.PaymentMethod == "" {
		st.PaymentMethod = "Direct"
	}

	if err := s.repo.UpdateSettlement(st); err != nil {
		return nil, err
	}

	// Update Group member balances if group is tied
	if st.GroupID != "" {
		group, err := s.repo.GetGroupByID(st.GroupID)
		if err == nil && group != nil {
			for i := range group.Members {
				if group.Members[i].ID == st.FromUser.ID {
					group.Members[i].NetOwe += st.Amount
				} else if group.Members[i].ID == st.ToUser.ID {
					group.Members[i].NetOwe -= st.Amount
				}
			}
			_ = s.repo.UpdateGroup(group)
		}
	}

	methodLabel := ""
	if st.PaymentMethod != "" {
		methodLabel = " via " + st.PaymentMethod
	}

	// Notify both users
	notifTo := &models.Notification{
		ID:        uuid.New().String(),
		UserID:    st.ToUser.ID,
		Type:      "settled",
		Message:   fmt.Sprintf("✓ Settlement completed: %s paid you ₹%.2f%s", st.FromUser.Name, st.Amount, methodLabel),
		Read:      false,
		Link:      "/settlements",
		CreatedAt: now,
	}
	notifFrom := &models.Notification{
		ID:        uuid.New().String(),
		UserID:    st.FromUser.ID,
		Type:      "settled",
		Message:   fmt.Sprintf("✓ Settlement completed: You paid %s ₹%.2f%s", st.ToUser.Name, st.Amount, methodLabel),
		Read:      false,
		Link:      "/settlements",
		CreatedAt: now,
	}
	_ = s.repo.CreateNotification(notifTo)
	_ = s.repo.CreateNotification(notifFrom)

	if s.hub != nil {
		s.hub.Broadcast("SETTLEMENT_COMPLETED", st)
		s.hub.Broadcast("BALANCE_UPDATED", map[string]interface{}{
			"fromUserId": st.FromUser.ID,
			"toUserId":   st.ToUser.ID,
			"amount":     st.Amount,
			"groupId":    st.GroupID,
		})
	}

	return st, nil
}

func (s *SettlementService) Settle(settlementID string) (*models.Settlement, error) {
	return s.SettlePayment(settlementID, nil)
}
