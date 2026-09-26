package controllers

import (
	"net/http"

	"expenseflow-backend/services"
	"expenseflow-backend/utils"
	"github.com/gin-gonic/gin"
)

type AnalyticsController struct {
	service *services.AnalyticsService
}

func NewAnalyticsController(service *services.AnalyticsService) *AnalyticsController {
	return &AnalyticsController{service: service}
}

func (ac *AnalyticsController) GetSummary(c *gin.Context) {
	userID := c.GetString("userId")
	summary, err := ac.service.GetSummary(userID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to calculate summary")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Summary metrics", summary)
}

func (ac *AnalyticsController) GetMonthly(c *gin.Context) {
	userID := c.GetString("userId")
	monthly, err := ac.service.GetMonthlySpending(userID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load monthly data")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Monthly spending trends", monthly)
}

func (ac *AnalyticsController) GetCategories(c *gin.Context) {
	userID := c.GetString("userId")
	categories, err := ac.service.GetCategorySpending(userID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load category breakdown")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Category breakdown", categories)
}
