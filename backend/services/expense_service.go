package services

import (
	"errors"
	"fmt"
	"math"
	"time"

	"expenseflow-backend/models"
	"expenseflow-backend/repositories"
	"expenseflow-backend/websocket"
	"github.com/google/uuid"
)

type ExpenseService struct {
	repo repositories.Repository
	hub  *websocket.Hub
}

func NewExpenseService(repo repositories.Repository, hub *websocket.Hub) *ExpenseService {
	return &ExpenseService{
		repo: repo,
		hub:  hub,
	}
}

// CalculateAndValidateSplits computes and verifies expense shares
func (s *ExpenseService) CalculateAndValidateSplits(req *models.CreateExpenseRequest) ([]models.SplitDetail, error) {
	numParticipants := len(req.Participants)
	if numParticipants == 0 {
		return nil, errors.New("at least one participant is required")
	}

	var computedSplits []models.SplitDetail
	amount := req.Amount

	switch req.SplitType {
	case "equal":
		splitAmount := math.Round((amount/float64(numParticipants))*100) / 100
		totalAllocated := 0.0

		for i, p := range req.Participants {
			allocated := splitAmount
			// Adjust last participant for rounding errors
			if i == numParticipants-1 {
				allocated = math.Round((amount-totalAllocated)*100) / 100
			}
			totalAllocated += allocated

			isPayer := p.ID == req.PaidBy.ID
			computedSplits = append(computedSplits, models.SplitDetail{
				UserID:     p.ID,
				UserName:   p.Name,
				Amount:     allocated,
				Percentage: math.Round((allocated/amount)*10000) / 100,
				Paid:       isPayer,
			})
		}

	case "custom":
		if len(req.Splits) == 0 {
			return nil, errors.New("custom splits must be provided")
		}
		var totalAllocated float64
		for _, sp := range req.Splits {
			if sp.Amount < 0 {
				return nil, errors.New("individual split amount cannot be negative")
			}
			totalAllocated += sp.Amount
			isPayer := sp.UserID == req.PaidBy.ID
			computedSplits = append(computedSplits, models.SplitDetail{
				UserID:     sp.UserID,
				UserName:   sp.UserName,
				Amount:     sp.Amount,
				Percentage: math.Round((sp.Amount/amount)*10000) / 100,
				Paid:       isPayer,
			})
		}
		if math.Abs(totalAllocated-amount) > 0.01 {
			return nil, fmt.Errorf("sum of splits (₹%.2f) does not match total expense amount (₹%.2f)", totalAllocated, amount)
		}

	case "percentage":
		if len(req.Splits) == 0 {
			return nil, errors.New("percentage splits must be provided")
		}
		var totalPct float64
		for _, sp := range req.Splits {
			if sp.Percentage < 0 {
				return nil, errors.New("split percentage cannot be negative")
			}
			totalPct += sp.Percentage
			splitAmt := math.Round((amount*(sp.Percentage/100.0))*100) / 100
			isPayer := sp.UserID == req.PaidBy.ID
			computedSplits = append(computedSplits, models.SplitDetail{
				UserID:     sp.UserID,
				UserName:   sp.UserName,
				Amount:     splitAmt,
				Percentage: sp.Percentage,
				Paid:       isPayer,
			})
		}
		if math.Abs(totalPct-100.0) > 0.01 {
			return nil, fmt.Errorf("sum of percentages (%.2f%%) must equal 100%%", totalPct)
		}

	default:
		return nil, fmt.Errorf("invalid split type: %s", req.SplitType)
	}

	return computedSplits, nil
}

func (s *ExpenseService) CreateExpense(req *models.CreateExpenseRequest, creatorID string) (*models.Expense, error) {
	splits, err := s.CalculateAndValidateSplits(req)
	if err != nil {
		return nil, err
	}

	expID := uuid.New().String()
	now := time.Now()

	exp := &models.Expense{
		ID:           expID,
		Description:  req.Description,
		Amount:       req.Amount,
		Category:     req.Category,
		Date:         req.Date,
		PaidBy:       req.PaidBy,
		Participants: req.Participants,
		SplitType:    req.SplitType,
		Splits:       splits,
		GroupID:      req.GroupID,
		GroupName:    req.GroupName,
		CreatedBy:    creatorID,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if err := s.repo.CreateExpense(exp); err != nil {
		return nil, err
	}

	// Update Group balances if part of a group
	if req.GroupID != "" {
		s.recalculateGroupBalances(req.GroupID)
	}

	// Notify participants
	for _, p := range req.Participants {
		if p.ID != req.PaidBy.ID {
			notif := &models.Notification{
				ID:        uuid.New().String(),
				UserID:    p.ID,
				Type:      "expense_added",
				Message:   fmt.Sprintf("%s added %s: ₹%.2f (Your share: ₹%.2f)", req.PaidBy.Name, req.Description, req.Amount, s.getShareForUser(splits, p.ID)),
				Read:      false,
				Link:      "/expenses",
				CreatedAt: now,
			}
			_ = s.repo.CreateNotification(notif)
		}
	}

	// Real-time broadcast
	if s.hub != nil {
		s.hub.Broadcast("EXPENSE_CREATED", exp)
	}

	return exp, nil
}

func (s *ExpenseService) UpdateExpense(id string, req *models.CreateExpenseRequest) (*models.Expense, error) {
	old, err := s.repo.GetExpenseByID(id)
	if err != nil {
		return nil, err
	}

	splits, err := s.CalculateAndValidateSplits(req)
	if err != nil {
		return nil, err
	}

	old.Description = req.Description
	old.Amount = req.Amount
	old.Category = req.Category
	old.Date = req.Date
	old.PaidBy = req.PaidBy
	old.Participants = req.Participants
	old.SplitType = req.SplitType
	old.Splits = splits
	old.GroupID = req.GroupID
	old.GroupName = req.GroupName
	old.UpdatedAt = time.Now()

	if err := s.repo.UpdateExpense(old); err != nil {
		return nil, err
	}

	if old.GroupID != "" {
		s.recalculateGroupBalances(old.GroupID)
	}

	if s.hub != nil {
		s.hub.Broadcast("EXPENSE_UPDATED", old)
	}

	return old, nil
}

func (s *ExpenseService) DeleteExpense(id string) error {
	exp, err := s.repo.GetExpenseByID(id)
	if err != nil {
		return err
	}

	groupID := exp.GroupID
	if err := s.repo.DeleteExpense(id); err != nil {
		return err
	}

	if groupID != "" {
		s.recalculateGroupBalances(groupID)
	}

	if s.hub != nil {
		s.hub.Broadcast("EXPENSE_DELETED", map[string]string{"id": id})
	}

	return nil
}

func (s *ExpenseService) getShareForUser(splits []models.SplitDetail, userID string) float64 {
	for _, sp := range splits {
		if sp.UserID == userID {
			return sp.Amount
		}
	}
	return 0
}

func (s *ExpenseService) recalculateGroupBalances(groupID string) {
	group, err := s.repo.GetGroupByID(groupID)
	if err != nil || group == nil {
		return
	}

	expenses, err := s.repo.GetAllExpenses("", "", "", "")
	if err != nil {
		return
	}

	// Calculate net balances
	netMap := make(map[string]float64)
	var totalExpenses float64

	for _, exp := range expenses {
		if exp.GroupID != groupID {
			continue
		}
		totalExpenses += exp.Amount
		// Payer gets credited total - their share
		payerID := exp.PaidBy.ID
		for _, sp := range exp.Splits {
			if sp.UserID == payerID {
				// Payer paid for themselves
				continue
			}
			// sp.UserID owes payer sp.Amount
			netMap[payerID] += sp.Amount
			netMap[sp.UserID] -= sp.Amount
		}
	}

	group.TotalExpenses = totalExpenses
	for i := range group.Members {
		mID := group.Members[i].ID
		group.Members[i].NetOwe = math.Round(netMap[mID]*100) / 100
	}

	_ = s.repo.UpdateGroup(group)
}
