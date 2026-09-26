package controllers

import (
	"net/http"

	"expenseflow-backend/models"
	"expenseflow-backend/repositories"
	"expenseflow-backend/utils"
	"github.com/gin-gonic/gin"
)

type UserController struct {
	repo repositories.Repository
}

func NewUserController(repo repositories.Repository) *UserController {
	return &UserController{repo: repo}
}

func (uc *UserController) GetProfile(c *gin.Context) {
	userID := c.GetString("userId")
	if userID == "" {
		userID = "u1"
	}

	user, err := uc.repo.FindUserByID(userID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "User not found")
		return
	}

	groups, _ := uc.repo.GetAllGroups(userID)
	settlements, _ := uc.repo.GetAllSettlements(userID, "")
	expenses, _ := uc.repo.GetAllExpenses(userID, "", "", "")

	var amountPaid float64
	var amountReceived float64

	for _, e := range expenses {
		if e.PaidBy.ID == userID {
			amountPaid += e.Amount
		}
	}

	for _, s := range settlements {
		if s.Status == "settled" {
			if s.FromUser.ID == userID {
				amountPaid += s.Amount
			}
			if s.ToUser.ID == userID {
				amountReceived += s.Amount
			}
		}
	}

	utils.SuccessResponse(c, http.StatusOK, "Profile retrieved", gin.H{
		"user":           user,
		"totalExpenses":  len(expenses),
		"totalGroups":    len(groups),
		"settlements":    len(settlements),
		"amountPaid":     amountPaid,
		"amountReceived": amountReceived,
	})
}

func (uc *UserController) UpdateProfile(c *gin.Context) {
	userID := c.GetString("userId")
	if userID == "" {
		userID = "u1"
	}

	user, err := uc.repo.FindUserByID(userID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "User not found")
		return
	}

	var req models.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid profile payload")
		return
	}

	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}
	if req.Avatar != "" {
		user.Avatar = req.Avatar
	}

	if err := uc.repo.UpdateUser(user); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update profile")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Profile updated successfully", user)
}

func (uc *UserController) UpdatePassword(c *gin.Context) {
	userID := c.GetString("userId")
	if userID == "" {
		userID = "u1"
	}

	user, err := uc.repo.FindUserByID(userID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "User not found")
		return
	}

	var req models.UpdatePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid password payload")
		return
	}

	if !utils.CheckPassword(user.PasswordHash, req.CurrentPassword) {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Current password does not match")
		return
	}

	newHash, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Could not hash new password")
		return
	}

	user.PasswordHash = newHash
	_ = uc.repo.UpdateUser(user)

	utils.SuccessResponse(c, http.StatusOK, "Password changed successfully", nil)
}
