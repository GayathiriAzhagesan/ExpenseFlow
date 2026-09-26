package controllers

import (
	"fmt"
	"net/http"
	"time"

	"expenseflow-backend/models"
	"expenseflow-backend/repositories"
	"expenseflow-backend/utils"
	"expenseflow-backend/websocket"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type GroupController struct {
	repo repositories.Repository
	hub  *websocket.Hub
}

func NewGroupController(repo repositories.Repository, hub *websocket.Hub) *GroupController {
	return &GroupController{repo: repo, hub: hub}
}

func (gc *GroupController) GetAll(c *gin.Context) {
	userID := c.GetString("userId")
	groups, err := gc.repo.GetAllGroups(userID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load groups")
		return
	}

	if groups == nil {
		groups = []models.Group{}
	}

	utils.SuccessResponse(c, http.StatusOK, "Groups retrieved", groups)
}

func (gc *GroupController) GetByID(c *gin.Context) {
	id := c.Param("id")
	grp, err := gc.repo.GetGroupByID(id)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Group not found")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Group details", grp)
}

func (gc *GroupController) Create(c *gin.Context) {
	var req models.CreateGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid group data: "+err.Error())
		return
	}

	userID := c.GetString("userId")
	if userID == "" {
		userID = "u1"
	}

	creator, _ := gc.repo.FindUserByID(userID)
	creatorName := "Gayathiri"
	creatorEmail := "gayathiri@expenseflow.dev"
	creatorAvatar := "https://api.dicebear.com/7.x/avataaars/svg?seed=Gayathiri"
	if creator != nil {
		creatorName = creator.Name
		creatorEmail = creator.Email
		creatorAvatar = creator.Avatar
	}

	members := req.Members
	hasCreator := false
	for _, m := range members {
		if m.ID == userID || m.Email == creatorEmail {
			hasCreator = true
			break
		}
	}
	if !hasCreator {
		members = append([]models.GroupMember{{
			ID:     userID,
			Name:   creatorName,
			Email:  creatorEmail,
			Avatar: creatorAvatar,
			Role:   "admin",
			NetOwe: 0,
		}}, members...)
	}

	avatar := req.Avatar
	if avatar == "" {
		avatar = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300&q=80"
	}

	now := time.Now()
	grp := &models.Group{
		ID:            uuid.New().String(),
		Name:          req.Name,
		Description:   req.Description,
		Members:       members,
		CreatedBy:     userID,
		TotalExpenses: 0,
		Avatar:        avatar,
		CreatedAt:     now,
		UpdatedAt:     now,
	}

	if err := gc.repo.CreateGroup(grp); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create group")
		return
	}

	if gc.hub != nil {
		gc.hub.Broadcast("GROUP_CREATED", grp)
	}

	utils.SuccessResponse(c, http.StatusCreated, "Group created successfully", grp)
}

func (gc *GroupController) Update(c *gin.Context) {
	id := c.Param("id")
	grp, err := gc.repo.GetGroupByID(id)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Group not found")
		return
	}

	var req models.CreateGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid group update payload")
		return
	}

	if req.Name != "" {
		grp.Name = req.Name
	}
	if req.Description != "" {
		grp.Description = req.Description
	}
	if req.Avatar != "" {
		grp.Avatar = req.Avatar
	}
	grp.UpdatedAt = time.Now()

	if err := gc.repo.UpdateGroup(grp); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Could not update group")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Group updated successfully", grp)
}

func (gc *GroupController) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := gc.repo.DeleteGroup(id); err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Group not found")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Group deleted successfully", gin.H{"id": id})
}

func (gc *GroupController) AddMember(c *gin.Context) {
	groupID := c.Param("id")
	var req models.AddMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid member data")
		return
	}

	avatar := req.Avatar
	if avatar == "" {
		avatar = fmt.Sprintf("https://api.dicebear.com/7.x/avataaars/svg?seed=%s", req.Name)
	}

	newMember := models.GroupMember{
		ID:     uuid.New().String(),
		Name:   req.Name,
		Email:  req.Email,
		Avatar: avatar,
		Role:   "member",
		NetOwe: 0,
	}

	if err := gc.repo.AddMemberToGroup(groupID, newMember); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	grp, _ := gc.repo.GetGroupByID(groupID)
	if gc.hub != nil {
		gc.hub.Broadcast("GROUP_UPDATED", grp)
	}

	utils.SuccessResponse(c, http.StatusOK, "Member added successfully", newMember)
}

func (gc *GroupController) RemoveMember(c *gin.Context) {
	groupID := c.Param("id")
	memberID := c.Param("userId")

	if err := gc.repo.RemoveMemberFromGroup(groupID, memberID); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	grp, _ := gc.repo.GetGroupByID(groupID)
	if gc.hub != nil {
		gc.hub.Broadcast("GROUP_UPDATED", grp)
	}

	utils.SuccessResponse(c, http.StatusOK, "Member removed from group", gin.H{"userId": memberID})
}
