package utils

import (
	"github.com/gin-gonic/gin"
)

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

// SuccessResponse sends a standard JSON success response
func SuccessResponse(c *gin.Context, code int, message string, data interface{}) {
	c.JSON(code, APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// ErrorResponse sends a standard JSON error response
func ErrorResponse(c *gin.Context, code int, message string) {
	c.JSON(code, APIResponse{
		Success: false,
		Message: message,
	})
}
