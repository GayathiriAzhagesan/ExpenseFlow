package controllers

import (
	"net/http"

	"expenseflow-backend/models"
	"expenseflow-backend/repositories"
	"expenseflow-backend/services"
	"expenseflow-backend/utils"
	"github.com/gin-gonic/gin"
)

type SettlementController struct {
	repo    repositories.Repository
	service *services.SettlementService
}

func NewSettlementController(repo repositories.Repository, service *services.SettlementService) *SettlementController {
	return &SettlementController{repo: repo, service: service}
}

func (sc *SettlementController) GetAll(c *gin.Context) {
	userID := c.GetString("userId")
	groupID := c.Query("groupId")

	settlements, err := sc.repo.GetAllSettlements(userID, groupID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load settlements")
		return
	}

	if settlements == nil {
		settlements = []models.Settlement{}
	}

	utils.SuccessResponse(c, http.StatusOK, "Settlements retrieved", settlements)
}

func (sc *SettlementController) Create(c *gin.Context) {
	var req models.SettleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid settlement data: "+err.Error())
		return
	}

	st, err := sc.service.CreateSettlement(&req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Settlement requested", st)
}

func (sc *SettlementController) Settle(c *gin.Context) {
	id := c.Param("id")

	var req models.SettlePaymentRequest
	_ = c.ShouldBindJSON(&req) // optional

	st, err := sc.service.SettlePayment(id, &req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Settlement completed successfully", st)
}
