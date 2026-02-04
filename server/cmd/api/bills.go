package main

import (
	"database/sql"
	"errors"
	"net/http"
	"time"

	"github.com/ishowdarkside/family-manager/internal/common"
	"github.com/ishowdarkside/family-manager/internal/models"
)

func (app *Application) createBill(w http.ResponseWriter, r *http.Request) {

	v := common.InitializeValidator()
	user := app.contextGetUser(r)

	var payload struct {
		DueDate time.Time `json:"due_date"`
		Name    string    `json:"name"`
		Price   float64   `json:"price"`
	}

	err := app.readJSON(w, r, &payload)
	if err != nil {
		app.responseError(w, r, http.StatusBadRequest, nil, err.Error())
		return
	}

	bill := &models.Bill{DueDate: payload.DueDate, Name: payload.Name, Status: models.BillStatusNotPaid, Price: payload.Price, FamilyId: user.FamilyId, CreatorId: user.Id}
	bill.Validate(v)

	if !v.Valid {
		app.failedValidationError(w, r, v.Errors)
		return
	}

	err = app.models.BillModel.Insert(bill)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	app.ws.broadcast <- WSMessage{FamilyId: user.FamilyId, Data: WebsocketResponseModel{Action: WebsocketResponseActionUpsert, Model: "bill", Data: bill}}

	err = app.writeJSON(w, http.StatusCreated, envelope{"status": "success", "bill": bill, "message": "bill_created"}, nil)
	if err != nil {
		app.serverError(w, r, err)
	}

}

func (app *Application) getBillsForFamily(w http.ResponseWriter, r *http.Request) {

	user := app.contextGetUser(r)

	bills, err := app.models.BillModel.GetForFamily(user.FamilyId)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"status": "success", "bills": bills}, nil)
	if err != nil {
		app.serverError(w, r, err)
	}
}

func (app *Application) updateBill(w http.ResponseWriter, r *http.Request) {

	user := app.contextGetUser(r)
	id, err := app.readIDFromParams(r)
	if err != nil {
		app.responseError(w, r, http.StatusBadRequest, nil, err.Error())
		return
	}

	var payload struct {
		Status  models.BillStatus `json:"status"`
		Name    string            `json:"name"`
		Price   float64           `json:"price"`
		DueDate time.Time         `json:"due_date"`
	}

	err = app.readJSON(w, r, &payload)

	if err != nil {
		app.responseError(w, r, http.StatusBadRequest, nil, err.Error())
		return
	}

	bill, err := app.models.BillModel.GetById(int(id), user.FamilyId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			app.resourceNotFoundError(w, r)
			return
		}

		app.serverError(w, r, err)
	}

	bill.Status = payload.Status
	bill.Price = payload.Price
	bill.Name = payload.Name
	bill.DueDate = payload.DueDate

	v := common.InitializeValidator()
	bill.Validate(v)

	if !v.Valid {
		app.failedValidationError(w, r, v.Errors)
		return
	}

	err = app.models.BillModel.Update(bill)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	app.ws.broadcast <- WSMessage{FamilyId: user.FamilyId, Data: WebsocketResponseModel{Action: WebsocketResponseActionUpsert, Model: "bill", Data: bill}}
	err = app.writeJSON(w, http.StatusOK, envelope{"status": "success", "message": "bill_updated"}, nil)
	if err != nil {
		app.serverError(w, r, err)
	}

}

func (app *Application) deleteBill(w http.ResponseWriter, r *http.Request) {

	user := app.contextGetUser(r)
	id, err := app.readIDFromParams(r)
	if err != nil {
		app.responseError(w, r, http.StatusBadRequest, nil, err.Error())
		return
	}

	err = app.models.BillModel.DeleteById(int(id), user.FamilyId)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	app.ws.broadcast <- WSMessage{FamilyId: user.FamilyId, Data: WebsocketResponseModel{Model: "bill", Action: WebsocketResponseActionDelete, Data: envelope{"id": id}}}
	err = app.writeJSON(w, http.StatusNoContent, nil, nil)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

}
