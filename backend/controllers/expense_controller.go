package controllers

import (
	"net/http"

	"expenseflow-backend/models"
	"expenseflow-backend/repositories"
	"expenseflow-backend/services"
	"expenseflow-backend/utils"
	"github.com/gin-gonic/gin"
)

type ExpenseController struct {
	repo    repositories.Repository
	service *services.ExpenseService
}

func NewExpenseController(repo repositories.Repository, service *services.ExpenseService) *ExpenseController {
	return &ExpenseController{repo: repo, service: service}
}

func (ec *ExpenseController) GetAll(c *gin.Context) {
	userID := c.GetString("userId")
	category := c.Query("category")
	splitType := c.Query("splitType")
	search := c.Query("search")

	list, err := ec.repo.GetAllExpenses(userID, category, splitType, search)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load expenses")
		return
	}

	if list == nil {
		list = []models.Expense{}
	}

	utils.SuccessResponse(c, http.StatusOK, "Expenses retrieved", list)
}

func (ec *ExpenseController) GetByID(c *gin.Context) {
	id := c.Param("id")
	exp, err := ec.repo.GetExpenseByID(id)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Expense not found")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Expense details", exp)
}

func (ec *ExpenseController) Create(c *gin.Context) {
	var req models.CreateExpenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid expense data: "+err.Error())
		return
	}

	creatorID := c.GetString("userId")
	if creatorID == "" {
		creatorID = "u1"
	}

	exp, err := ec.service.CreateExpense(&req, creatorID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Expense created successfully", exp)
}

func (ec *ExpenseController) Update(c *gin.Context) {
	id := c.Param("id")
	var req models.CreateExpenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid expense data: "+err.Error())
		return
	}

	exp, err := ec.service.UpdateExpense(id, &req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Expense updated successfully", exp)
}

func (ec *ExpenseController) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := ec.service.DeleteExpense(id); err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Expense not found or could not be deleted")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Expense deleted successfully", gin.H{"id": id})
}
