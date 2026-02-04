package models

import (
	"context"
	"time"

	"github.com/ishowdarkside/family-manager/internal/common"
)

type BillStatus string

const BillStatusPaid BillStatus = "paid"
const BillStatusNotPaid BillStatus = "not_paid"

type BillModel struct {
	DB QueryAble
}

func (m *BillModel) DeleteById(id, familyId int) error {

	query := `DELETE from bills WHERE id = $1 AND family_id = $2`
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := m.DB.ExecContext(ctx, query, id, familyId)
	return err
}

func (m *BillModel) GetForFamily(id int) ([]Bill, error) {

	query := `SELECT id, created_at, due_date, name, price, status, creator_id, family_id FROM bills WHERE family_id = $1`
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := m.DB.QueryContext(ctx, query, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	results := make([]Bill, 0, 10)
	for rows.Next() {
		bill := Bill{}
		err := rows.Scan(&bill.Id, &bill.CreatedAt, &bill.DueDate, &bill.Name, &bill.Price, &bill.Status, &bill.CreatorId, &bill.FamilyId)
		if err != nil {
			return nil, err
		}
		results = append(results, bill)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return results, nil

}

func (m *BillModel) Insert(bill *Bill) error {

	query := `INSERT INTO bills (due_date, name, price, status, creator_id, family_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, created_at`
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, bill.DueDate, bill.Name, bill.Price, bill.Status, bill.CreatorId, bill.FamilyId).Scan(&bill.Id, &bill.CreatedAt)
	return err

}

func (m *BillModel) GetById(id, familyId int) (*Bill, error) {

	query := `SELECT id,name,due_date,created_at,creator_id,family_id,price,status FROM bills WHERE id = $1 AND family_id = $2`
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var bill Bill
	err := m.DB.QueryRowContext(ctx, query, id, familyId).Scan(&bill.Id, &bill.Name, &bill.DueDate, &bill.CreatedAt, &bill.CreatorId, &bill.FamilyId, &bill.Price, &bill.Status)
	if err != nil {
		return nil, err
	}

	return &bill, nil
}

func (m *BillModel) Update(bill *Bill) error {

	query := `UPDATE bills SET name = $1, due_date = $2, price = $3, status = $4 WHERE id = $5 AND family_id = $6`
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := m.DB.ExecContext(ctx, query, bill.Name, bill.DueDate, bill.Price, bill.Status, bill.Id, bill.FamilyId)
	return err

}

type Bill struct {
	Id        int        `json:"id"`
	DueDate   time.Time  `json:"due_date"`
	CreatedAt time.Time  `json:"created_at"`
	Name      string     `json:"name"`
	Price     float64    `json:"price"`
	Status    BillStatus `json:"status"`
	CreatorId int        `json:"creator_id"`
	FamilyId  int        `json:"family_id"`
}

func (bill *Bill) Validate(v *common.Validator) {

	v.Check(bill.DueDate.Before(time.Now()), "due_date", "must_be_in_future")
	v.Check(bill.Name == "", "name", "must_be_provided")
	v.Check(bill.Price <= 0, "price", "must_be_positive_integer")
	v.Check(!common.PermittedValue(bill.Status, "paid", "not_paid"), "status", "invalid_status")

}
