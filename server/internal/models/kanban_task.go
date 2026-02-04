package models

import (
	"context"
	"time"

	"github.com/ishowdarkside/family-manager/internal/common"
)

type KanbanTask struct {
	Id          int                `json:"id"`
	ColumnId    string             `json:"column_id"`
	Title       string             `json:"title"`
	Description string             `json:"description,omitzero"`
	CreatedAt   time.Time          `json:"created_at"`
	FamilyId    int                `json:"family_id"`
	CreatorId   int                `json:"creator_id"`
	Priority    KanbanTaskPriority `json:"priority"`
}

type KanbanTaskModel struct {
	DB QueryAble
}

func (m *KanbanTaskModel) GetForFamily(familyId int) ([]*KanbanTask, error) {

	var kanbanTasks []*KanbanTask
	query := "SELECT id,family_id,title,description,column_id,created_at, creator_id, priority from kanban_tasks WHERE family_id = $1 ORDER BY id"

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, familyId)
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	for rows.Next() {

		task := KanbanTask{}
		err := rows.Scan(&task.Id, &task.FamilyId, &task.Title, &task.Description, &task.ColumnId, &task.CreatedAt, &task.CreatorId, &task.Priority)
		if err != nil {
			return nil, err
		}

		kanbanTasks = append(kanbanTasks, &task)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return kanbanTasks, nil

}

func (m *KanbanTaskModel) DeleteById(taskId, familyId int) error {

	query := "DELETE FROM kanban_tasks WHERE id = $1 AND family_id = $2"
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := m.DB.ExecContext(ctx, query, taskId, familyId)
	return err
}

func (m *KanbanTaskModel) GetById(id, familyId int) (*KanbanTask, error) {

	var kanbanTask KanbanTask
	query := "SELECT id, title, description, family_id, creator_id, created_at, column_id, priority FROM kanban_tasks WHERE id = $1 AND family_id = $2"
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

	defer cancel()
	err := m.DB.QueryRowContext(ctx, query, id, familyId).Scan(&kanbanTask.Id, &kanbanTask.Title, &kanbanTask.Description, &kanbanTask.FamilyId, &kanbanTask.CreatorId, &kanbanTask.CreatedAt, &kanbanTask.ColumnId, &kanbanTask.Priority)
	if err != nil {
		return nil, err
	}

	return &kanbanTask, nil
}

func (m *KanbanTaskModel) Update(task *KanbanTask) error {

	query := "UPDATE kanban_tasks SET title = $1, description = $2, column_id = $3, priority = $4 WHERE id = $5 AND family_id = $6"
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := m.DB.ExecContext(ctx, query, task.Title, task.Description, task.ColumnId, task.Priority, task.Id, task.FamilyId)
	return err
}

func (m *KanbanTaskModel) Insert(data *KanbanTask) error {

	query := "INSERT INTO kanban_tasks (column_id, title, description, family_id, creator_id, priority) VALUES ($1, $2, $3, $4, $5, $6) RETURNING  id, created_at"
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, data.ColumnId, data.Title, data.Description, data.FamilyId, data.CreatorId, data.Priority).Scan(&data.Id, &data.CreatedAt)
	return err
}

func (kanban *KanbanTask) Validate(v *common.Validator) {

	v.Check(kanban.Priority == 0, "priority", "must_be_provided")
	v.Check(!kanban.Priority.Validate(), "priority", "not_valid")
	v.Check(kanban.Title == "", "title", "must be valid")

}

func (kanban *KanbanTask) HasPermissionToPerformOrIsParent(u *User) bool {
	return u.Id == kanban.CreatorId || u.Role == UserRoleParent
}
