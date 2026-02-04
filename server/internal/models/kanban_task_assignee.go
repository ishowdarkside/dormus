package models

import (
	"context"
	"time"

	"github.com/lib/pq"
)

type KanbanTaskAssignee struct {
	Id         int       `json:"id"`
	UserId     int       `json:"user_id"`
	TaskId     int       `json:"task_id"`
	FamilyId   int       `json:"family_id"`
	AssignedAt time.Time `json:"assigned_at"`
}

type KanbanTaskAssigneePayloadModel struct {
	TaskId   int   `json:"task_id"`
	FamilyId int   `json:"family_id"`
	UserId   []int `json:"user_id"`
}

type KanbanTaskAssigneeModel struct {
	DB QueryAble
}

func (m *KanbanTaskAssigneeModel) SyncTaskAssignees(data *KanbanTaskAssigneePayloadModel) error {

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if len(data.UserId) == 0 {
		query := "DELETE FROM kanban_task_assignees WHERE task_id = $1 AND family_id = $2"
		_, err := m.DB.ExecContext(ctx, query, data.TaskId, data.FamilyId)
		if err != nil {
			return err
		}
	} else {
		query := `DELETE from kanban_task_assignees WHERE task_id = $1 AND family_id = $2 AND user_id != ALL($3)`
		_, err := m.DB.ExecContext(ctx, query, data.TaskId, data.FamilyId, pq.Array(data.UserId))
		if err != nil {
			return err
		}
	}

	if len(data.UserId) > 0 {
		query := `INSERT INTO kanban_task_assignees 
    (task_id, user_id, family_id) SELECT $1, unnest_id, $2 FROM unnest($3::bigint[]) AS unnest_id ON CONFLICT (task_id,user_id) DO NOTHING`

		_, err := m.DB.ExecContext(ctx, query, data.TaskId, data.FamilyId, pq.Array(data.UserId))
		if err != nil {
			return err
		}
	}

	return nil
}

func (m *KanbanTaskAssigneeModel) GetAllForFamily(familyId int) (*[]KanbanTaskAssignee, error) {

	query := `SELECT id, family_id, user_id, task_id, assigned_at FROM kanban_task_assignees WHERE family_id = $1`
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, familyId)
	if err != nil {
		return nil, err
	}

	assignments := make([]KanbanTaskAssignee, 0, 10)
	defer rows.Close()

	for rows.Next() {

		assignment := KanbanTaskAssignee{}
		err := rows.Scan(&assignment.Id, &assignment.FamilyId, &assignment.UserId, &assignment.TaskId, &assignment.AssignedAt)
		if err != nil {
			return nil, err
		}

		assignments = append(assignments, assignment)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return &assignments, nil

}
