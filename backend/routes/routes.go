package routes

import (
	"expenseflow-backend/config"
	"expenseflow-backend/controllers"
	"expenseflow-backend/middleware"
	"expenseflow-backend/websocket"
	"github.com/gin-gonic/gin"
)

type RouterDependencies struct {
	AuthCtrl         *controllers.AuthController
	UserCtrl         *controllers.UserController
	ExpenseCtrl      *controllers.ExpenseController
	GroupCtrl        *controllers.GroupController
	SettlementCtrl   *controllers.SettlementController
	AnalyticsCtrl    *controllers.AnalyticsController
	NotificationCtrl *controllers.NotificationController
	Config           *config.Config
	Hub              *websocket.Hub
}

func SetupRoutes(r *gin.Engine, deps *RouterDependencies) {
	// Root health check
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "online",
			"app":     "ExpenseFlow API",
			"version": "1.0.0",
		})
	})

	api := r.Group("/api")
	{
		// WebSocket endpoint
		api.GET("/ws", func(c *gin.Context) {
			websocket.ServeWs(deps.Hub, c)
		})

		// Public Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", deps.AuthCtrl.Register)
			auth.POST("/login", deps.AuthCtrl.Login)
			auth.POST("/logout", deps.AuthCtrl.Logout)
			auth.GET("/me", middleware.AuthMiddleware(deps.Config.JWTSecret), deps.AuthCtrl.GetMe)
		}

		// Authenticated Routes
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware(deps.Config.JWTSecret))
		{
			// Users
			users := protected.Group("/users")
			{
				users.GET("/profile", deps.UserCtrl.GetProfile)
				users.PUT("/profile", deps.UserCtrl.UpdateProfile)
				users.PUT("/password", deps.UserCtrl.UpdatePassword)
			}

			// Expenses
			expenses := protected.Group("/expenses")
			{
				expenses.GET("", deps.ExpenseCtrl.GetAll)
				expenses.GET("/:id", deps.ExpenseCtrl.GetByID)
				expenses.POST("", deps.ExpenseCtrl.Create)
				expenses.PUT("/:id", deps.ExpenseCtrl.Update)
				expenses.DELETE("/:id", deps.ExpenseCtrl.Delete)
			}

			// Groups
			groups := protected.Group("/groups")
			{
				groups.GET("", deps.GroupCtrl.GetAll)
				groups.GET("/:id", deps.GroupCtrl.GetByID)
				groups.POST("", deps.GroupCtrl.Create)
				groups.PUT("/:id", deps.GroupCtrl.Update)
				groups.DELETE("/:id", deps.GroupCtrl.Delete)
				groups.POST("/:id/members", deps.GroupCtrl.AddMember)
				groups.DELETE("/:id/members/:userId", deps.GroupCtrl.RemoveMember)
			}

			// Settlements
			settlements := protected.Group("/settlements")
			{
				settlements.GET("", deps.SettlementCtrl.GetAll)
				settlements.POST("", deps.SettlementCtrl.Create)
				settlements.PUT("/:id/settle", deps.SettlementCtrl.Settle)
			}

			// Analytics
			analytics := protected.Group("/analytics")
			{
				analytics.GET("/summary", deps.AnalyticsCtrl.GetSummary)
				analytics.GET("/monthly", deps.AnalyticsCtrl.GetMonthly)
				analytics.GET("/categories", deps.AnalyticsCtrl.GetCategories)
			}

			// Notifications
			notifications := protected.Group("/notifications")
			{
				notifications.GET("", deps.NotificationCtrl.GetAll)
				notifications.PUT("/:id/read", deps.NotificationCtrl.MarkAsRead)
				notifications.PUT("/read-all", deps.NotificationCtrl.MarkAllAsRead)
			}
		}
	}
}
