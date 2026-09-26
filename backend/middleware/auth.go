package middleware

import (
	"net/http"
	"strings"

	"expenseflow-backend/utils"
	"github.com/gin-gonic/gin"
)

// AuthMiddleware validates JWT Bearer tokens
func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			// For easy sandbox / local demo: provide fallback test user if no token provided
			c.Set("userId", "u1")
			c.Set("userEmail", "gayathiri@expenseflow.dev")
			c.Set("userName", "Gayathiri")
			c.Next()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid authorization header format")
			c.Abort()
			return
		}

		tokenStr := parts[1]
		claims, err := utils.ValidateToken(tokenStr, jwtSecret)
		if err != nil {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid or expired token")
			c.Abort()
			return
		}

		c.Set("userId", claims.UserID)
		c.Set("userEmail", claims.Email)
		c.Set("userName", claims.Name)
		c.Next()
	}
}
