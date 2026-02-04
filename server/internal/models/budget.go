package models

import (
	"context"
	"time"

	"github.com/ishowdarkside/family-manager/internal/common"
)

type BudgetModel struct {
	DB QueryAble
}

func (m *BudgetModel) Insert(budget *Budget) error {

	query := `INSERT INTO budget (name, price, progress, creator_id, family_id) VALUES ($1, $2,$3,$4,$5) RETURNING  id, created_at`
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, budget.Name, budget.Price, budget.Progress, budget.CreatorId, budget.FamilyId).Scan(&budget.Id, &budget.CreatedAt)
	return err

}

func (m *BudgetModel) GetForFamily(familyId int) ([]Budget, error) {

	query := `SELECT id, name, price, created_at, creator_id, family_id FROM budget WHERE family_id = $1`
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, familyId)
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	results := make([]Budget, 0, 10)
	for rows.Next() {
		item := Budget{}
		err := rows.Scan(&item.Id, &item.Name, &item.Price, &item.CreatedAt, &item.CreatorId, &item.FamilyId)

		if err != nil {
			return nil, err
		}

		results = append(results, item)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return results, nil

}

type Budget struct {
	Id        int       `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	Price     float64   `json:"price"`
	Progress  float64   `json:"progress"`
	CreatorId int       `json:"creator_id"`
	FamilyId  int       `json:"family_id"`
}

func (b *Budget) Validate(v *common.Validator) {

	v.Check(b.Name == "", "name", "must_be_provided")
	v.Check(b.Price <= 0, "price", "must_be_positive_integer")
}
