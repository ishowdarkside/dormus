package main

import (
	"context"
	"database/sql"
	"os"

	"github.com/ishowdarkside/family-manager/config"
	"github.com/ishowdarkside/family-manager/internal/models"
	"github.com/ishowdarkside/family-manager/internal/pckg/database"
	"github.com/ishowdarkside/family-manager/internal/pckg/logger"
	"github.com/ishowdarkside/family-manager/internal/pckg/mailer"
)

type Application struct {
	config *config.Config
	logger *logger.Logger
	models *models.Models
	mailer *mailer.Mailer
	db     *sql.DB
	ws     *WebsocketHub
}

func main() {

	l := logger.NewLogger(os.Stdout, logger.LevelInfo)
	cfg, err := config.NewConfig()

	if err != nil {
		l.PrintFatal(err, nil)
	}

	db, err := database.Open(cfg)

	if err != nil {
		l.PrintFatal(err, nil)
	}
	defer db.Close()

	models := models.InitializeModels(db)
	m, err := mailer.New(cfg.SMTP.Host, cfg.SMTP.Port, cfg.SMTP.Username, cfg.SMTP.Password, cfg.SMTP.Sender)

	if err != nil {
		l.PrintFatal(err, nil)
	}

	hub := NewWebsocketHub()

	app := Application{config: cfg, logger: l, models: models, mailer: m, ws: hub, db: db}
	app.background(func() { app.ws.Run() })

	ctx, cancel := context.WithCancel(context.Background())
	app.background(func() { app.models.SessionModel.Cleanup(ctx) })

	defer cancel()

	if err := app.serve(); err != nil {

		cancel()
		app.logger.PrintFatal(err, nil)
	}

}
