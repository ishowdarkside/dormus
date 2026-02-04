package models

import (
	"context"
	"database/sql"
)

type QueryAble interface {
	ExecContext(ctx context.Context, query string, args ...any) (sql.Result, error)
	QueryContext(ctx context.Context, query string, args ...any) (*sql.Rows, error)
	QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row
}
type Models struct {
	FamilyModel             *FamilyModel
	UserModel               *UserModel
	SessionModel            *SessionModel
	StatusModel             *StatusModel
	KanbanColumnModel       *KanbanColumnModel
	KanbanTaskModel         *KanbanTaskModel
	KanbanTaskAssigneeModel *KanbanTaskAssigneeModel
	NoteModel               *NoteModel
	BillModel               *BillModel
	BudgetModel             *BudgetModel
}

func InitializeWithTx(tx *sql.Tx) *Models {

	return &Models{
		FamilyModel:             &FamilyModel{DB: tx},
		UserModel:               &UserModel{DB: tx},
		SessionModel:            &SessionModel{DB: tx},
		StatusModel:             &StatusModel{DB: tx},
		KanbanColumnModel:       &KanbanColumnModel{DB: tx},
		KanbanTaskModel:         &KanbanTaskModel{DB: tx},
		KanbanTaskAssigneeModel: &KanbanTaskAssigneeModel{DB: tx},
		NoteModel:               &NoteModel{DB: tx},
		BillModel:               &BillModel{DB: tx},
		BudgetModel:             &BudgetModel{DB: tx},
	}
}

func InitializeModels(db *sql.DB) *Models {
	return &Models{
		FamilyModel:             &FamilyModel{DB: db},
		UserModel:               &UserModel{DB: db},
		SessionModel:            &SessionModel{DB: db},
		StatusModel:             &StatusModel{DB: db},
		KanbanColumnModel:       &KanbanColumnModel{DB: db},
		KanbanTaskModel:         &KanbanTaskModel{DB: db},
		KanbanTaskAssigneeModel: &KanbanTaskAssigneeModel{DB: db},
		NoteModel:               &NoteModel{DB: db},
		BillModel:               &BillModel{DB: db},
		BudgetModel:             &BudgetModel{DB: db},
	}
}
