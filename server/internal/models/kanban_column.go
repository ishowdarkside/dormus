package models

import (
	"context"
	"time"
)

type KanbanColumn struct {
	Id        string    `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"-"`
}

type KanbanColumnModel struct {
	DB QueryAble
}

func (m *KanbanColumnModel) GetById(id string) (*KanbanColumn, error) {

	var kanbanColumn KanbanColumn
	query := `SELECT id, name, created_at FROM kanban_columns WHERE id = $1`
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

	defer cancel()
	err := m.DB.QueryRowContext(ctx, query, id).Scan(&kanbanColumn.Id, &kanbanColumn.Name, &kanbanColumn.CreatedAt)
	return &kanbanColumn, err
}

func (m *KanbanColumnModel) GetAll() ([]*KanbanColumn, error) {

	kanbanColumns := make([]*KanbanColumn, 0)
	query := "SELECT id, name, created_at FROM kanban_columns"

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	for rows.Next() {

		kanbanColumn := KanbanColumn{}
		err := rows.Scan(&kanbanColumn.Id, &kanbanColumn.Name, &kanbanColumn.CreatedAt)
		if err != nil {
			return nil, err
		}

		kanbanColumns = append(kanbanColumns, &kanbanColumn)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return kanbanColumns, nil

}
