package controllers

import (
	"fmt"
	"net/http"
	"time"

	"expenseflow-backend/config"
	"expenseflow-backend/models"
	"expenseflow-backend/repositories"
	"expenseflow-backend/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AuthController struct {
	repo repositories.Repository
	cfg  *config.Config
}

func NewAuthController(repo repositories.Repository, cfg *config.Config) *AuthController {
	return &AuthController{repo: repo, cfg: cfg}
}

func (ac *AuthController) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request payload: "+err.Error())
		return
	}

	if req.Password != req.ConfirmPassword {
		utils.ErrorResponse(c, http.StatusBadRequest, "Passwords do not match")
		return
	}

	// Check if user exists
	if existing, _ := ac.repo.FindUserByEmail(req.Email); existing != nil {
		utils.ErrorResponse(c, http.StatusConflict, "Email already registered. Please log in.")
		return
	}

	passHash, err := utils.HashPassword(req.Password)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to hash password")
		return
	}

	userID := uuid.New().String()
	avatar := fmt.Sprintf("https://api.dicebear.com/7.x/avataaars/svg?seed=%s", req.Name)

	now := time.Now()
	user := &models.User{
		ID:           userID,
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: passHash,
		Avatar:       avatar,
		Phone:        "",
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if err := ac.repo.CreateUser(user); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Could not save user: "+err.Error())
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Email, user.Name, ac.cfg.JWTSecret)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Could not generate auth token")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "User registered successfully", gin.H{
		"token": token,
		"user": gin.H{
			"id":     user.ID,
			"name":   user.Name,
			"email":  user.Email,
			"avatar": user.Avatar,
		},
	})
}

func (ac *AuthController) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Please provide a valid email and password: "+err.Error())
		return
	}

	user, err := ac.repo.FindUserByEmail(req.Email)
	if err != nil || user == nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	if !utils.CheckPassword(user.PasswordHash, req.Password) {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Email, user.Name, ac.cfg.JWTSecret)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Could not generate auth token")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Login successful", gin.H{
		"token": token,
		"user": gin.H{
			"id":     user.ID,
			"name":   user.Name,
			"email":  user.Email,
			"avatar": user.Avatar,
			"phone":  user.Phone,
		},
	})
}

func (ac *AuthController) GetMe(c *gin.Context) {
	userID := c.GetString("userId")
	if userID == "" {
		userID = "u1"
	}

	user, err := ac.repo.FindUserByID(userID)
	if err != nil || user == nil {
		utils.ErrorResponse(c, http.StatusNotFound, "User not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "User details retrieved", gin.H{
		"id":        user.ID,
		"name":      user.Name,
		"email":     user.Email,
		"avatar":    user.Avatar,
		"phone":     user.Phone,
		"createdAt": user.CreatedAt,
	})
}

func (ac *AuthController) Logout(c *gin.Context) {
	utils.SuccessResponse(c, http.StatusOK, "Logged out successfully", nil)
}
