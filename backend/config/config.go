package config

import (
	"bufio"
	"os"
	"strings"
)

type Config struct {
	Port        string
	MongoURI    string
	DBName      string
	JWTSecret   string
	FrontendURL string
}

func loadDotEnv() {
	envFiles := []string{".env", "../.env", "backend/.env"}
	for _, f := range envFiles {
		file, err := os.Open(f)
		if err != nil {
			continue
		}
		defer file.Close()

		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			line := strings.TrimSpace(scanner.Text())
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}
			parts := strings.SplitN(line, "=", 2)
			if len(parts) == 2 {
				key := strings.TrimSpace(parts[0])
				val := strings.TrimSpace(parts[1])
				// remove enclosing quotes if present
				val = strings.Trim(val, `"'`)
				if os.Getenv(key) == "" {
					_ = os.Setenv(key, val)
				}
			}
		}
		break
	}
}

func LoadConfig() *Config {
	loadDotEnv()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		mongoURI = "mongodb+srv://gayathrig12001_db_user:Gayathiri1719@live-poll-cluster.rebwgqc.mongodb.net/expenseflow?retryWrites=true&w=majority&appName=live-poll-cluster"
	}

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "expenseflow"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "expenseflow_super_secret_jwt_key_2026_fintech_secure"
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "*"
	}

	return &Config{
		Port:        port,
		MongoURI:    mongoURI,
		DBName:      dbName,
		JWTSecret:   jwtSecret,
		FrontendURL: frontendURL,
	}
}
