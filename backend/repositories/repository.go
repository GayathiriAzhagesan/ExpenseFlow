package repositories

import (
	"expenseflow-backend/models"
)

// Repository defines all database operations for ExpenseFlow
type Repository interface {
	// Users
	FindUserByEmail(email string) (*models.User, error)
	FindUserByID(id string) (*models.User, error)
	CreateUser(user *models.User) error
	UpdateUser(user *models.User) error

	// Expenses
	GetAllExpenses(userID, category, splitType, search string) ([]models.Expense, error)
	GetExpenseByID(id string) (*models.Expense, error)
	CreateExpense(exp *models.Expense) error
	UpdateExpense(exp *models.Expense) error
	DeleteExpense(id string) error

	// Groups
	GetAllGroups(userID string) ([]models.Group, error)
	GetGroupByID(id string) (*models.Group, error)
	CreateGroup(group *models.Group) error
	UpdateGroup(group *models.Group) error
	DeleteGroup(id string) error
	AddMemberToGroup(groupID string, member models.GroupMember) error
	RemoveMemberFromGroup(groupID, memberID string) error

	// Settlements
	GetAllSettlements(userID, groupID string) ([]models.Settlement, error)
	GetSettlementByID(id string) (*models.Settlement, error)
	CreateSettlement(settlement *models.Settlement) error
	UpdateSettlement(settlement *models.Settlement) error

	// Notifications
	GetAllNotifications(userID string) ([]models.Notification, error)
	MarkNotificationAsRead(id, userID string) error
	MarkAllNotificationsAsRead(userID string) error
	CreateNotification(notif *models.Notification) error
}
