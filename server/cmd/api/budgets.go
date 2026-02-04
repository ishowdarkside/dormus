package main

import (
	"net/http"

	"github.com/ishowdarkside/family-manager/internal/common"
	"github.com/ishowdarkside/family-manager/internal/models"
)

func (app *Application) createBudgetItem(w http.ResponseWriter, r *http.Request) {

	user := app.contextGetUser(r)

	var payload struct {
		Name  string  `json:"name"`
		Price float64 `json:"price"`
	}

	err := app.readJSON(w, r, &payload)
	if err != nil {
		app.responseError(w, r, http.StatusBadRequest, nil, err.Error())
		return
	}

	v := common.InitializeValidator()
	budget := models.Budget{Name: payload.Name, Price: payload.Price, CreatorId: user.Id, FamilyId: user.FamilyId, Progress: 0}

	budget.Validate(v)
	if !v.Valid {
		app.failedValidationError(w, r, v.Errors)
		return
	}

	err = app.models.BudgetModel.Insert(&budget)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	app.ws.broadcast <- WSMessage{FamilyId: user.FamilyId, Data: WebsocketResponseModel{Action: WebsocketResponseActionUpsert, Model: "budget", Data: budget}}
	err = app.writeJSON(w, http.StatusCreated, envelope{"status": "success", "message": "budget_created", "budget": budget}, nil)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

}

func (app *Application) getBudgetItemsForFamily(w http.ResponseWriter, r *http.Request) {

	user := app.contextGetUser(r)
	budgets, err := app.models.BudgetModel.GetForFamily(user.FamilyId)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"status": "success", "budgets": budgets}, nil)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

}

func (app *Application) updateBudgetItem(w http.ResponseWriter, r *http.Request) {

	v := common.InitializeValidator()
	var payload struct {
		Name     string  `json:"name"`
		Price    float64 `json:"price"`
		Progress float64 `json:"progress"`
	}

	err := app.readJSON(w, r, &payload)
	if err != nil {
		app.responseError(w, r, http.StatusBadRequest, nil, err.Error())
		return
	}

	v.Check(payload.Progress < 0, "progress", "must_be_positive_integer")

}
