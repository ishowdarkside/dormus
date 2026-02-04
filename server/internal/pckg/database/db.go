package database

import (
	"context"
	"database/sql"
	"time"

	_ "github.com/lib/pq"

	"github.com/ishowdarkside/family-manager/config"
)

func Open(cfg *config.Config) (*sql.DB, error) {

	db, err := sql.Open("postgres", cfg.DB.DSN)
	if err != nil {
		return nil, err
	}

	db.SetMaxIdleConns(cfg.DB.MaxIdleConns)
	db.SetMaxOpenConns(cfg.DB.MaxOpenConns)
	db.SetConnMaxIdleTime(cfg.DB.MaxIdleTime)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	err = db.PingContext(ctx)

	if err != nil {
		return nil, err
	}

	return db, err
}
