package repositories

import (
	"errors"
	"strings"
	"sync"
	"time"

	"expenseflow-backend/models"
	"expenseflow-backend/utils"
)

type MemoryRepository struct {
	users         map[string]*models.User
	expenses      map[string]*models.Expense
	groups        map[string]*models.Group
	settlements   map[string]*models.Settlement
	notifications map[string]*models.Notification
	mu            sync.RWMutex
}

func NewMemoryRepository() *MemoryRepository {
	repo := &MemoryRepository{
		users:         make(map[string]*models.User),
		expenses:      make(map[string]*models.Expense),
		groups:        make(map[string]*models.Group),
		settlements:   make(map[string]*models.Settlement),
		notifications: make(map[string]*models.Notification),
	}
	repo.seedInitialData()
	return repo
}

func (r *MemoryRepository) seedInitialData() {
	passHash, _ := utils.HashPassword("password123")
	now := time.Now()

	// 1. Seed Users
	u1 := &models.User{
		ID:           "u1",
		Name:         "Gayathiri",
		Email:        "gayathiri@expenseflow.dev",
		PasswordHash: passHash,
		Avatar:       "https://api.dicebear.com/7.x/avataaars/svg?seed=Gayathiri",
		Phone:        "+91 98765 43210",
		CreatedAt:    now.Add(-30 * 24 * time.Hour),
		UpdatedAt:    now,
	}
	u2 := &models.User{
		ID:           "u2",
		Name:         "Priya",
		Email:        "priya@expenseflow.dev",
		PasswordHash: passHash,
		Avatar:       "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
		Phone:        "+91 98765 43211",
		CreatedAt:    now.Add(-30 * 24 * time.Hour),
		UpdatedAt:    now,
	}
	u3 := &models.User{
		ID:           "u3",
		Name:         "Anu",
		Email:        "anu@expenseflow.dev",
		PasswordHash: passHash,
		Avatar:       "https://api.dicebear.com/7.x/avataaars/svg?seed=Anu",
		Phone:        "+91 98765 43212",
		CreatedAt:    now.Add(-30 * 24 * time.Hour),
		UpdatedAt:    now,
	}
	u4 := &models.User{
		ID:           "u4",
		Name:         "Divya",
		Email:        "divya@expenseflow.dev",
		PasswordHash: passHash,
		Avatar:       "https://api.dicebear.com/7.x/avataaars/svg?seed=Divya",
		Phone:        "+91 98765 43213",
		CreatedAt:    now.Add(-30 * 24 * time.Hour),
		UpdatedAt:    now,
	}

	r.users[u1.ID] = u1
	r.users[u2.ID] = u2
	r.users[u3.ID] = u3
	r.users[u4.ID] = u4

	ref1 := models.UserRef{ID: u1.ID, Name: u1.Name, Email: u1.Email, Avatar: u1.Avatar}
	ref2 := models.UserRef{ID: u2.ID, Name: u2.Name, Email: u2.Email, Avatar: u2.Avatar}
	ref3 := models.UserRef{ID: u3.ID, Name: u3.Name, Email: u3.Email, Avatar: u3.Avatar}
	ref4 := models.UserRef{ID: u4.ID, Name: u4.Name, Email: u4.Email, Avatar: u4.Avatar}

	// 2. Seed Groups
	g1 := &models.Group{
		ID:          "g1",
		Name:        "College Friends",
		Description: "Daily food, weekend plans, and semester outings",
		CreatedBy:   "u1",
		TotalExpenses: 5400,
		Avatar:      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=300&q=80",
		Members: []models.GroupMember{
			{ID: u1.ID, Name: u1.Name, Email: u1.Email, Avatar: u1.Avatar, Role: "admin", NetOwe: 600},
			{ID: u2.ID, Name: u2.Name, Email: u2.Email, Avatar: u2.Avatar, Role: "member", NetOwe: -500},
			{ID: u3.ID, Name: u3.Name, Email: u3.Email, Avatar: u3.Avatar, Role: "member", NetOwe: -300},
			{ID: u4.ID, Name: u4.Name, Email: u4.Email, Avatar: u4.Avatar, Role: "member", NetOwe: 200},
		},
		CreatedAt: now.Add(-25 * 24 * time.Hour),
		UpdatedAt: now,
	}

	g2 := &models.Group{
		ID:          "g2",
		Name:        "Trip 2026",
		Description: "Goa beach trip travel, villa stay, and scooter rentals",
		CreatedBy:   "u1",
		TotalExpenses: 12800,
		Avatar:      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80",
		Members: []models.GroupMember{
			{ID: u1.ID, Name: u1.Name, Email: u1.Email, Avatar: u1.Avatar, Role: "admin", NetOwe: 400},
			{ID: u2.ID, Name: u2.Name, Email: u2.Email, Avatar: u2.Avatar, Role: "member", NetOwe: -200},
			{ID: u3.ID, Name: u3.Name, Email: u3.Email, Avatar: u3.Avatar, Role: "member", NetOwe: -200},
			{ID: u4.ID, Name: u4.Name, Email: u4.Email, Avatar: u4.Avatar, Role: "member", NetOwe: 0},
		},
		CreatedAt: now.Add(-14 * 24 * time.Hour),
		UpdatedAt: now,
	}

	g3 := &models.Group{
		ID:          "g3",
		Name:        "Roommates",
		Description: "Apartment rent, WiFi, groceries and electricity",
		CreatedBy:   "u2",
		TotalExpenses: 3200,
		Avatar:      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=300&q=80",
		Members: []models.GroupMember{
			{ID: u1.ID, Name: u1.Name, Email: u1.Email, Avatar: u1.Avatar, Role: "member", NetOwe: 200},
			{ID: u2.ID, Name: u2.Name, Email: u2.Email, Avatar: u2.Avatar, Role: "admin", NetOwe: -200},
			{ID: u3.ID, Name: u3.Name, Email: u3.Email, Avatar: u3.Avatar, Role: "member", NetOwe: 0},
		},
		CreatedAt: now.Add(-20 * 24 * time.Hour),
		UpdatedAt: now,
	}

	r.groups[g1.ID] = g1
	r.groups[g2.ID] = g2
	r.groups[g3.ID] = g3

	// 3. Seed Expenses
	// Dinner: 2000 paid by Gayathiri, 4 participants (500 each)
	e1 := &models.Expense{
		ID:          "e1",
		Description: "Dinner at Bistro",
		Amount:      2000,
		Category:    "Food & Dining",
		Date:        now.Add(-2 * 24 * time.Hour).Format("2006-01-02"),
		PaidBy:      ref1,
		Participants: []models.UserRef{ref1, ref2, ref3, ref4},
		SplitType:   "equal",
		Splits: []models.SplitDetail{
			{UserID: u1.ID, UserName: u1.Name, Amount: 500, Paid: true},
			{UserID: u2.ID, UserName: u2.Name, Amount: 500, Paid: false},
			{UserID: u3.ID, UserName: u3.Name, Amount: 500, Paid: false},
			{UserID: u4.ID, UserName: u4.Name, Amount: 500, Paid: false},
		},
		GroupID:   g1.ID,
		GroupName: g1.Name,
		CreatedBy: u1.ID,
		CreatedAt: now.Add(-2 * 24 * time.Hour),
		UpdatedAt: now.Add(-2 * 24 * time.Hour),
	}

	// Movie: 1200 paid by Priya, 4 participants (300 each)
	e2 := &models.Expense{
		ID:          "e2",
		Description: "Movie IMAX Tickets",
		Amount:      1200,
		Category:    "Entertainment",
		Date:        now.Add(-4 * 24 * time.Hour).Format("2006-01-02"),
		PaidBy:      ref2,
		Participants: []models.UserRef{ref1, ref2, ref3, ref4},
		SplitType:   "equal",
		Splits: []models.SplitDetail{
			{UserID: u1.ID, UserName: u1.Name, Amount: 300, Paid: false},
			{UserID: u2.ID, UserName: u2.Name, Amount: 300, Paid: true},
			{UserID: u3.ID, UserName: u3.Name, Amount: 300, Paid: false},
			{UserID: u4.ID, UserName: u4.Name, Amount: 300, Paid: false},
		},
		GroupID:   g1.ID,
		GroupName: g1.Name,
		CreatedBy: u2.ID,
		CreatedAt: now.Add(-4 * 24 * time.Hour),
		UpdatedAt: now.Add(-4 * 24 * time.Hour),
	}

	// Travel: 800 paid by Anu, 4 participants (200 each)
	e3 := &models.Expense{
		ID:          "e3",
		Description: "Cab & Travel Pass",
		Amount:      800,
		Category:    "Transportation",
		Date:        now.Add(-6 * 24 * time.Hour).Format("2006-01-02"),
		PaidBy:      ref3,
		Participants: []models.UserRef{ref1, ref2, ref3, ref4},
		SplitType:   "equal",
		Splits: []models.SplitDetail{
			{UserID: u1.ID, UserName: u1.Name, Amount: 200, Paid: false},
			{UserID: u2.ID, UserName: u2.Name, Amount: 200, Paid: false},
			{UserID: u3.ID, UserName: u3.Name, Amount: 200, Paid: true},
			{UserID: u4.ID, UserName: u4.Name, Amount: 200, Paid: false},
		},
		GroupID:   g1.ID,
		GroupName: g1.Name,
		CreatedBy: u3.ID,
		CreatedAt: now.Add(-6 * 24 * time.Hour),
		UpdatedAt: now.Add(-6 * 24 * time.Hour),
	}

	// Coffee: 400 paid by Gayathiri, 4 participants (100 each)
	e4 := &models.Expense{
		ID:          "e4",
		Description: "Artisan Coffee & Snacks",
		Amount:      400,
		Category:    "Food & Dining",
		Date:        now.Add(-8 * 24 * time.Hour).Format("2006-01-02"),
		PaidBy:      ref1,
		Participants: []models.UserRef{ref1, ref2, ref3, ref4},
		SplitType:   "equal",
		Splits: []models.SplitDetail{
			{UserID: u1.ID, UserName: u1.Name, Amount: 100, Paid: true},
			{UserID: u2.ID, UserName: u2.Name, Amount: 100, Paid: false},
			{UserID: u3.ID, UserName: u3.Name, Amount: 100, Paid: false},
			{UserID: u4.ID, UserName: u4.Name, Amount: 100, Paid: false},
		},
		GroupID:   g1.ID,
		GroupName: g1.Name,
		CreatedBy: u1.ID,
		CreatedAt: now.Add(-8 * 24 * time.Hour),
		UpdatedAt: now.Add(-8 * 24 * time.Hour),
	}

	// Grocery: 1000 paid by Divya, 4 participants (250 each)
	e5 := &models.Expense{
		ID:          "e5",
		Description: "Weekend Grocery Essentials",
		Amount:      1000,
		Category:    "Groceries",
		Date:        now.Add(-10 * 24 * time.Hour).Format("2006-01-02"),
		PaidBy:      ref4,
		Participants: []models.UserRef{ref1, ref2, ref3, ref4},
		SplitType:   "equal",
		Splits: []models.SplitDetail{
			{UserID: u1.ID, UserName: u1.Name, Amount: 250, Paid: false},
			{UserID: u2.ID, UserName: u2.Name, Amount: 250, Paid: false},
			{UserID: u3.ID, UserName: u3.Name, Amount: 250, Paid: false},
			{UserID: u4.ID, UserName: u4.Name, Amount: 250, Paid: true},
		},
		GroupID:   g1.ID,
		GroupName: g1.Name,
		CreatedBy: u4.ID,
		CreatedAt: now.Add(-10 * 24 * time.Hour),
		UpdatedAt: now.Add(-10 * 24 * time.Hour),
	}

	r.expenses[e1.ID] = e1
	r.expenses[e2.ID] = e2
	r.expenses[e3.ID] = e3
	r.expenses[e4.ID] = e4
	r.expenses[e5.ID] = e5

	// 4. Seed Settlements
	settledDate := now.Add(-12 * 24 * time.Hour)
	s1 := &models.Settlement{
		ID:        "s1",
		FromUser:  ref2, // Priya
		ToUser:    ref1, // Gayathiri
		Amount:    500,
		GroupID:   g1.ID,
		GroupName: g1.Name,
		Status:    "pending",
		CreatedAt: now.Add(-1 * 24 * time.Hour),
	}
	s2 := &models.Settlement{
		ID:        "s2",
		FromUser:  ref3, // Anu
		ToUser:    ref1, // Gayathiri
		Amount:    300,
		GroupID:   g1.ID,
		GroupName: g1.Name,
		Status:    "pending",
		CreatedAt: now.Add(-2 * 24 * time.Hour),
	}
	s3 := &models.Settlement{
		ID:        "s3",
		FromUser:  ref1, // Gayathiri
		ToUser:    ref4, // Divya
		Amount:    200,
		GroupID:   g1.ID,
		GroupName: g1.Name,
		Status:    "pending",
		CreatedAt: now.Add(-3 * 24 * time.Hour),
	}
	s4 := &models.Settlement{
		ID:        "s4",
		FromUser:  ref2, // Priya
		ToUser:    ref1, // Gayathiri
		Amount:    500,
		GroupID:   g1.ID,
		GroupName: g1.Name,
		Status:    "settled",
		SettledAt: &settledDate,
		CreatedAt: settledDate.Add(-1 * 24 * time.Hour),
	}
	s5 := &models.Settlement{
		ID:        "s5",
		FromUser:  ref3, // Anu
		ToUser:    ref1, // Gayathiri
		Amount:    300,
		GroupID:   g1.ID,
		GroupName: g1.Name,
		Status:    "settled",
		SettledAt: &settledDate,
		CreatedAt: settledDate.Add(-2 * 24 * time.Hour),
	}

	r.settlements[s1.ID] = s1
	r.settlements[s2.ID] = s2
	r.settlements[s3.ID] = s3
	r.settlements[s4.ID] = s4
	r.settlements[s5.ID] = s5

	// 5. Seed Notifications
	n1 := &models.Notification{
		ID:        "n1",
		UserID:    u1.ID,
		Type:      "expense_added",
		Message:   "Priya added a new expense: Movie IMAX Tickets (₹1,200)",
		Read:      false,
		Link:      "/expenses",
		CreatedAt: now.Add(-4 * 24 * time.Hour),
	}
	n2 := &models.Notification{
		ID:        "n1",
		UserID:    u1.ID,
		Type:      "owed",
		Message:   "Anu owes you ₹300 for College Friends outing",
		Read:      false,
		Link:      "/settlements",
		CreatedAt: now.Add(-2 * 24 * time.Hour),
	}
	n3 := &models.Notification{
		ID:        "n3",
		UserID:    u1.ID,
		Type:      "settled",
		Message:   "Settlement completed: Priya paid you ₹500 via UPI",
		Read:      true,
		Link:      "/settlements",
		CreatedAt: now.Add(-5 * 24 * time.Hour),
	}
	n4 := &models.Notification{
		ID:        "n4",
		UserID:    u1.ID,
		Type:      "group_invite",
		Message:   "You were added to Trip 2026 by Gayathiri",
		Read:      true,
		Link:      "/groups/g2",
		CreatedAt: now.Add(-14 * 24 * time.Hour),
	}

	r.notifications[n1.ID] = n1
	r.notifications[n2.ID] = n2
	r.notifications[n3.ID] = n3
	r.notifications[n4.ID] = n4
}

// User Methods
func (r *MemoryRepository) FindUserByEmail(email string) (*models.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	cleanEmail := strings.ToLower(strings.TrimSpace(email))
	for _, u := range r.users {
		if strings.ToLower(u.Email) == cleanEmail {
			return u, nil
		}
	}
	return nil, errors.New("user not found")
}

func (r *MemoryRepository) FindUserByID(id string) (*models.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	if u, ok := r.users[id]; ok {
		return u, nil
	}
	return nil, errors.New("user not found")
}

func (r *MemoryRepository) CreateUser(user *models.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.users[user.ID] = user
	return nil
}

func (r *MemoryRepository) UpdateUser(user *models.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, ok := r.users[user.ID]; !ok {
		return errors.New("user not found")
	}
	r.users[user.ID] = user
	return nil
}

// Expense Methods
func (r *MemoryRepository) GetAllExpenses(userID, category, splitType, search string) ([]models.Expense, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var result []models.Expense
	search = strings.ToLower(strings.TrimSpace(search))

	for _, e := range r.expenses {
		// Category filter
		if category != "" && category != "all" && !strings.EqualFold(e.Category, category) {
			continue
		}
		// SplitType filter
		if splitType != "" && splitType != "all" && !strings.EqualFold(e.SplitType, splitType) {
			continue
		}
		// Search query filter
		if search != "" {
			descMatch := strings.Contains(strings.ToLower(e.Description), search)
			paidMatch := strings.Contains(strings.ToLower(e.PaidBy.Name), search)
			catMatch := strings.Contains(strings.ToLower(e.Category), search)
			if !descMatch && !paidMatch && !catMatch {
				continue
			}
		}
		result = append(result, *e)
	}

	return result, nil
}

func (r *MemoryRepository) GetExpenseByID(id string) (*models.Expense, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	if e, ok := r.expenses[id]; ok {
		return e, nil
	}
	return nil, errors.New("expense not found")
}

func (r *MemoryRepository) CreateExpense(exp *models.Expense) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.expenses[exp.ID] = exp

	// Update group total if associated
	if exp.GroupID != "" {
		if g, ok := r.groups[exp.GroupID]; ok {
			g.TotalExpenses += exp.Amount
			g.UpdatedAt = time.Now()
		}
	}
	return nil
}

func (r *MemoryRepository) UpdateExpense(exp *models.Expense) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	old, ok := r.expenses[exp.ID]
	if !ok {
		return errors.New("expense not found")
	}

	// Adjust group totals if amount changed
	if old.GroupID != "" && r.groups[old.GroupID] != nil {
		r.groups[old.GroupID].TotalExpenses += (exp.Amount - old.Amount)
	}

	r.expenses[exp.ID] = exp
	return nil
}

func (r *MemoryRepository) DeleteExpense(id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	old, ok := r.expenses[id]
	if !ok {
		return errors.New("expense not found")
	}
	if old.GroupID != "" && r.groups[old.GroupID] != nil {
		r.groups[old.GroupID].TotalExpenses -= old.Amount
		if r.groups[old.GroupID].TotalExpenses < 0 {
			r.groups[old.GroupID].TotalExpenses = 0
		}
	}
	delete(r.expenses, id)
	return nil
}

// Group Methods
func (r *MemoryRepository) GetAllGroups(userID string) ([]models.Group, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var result []models.Group
	for _, g := range r.groups {
		result = append(result, *g)
	}
	return result, nil
}

func (r *MemoryRepository) GetGroupByID(id string) (*models.Group, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	if g, ok := r.groups[id]; ok {
		return g, nil
	}
	return nil, errors.New("group not found")
}

func (r *MemoryRepository) CreateGroup(group *models.Group) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.groups[group.ID] = group
	return nil
}

func (r *MemoryRepository) UpdateGroup(group *models.Group) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, ok := r.groups[group.ID]; !ok {
		return errors.New("group not found")
	}
	r.groups[group.ID] = group
	return nil
}

func (r *MemoryRepository) DeleteGroup(id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, ok := r.groups[id]; !ok {
		return errors.New("group not found")
	}
	delete(r.groups, id)
	return nil
}

func (r *MemoryRepository) AddMemberToGroup(groupID string, member models.GroupMember) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	g, ok := r.groups[groupID]
	if !ok {
		return errors.New("group not found")
	}
	for _, m := range g.Members {
		if m.ID == member.ID || strings.EqualFold(m.Email, member.Email) {
			return errors.New("member already exists in group")
		}
	}
	g.Members = append(g.Members, member)
	g.UpdatedAt = time.Now()
	return nil
}

func (r *MemoryRepository) RemoveMemberFromGroup(groupID, memberID string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	g, ok := r.groups[groupID]
	if !ok {
		return errors.New("group not found")
	}
	var updated []models.GroupMember
	for _, m := range g.Members {
		if m.ID != memberID {
			updated = append(updated, m)
		}
	}
	g.Members = updated
	g.UpdatedAt = time.Now()
	return nil
}

// Settlement Methods
func (r *MemoryRepository) GetAllSettlements(userID, groupID string) ([]models.Settlement, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var result []models.Settlement
	for _, s := range r.settlements {
		if groupID != "" && s.GroupID != groupID {
			continue
		}
		result = append(result, *s)
	}
	return result, nil
}

func (r *MemoryRepository) GetSettlementByID(id string) (*models.Settlement, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	if s, ok := r.settlements[id]; ok {
		return s, nil
	}
	return nil, errors.New("settlement not found")
}

func (r *MemoryRepository) CreateSettlement(settlement *models.Settlement) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.settlements[settlement.ID] = settlement
	return nil
}

func (r *MemoryRepository) UpdateSettlement(settlement *models.Settlement) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, ok := r.settlements[settlement.ID]; !ok {
		return errors.New("settlement not found")
	}
	r.settlements[settlement.ID] = settlement
	return nil
}

// Notification Methods
func (r *MemoryRepository) GetAllNotifications(userID string) ([]models.Notification, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var result []models.Notification
	for _, n := range r.notifications {
		if userID == "" || n.UserID == userID || n.UserID == "u1" {
			result = append(result, *n)
		}
	}
	return result, nil
}

func (r *MemoryRepository) MarkNotificationAsRead(id, userID string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if n, ok := r.notifications[id]; ok {
		n.Read = true
		return nil
	}
	return errors.New("notification not found")
}

func (r *MemoryRepository) MarkAllNotificationsAsRead(userID string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	for _, n := range r.notifications {
		if userID == "" || n.UserID == userID || n.UserID == "u1" {
			n.Read = true
		}
	}
	return nil
}

func (r *MemoryRepository) CreateNotification(notif *models.Notification) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.notifications[notif.ID] = notif
	return nil
}
