package config

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port   string
	Env    string
	WebURL string
	DB     struct {
		DSN          string
		MaxOpenConns int
		MaxIdleConns int
		MaxIdleTime  time.Duration
	}
	Limiter struct {
		RPS     int
		Burst   int
		Enabled bool
	}

	SMTP struct {
		Host     string
		Port     int
		Username string
		Password string
		Sender   string
	}
}

func NewConfig() (*Config, error) {

	var cfg Config
	err := godotenv.Load()

	if err != nil {
		return &cfg, err
	}

	cfg.Port = os.Getenv("PORT")
	cfg.Env = os.Getenv("ENV")
	cfg.WebURL = os.Getenv("WEB_URL")

	// limiter
	enabled, err := strconv.ParseBool(os.Getenv("LIMITER_ENABLED"))
	if err != nil {
		return nil, err
	}
	rps, err := strconv.Atoi(os.Getenv("LIMITER_RPS"))
	if err != nil {
		return nil, err
	}
	burst, err := strconv.Atoi(os.Getenv("LIMITER_BURST"))
	if err != nil {
		return nil, err
	}

	cfg.Limiter.Enabled = enabled
	cfg.Limiter.RPS = rps
	cfg.Limiter.Burst = burst

	//database
	dbURI := os.Getenv("DB_URI")
	if dbURI == "" {
		return nil, errors.New("DB URI is required")
	}
	dbMaxOpenConns, err := strconv.Atoi(os.Getenv("DB_MAX_OPEN_CONNS"))
	if err != nil {
		return nil, err
	}
	dbMaxIdleConns, err := strconv.Atoi(os.Getenv("DB_MAX_IDLE_CONNS"))
	if err != nil {
		return nil, err
	}
	dbMaxIdleTime, err := time.ParseDuration(os.Getenv("DB_MAX_IDLE_TIME"))
	if err != nil {
		return nil, err
	}

	cfg.DB.DSN = dbURI
	cfg.DB.MaxIdleConns = dbMaxIdleConns
	cfg.DB.MaxIdleTime = dbMaxIdleTime
	cfg.DB.MaxOpenConns = dbMaxOpenConns

	//Mailer
	mailHost := os.Getenv("MAIL_HOST")
	if mailHost == "" {
		return nil, errors.New("mail host  is required")
	}
	mailPort, err := strconv.Atoi(os.Getenv("MAIL_PORT"))
	if err != nil {
		return nil, err
	}
	mailUsername := os.Getenv("MAIL_USERNAME")
	if mailUsername == "" {
		return nil, errors.New("mail username is required")
	}
	mailPassword := os.Getenv("MAIL_PASSWORD")
	if mailPassword == "" {
		return nil, errors.New("mail password is required")
	}
	mailSender := os.Getenv("MAIL_SENDER")
	if mailSender == "" {
		return nil, errors.New("mail sender is required")
	}

	cfg.SMTP.Host = mailHost
	cfg.SMTP.Password = mailPassword
	cfg.SMTP.Port = mailPort
	cfg.SMTP.Username = mailUsername
	cfg.SMTP.Sender = mailSender

	fmt.Println(cfg.SMTP)

	return &cfg, nil

}
