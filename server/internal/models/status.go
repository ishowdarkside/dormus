package models

import (
	"context"
	"errors"
	"time"

	"github.com/lib/pq"
)

var ErrorStatusAlreadyExists = errors.New("status already exists")

type Status struct {
	Id        int       `json:"id"`
	Status    string    `json:"string"`
	Emoji     string    `json:"emoji"`
	CreatedAt time.Time `json:"created_at"`
	UserId    int       `json:"user_id"`
}

type StatusModel struct {
	DB QueryAble
}

func (s *StatusModel) Insert(userId int, status *Status) error {

	query := `INSERT INTO status (status, emoji, user_id) VALUES ($1, $2, $3) RETURNING id, created_at`
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := s.DB.QueryRowContext(ctx, query, status.Status, status.Emoji, userId).Scan(&status.Id, &status.CreatedAt)

	if err != nil {

		var pqErr *pq.Error
		if errors.As(err, &pqErr) && pqErr.Constraint == "unique_user_status" {
			return ErrorStatusAlreadyExists
		}
		return err
	}

	return nil
}
