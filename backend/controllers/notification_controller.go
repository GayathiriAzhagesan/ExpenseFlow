package controllers

import (
	"net/http"

	"expenseflow-backend/models"
	"expenseflow-backend/repositories"
	"expenseflow-backend/utils"
	"github.com/gin-gonic/gin"
)

type NotificationController struct {
	repo repositories.Repository
}

func NewNotificationController(repo repositories.Repository) *NotificationController {
	return &NotificationController{repo: repo}
}

func (nc *NotificationController) GetAll(c *gin.Context) {
	userID := c.GetString("userId")
	if userID == "" {
		userID = "u1"
	}

	list, err := nc.repo.GetAllNotifications(userID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load notifications")
		return
	}

	if list == nil {
		list = []models.Notification{}
	}

	utils.SuccessResponse(c, http.StatusOK, "Notifications retrieved", list)
}

func (nc *NotificationController) MarkAsRead(c *gin.Context) {
	id := c.Param("id")
	userID := c.GetString("userId")
	if userID == "" {
		userID = "u1"
	}

	if err := nc.repo.MarkNotificationAsRead(id, userID); err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Notification not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Notification marked as read", gin.H{"id": id})
}

func (nc *NotificationController) MarkAllAsRead(c *gin.Context) {
	userID := c.GetString("userId")
	if userID == "" {
		userID = "u1"
	}

	_ = nc.repo.MarkAllNotificationsAsRead(userID)
	utils.SuccessResponse(c, http.StatusOK, "All notifications marked as read", nil)
}
