package models

import (
	"time"
)

// User represents a user account in ExpenseFlow
type User struct {
	ID           string    `json:"id" bson:"_id,omitempty"`
	Name         string    `json:"name" bson:"name"`
	Email        string    `json:"email" bson:"email"`
	PasswordHash string    `json:"-" bson:"passwordHash"`
	Avatar       string    `json:"avatar" bson:"avatar"`
	Phone        string    `json:"phone" bson:"phone"`
	CreatedAt    time.Time `json:"createdAt" bson:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt" bson:"updatedAt"`
}

// UserRef represents minimal user info for embeds
type UserRef struct {
	ID     string `json:"id" bson:"id"`
	Name   string `json:"name" bson:"name"`
	Email  string `json:"email" bson:"email"`
	Avatar string `json:"avatar" bson:"avatar"`
}

// SplitDetail represents how much an individual owes for an expense
type SplitDetail struct {
	UserID     string  `json:"userId" bson:"userId"`
	UserName   string  `json:"userName" bson:"userName"`
	Amount     float64 `json:"amount" bson:"amount"`
	Percentage float64 `json:"percentage,omitempty" bson:"percentage,omitempty"`
	Paid       bool    `json:"paid" bson:"paid"`
}

// Expense represents an expense entry
type Expense struct {
	ID           string        `json:"id" bson:"_id,omitempty"`
	Description  string        `json:"description" bson:"description"`
	Amount       float64       `json:"amount" bson:"amount"`
	Category     string        `json:"category" bson:"category"`
	Date         string        `json:"date" bson:"date"`
	PaidBy       UserRef       `json:"paidBy" bson:"paidBy"`
	Participants []UserRef     `json:"participants" bson:"participants"`
	SplitType    string        `json:"splitType" bson:"splitType"` // "equal", "custom", "percentage"
	Splits       []SplitDetail `json:"splits" bson:"splits"`
	GroupID      string        `json:"groupId,omitempty" bson:"groupId,omitempty"`
	GroupName    string        `json:"groupName,omitempty" bson:"groupName,omitempty"`
	CreatedBy    string        `json:"createdBy" bson:"createdBy"`
	CreatedAt    time.Time     `json:"createdAt" bson:"createdAt"`
	UpdatedAt    time.Time     `json:"updatedAt" bson:"updatedAt"`
}

// GroupMember represents a member in a group
type GroupMember struct {
	ID     string  `json:"id" bson:"id"`
	Name   string  `json:"name" bson:"name"`
	Email  string  `json:"email" bson:"email"`
	Avatar string  `json:"avatar" bson:"avatar"`
	Role   string  `json:"role" bson:"role"` // "admin", "member"
	NetOwe float64 `json:"netOwe" bson:"netOwe"` // positive = owed to them, negative = they owe
}

// Group represents a collection of shared expenses
type Group struct {
	ID            string        `json:"id" bson:"_id,omitempty"`
	Name          string        `json:"name" bson:"name"`
	Description   string        `json:"description" bson:"description"`
	Members       []GroupMember `json:"members" bson:"members"`
	CreatedBy     string        `json:"createdBy" bson:"createdBy"`
	TotalExpenses float64       `json:"totalExpenses" bson:"totalExpenses"`
	Avatar        string        `json:"avatar" bson:"avatar"`
	CreatedAt     time.Time     `json:"createdAt" bson:"createdAt"`
	UpdatedAt     time.Time     `json:"updatedAt" bson:"updatedAt"`
}

// Settlement represents a settled or pending debt payoff between two members
type Settlement struct {
	ID        string     `json:"id" bson:"_id,omitempty"`
	FromUser  UserRef    `json:"fromUser" bson:"fromUser"`
	ToUser    UserRef    `json:"toUser" bson:"toUser"`
	Amount    float64    `json:"amount" bson:"amount"`
	GroupID   string     `json:"groupId,omitempty" bson:"groupId,omitempty"`
	GroupName string     `json:"groupName,omitempty" bson:"groupName,omitempty"`
	Status        string     `json:"status" bson:"status"` // "pending", "settled"
	PaymentMethod string     `json:"paymentMethod,omitempty" bson:"paymentMethod,omitempty"` // "UPI", "Cash", etc.
	UpiID         string     `json:"upiId,omitempty" bson:"upiId,omitempty"`
	Currency      string     `json:"currency,omitempty" bson:"currency,omitempty"`
	SettledAt     *time.Time `json:"settledAt,omitempty" bson:"settledAt,omitempty"`
	CreatedAt     time.Time  `json:"createdAt" bson:"createdAt"`
}

// Notification represents a user alert
type Notification struct {
	ID        string    `json:"id" bson:"_id,omitempty"`
	UserID    string    `json:"userId" bson:"userId"`
	Type      string    `json:"type" bson:"type"` // "expense_added", "owed", "settled", "group_invite"
	Message   string    `json:"message" bson:"message"`
	Read      bool      `json:"read" bson:"read"`
	Link      string    `json:"link,omitempty" bson:"link,omitempty"`
	CreatedAt time.Time `json:"createdAt" bson:"createdAt"`
}

// DTOs for incoming requests
type RegisterRequest struct {
	Name            string `json:"name" binding:"required"`
	Email           string `json:"email" binding:"required,email"`
	Password        string `json:"password" binding:"required,min=6"`
	ConfirmPassword string `json:"confirmPassword" binding:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type CreateExpenseRequest struct {
	Description  string        `json:"description" binding:"required"`
	Amount       float64       `json:"amount" binding:"required,gt=0"`
	Category     string        `json:"category" binding:"required"`
	Date         string        `json:"date" binding:"required"`
	PaidBy       UserRef       `json:"paidBy" binding:"required"`
	Participants []UserRef     `json:"participants" binding:"required,min=1"`
	SplitType    string        `json:"splitType" binding:"required"` // "equal", "custom", "percentage"
	Splits       []SplitDetail `json:"splits"`
	GroupID      string        `json:"groupId"`
	GroupName    string        `json:"groupName"`
}

type CreateGroupRequest struct {
	Name        string        `json:"name" binding:"required"`
	Description string        `json:"description"`
	Members     []GroupMember `json:"members"`
	Avatar      string        `json:"avatar"`
}

type AddMemberRequest struct {
	Name   string `json:"name" binding:"required"`
	Email  string `json:"email" binding:"required,email"`
	Avatar string `json:"avatar"`
}

type SettleRequest struct {
	FromUserID string  `json:"fromUserId" binding:"required"`
	ToUserID   string  `json:"toUserId" binding:"required"`
	Amount     float64 `json:"amount" binding:"required,gt=0"`
	GroupID    string  `json:"groupId"`
}

type SettlePaymentRequest struct {
	PaymentMethod string  `json:"paymentMethod"`
	UpiID         string  `json:"upiId"`
	Amount        float64 `json:"amount"`
	Currency      string  `json:"currency"`
}

type UpdateProfileRequest struct {
	Name   string `json:"name"`
	Phone  string `json:"phone"`
	Avatar string `json:"avatar"`
}

type UpdatePasswordRequest struct {
	CurrentPassword string `json:"currentPassword" binding:"required"`
	NewPassword     string `json:"newPassword" binding:"required,min=6"`
}

// AnalyticsSummary represents the aggregated financial summary
type AnalyticsSummary struct {
	TotalExpenses float64            `json:"totalExpenses"`
	YouOwe        float64            `json:"youOwe"`
	YouAreOwed    float64            `json:"youAreOwed"`
	Settled       float64            `json:"settled"`
	RecentCount   int                `json:"recentCount"`
	CategoryTotal map[string]float64 `json:"categoryTotal"`
}

type MonthlySpendingItem struct {
	Month  string  `json:"month"`
	Amount float64 `json:"amount"`
}

type CategorySpendingItem struct {
	Category string  `json:"category"`
	Amount   float64 `json:"amount"`
	Count    int     `json:"count"`
}
