package models

import (
	"context"
	"time"

	"github.com/ishowdarkside/family-manager/internal/common"
)

type NoteModel struct {
	DB QueryAble
}

func (m *NoteModel) GetById(id int) (*Note, error) {

	query := "SELECT id, title, is_pinned, created_by, family_id, created_at, created_by FROM notes WHERE id = $1"
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var note Note
	err := m.DB.QueryRowContext(ctx, query, id).Scan(&note.Id, &note.Title, &note.IsPinned, &note.CreatedBy, &note.FamilyId, &note.CreatedAt, &note.CreatedBy)

	if err != nil {
		return nil, err
	}

	return &note, nil
}

func (m *NoteModel) RemoveById(id, familyId int) error {

	query := `DELETE FROM notes WHERE id = $1 AND family_id = $2`
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := m.DB.ExecContext(ctx, query, id, familyId)
	return err

}

func (m *NoteModel) Update(note *Note) error {

	query := "UPDATE notes SET title = $1, description = $2, is_pinned = $3 WHERE id = $4"
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := m.DB.ExecContext(ctx, query, note.Title, note.Description, note.IsPinned, note.Id)
	return err
}

func (m *NoteModel) Insert(note *Note) error {

	query := `INSERT INTO notes (title,description,is_pinned,created_by,family_id) VALUES ($1, $2, $3, $4, $5) RETURNING id,created_at`
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	return m.DB.QueryRowContext(ctx, query, note.Title, note.Description, note.IsPinned, note.CreatedBy, note.FamilyId).Scan(&note.Id, &note.CreatedAt)

}

func (m *NoteModel) GetAllForFamily(familyId int) ([]Note, error) {

	query := `SELECT id, created_at, created_by, title, description, is_pinned, family_id FROM notes WHERE family_id = $1 ORDER BY is_pinned DESC`
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	results := []Note{}
	rows, err := m.DB.QueryContext(ctx, query, familyId)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {

		note := Note{}
		err := rows.Scan(&note.Id, &note.CreatedAt, &note.CreatedBy, &note.Title, &note.Description, &note.IsPinned, &note.FamilyId)
		if err != nil {
			return nil, err
		}
		results = append(results, note)

	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return results, nil

}

type Note struct {
	Id          int       `json:"id"`
	CreatedAt   time.Time `json:"created_at"`
	CreatedBy   int       `json:"created_by"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	IsPinned    bool      `json:"is_pinned"`
	FamilyId    int       `json:"family_id"`
}

func ValidateNote(v *common.Validator, note *Note) {
	v.Check(note.Title == "", "title", "must be provided")
}
