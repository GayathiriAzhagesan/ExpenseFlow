package main

import (
	"log"

	"expenseflow-backend/config"
	"expenseflow-backend/controllers"
	"expenseflow-backend/middleware"
	"expenseflow-backend/repositories"
	"expenseflow-backend/routes"
	"expenseflow-backend/services"
	"expenseflow-backend/websocket"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.LoadConfig()

	log.Println("==================================================")
	log.Println("⚡ Starting ExpenseFlow Backend Server (Go + Gin)")
	log.Printf("⚡ Port: %s | Environment: Production-Ready", cfg.Port)
	log.Println("==================================================")

	// 1. Initialize WebSocket Hub
	hub := websocket.NewHub()
	go hub.Run()

	// 2. Initialize Database Repository (MongoDB with automatic Memory Fallback)
	var repo repositories.Repository
	mongoRepo, err := repositories.NewMongoRepository(cfg.MongoURI, cfg.DBName)
	if err != nil {
		log.Printf("[Notice] MongoDB unavailable at %s: %v", cfg.MongoURI, err)
		log.Println("[Notice] Operating seamlessly in In-Memory High-Performance Mode with Seed Data.")
		repo = repositories.NewMemoryRepository()
	} else {
		log.Println("[MongoDB] Connected successfully to database:", cfg.DBName)
		repo = mongoRepo
	}

	// 3. Initialize Services
	expenseService := services.NewExpenseService(repo, hub)
	settlementService := services.NewSettlementService(repo, hub)
	analyticsService := services.NewAnalyticsService(repo)

	// 4. Initialize Controllers
	authCtrl := controllers.NewAuthController(repo, cfg)
	userCtrl := controllers.NewUserController(repo)
	expenseCtrl := controllers.NewExpenseController(repo, expenseService)
	groupCtrl := controllers.NewGroupController(repo, hub)
	settlementCtrl := controllers.NewSettlementController(repo, settlementService)
	analyticsCtrl := controllers.NewAnalyticsController(analyticsService)
	notifCtrl := controllers.NewNotificationController(repo)

	// 5. Initialize Gin Engine
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(gin.Logger())
	r.Use(middleware.CORSMiddleware())

	// 6. Setup Routes
	deps := &routes.RouterDependencies{
		AuthCtrl:         authCtrl,
		UserCtrl:         userCtrl,
		ExpenseCtrl:      expenseCtrl,
		GroupCtrl:        groupCtrl,
		SettlementCtrl:   settlementCtrl,
		AnalyticsCtrl:    analyticsCtrl,
		NotificationCtrl: notifCtrl,
		Config:           cfg,
		Hub:              hub,
	}
	routes.SetupRoutes(r, deps)

	// 7. Start HTTP Server
	addr := ":" + cfg.Port
	log.Printf("🚀 ExpenseFlow Server listening on %s (Live Production Ready)", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
