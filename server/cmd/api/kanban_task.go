package main

import (
	"database/sql"
	"errors"
	"net/http"

	"github.com/ishowdarkside/family-manager/internal/common"
	"github.com/ishowdarkside/family-manager/internal/models"
)

func (app *Application) retrieveAllFamilyTasks(w http.ResponseWriter, r *http.Request) {

	user := app.contextGetUser(r)

	rows, err := app.models.KanbanTaskModel.GetForFamily(user.FamilyId)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"status": "success", "data": rows}, nil)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

}

func (app *Application) createKanbanTask(w http.ResponseWriter, r *http.Request) {

	v := common.InitializeValidator()
	user := app.contextGetUser(r)
	var payload struct {
		ColumnId    string                    `json:"column_id"`
		Title       string                    `json:"title"`
		Description string                    `json:"description"`
		Priority    models.KanbanTaskPriority `json:"priority"`
	}

	err := app.readJSON(w, r, &payload)
	if err != nil {
		app.responseError(w, r, http.StatusBadRequest, nil, err.Error())
		return
	}

	task := models.KanbanTask{
		FamilyId:    user.FamilyId,
		CreatorId:   user.Id,
		Title:       payload.Title,
		ColumnId:    payload.ColumnId,
		Description: payload.Description,
		Priority:    payload.Priority,
	}

	task.Validate(v)

	if !v.Valid {
		app.failedValidationError(w, r, v.Errors)
		return
	}
	_, err = app.models.KanbanColumnModel.GetById(payload.ColumnId)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			app.responseError(w, r, http.StatusBadRequest, nil, "invalid_column_id")
			return
		}

		app.serverError(w, r, err)
		return
	}

	err = app.models.KanbanTaskModel.Insert(&task)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	app.ws.broadcast <- WSMessage{FamilyId: user.FamilyId, Data: WebsocketResponseModel{Action: WebsocketResponseActionUpsert, Model: "kanban_task", Data: task}}
	err = app.writeJSON(w, http.StatusCreated, envelope{"status": "success", "message": "task_created", "data": task}, nil)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

}

func (app *Application) updateKanbanTask(w http.ResponseWriter, r *http.Request) {

	v := common.InitializeValidator()
	user := app.contextGetUser(r)

	var payload struct {
		TaskId      int                       `json:"task_id"`
		Title       string                    `json:"title"`
		Description string                    `json:"description"`
		ColumnId    string                    `json:"column_id"`
		Priority    models.KanbanTaskPriority `json:"priority"`
	}

	err := app.readJSON(w, r, &payload)
	if err != nil {
		app.responseError(w, r, http.StatusBadRequest, nil, err.Error())
		return
	}

	v.Check(payload.TaskId <= 0, "task_id", "not_valid")
	v.Check(payload.Priority != 0 && !payload.Priority.Validate(), "priority", "not_valid")

	if !v.Valid {
		app.failedValidationError(w, r, v.Errors)
		return
	}

	task, err := app.models.KanbanTaskModel.GetById(payload.TaskId, user.FamilyId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			v.Add("task_id", "not_valid")
			app.failedValidationError(w, r, v.Errors)
			return
		}
		app.serverError(w, r, err)
		return
	}

	if payload.Title != "" {
		task.Title = payload.Title
	}
	if payload.Description != "" {
		task.Description = payload.Description
	}

	if payload.ColumnId != "" {
		column, err := app.models.KanbanColumnModel.GetById(payload.ColumnId)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				v.Add("column_id", "not_valid")
			} else {
				app.serverError(w, r, err)
				return
			}
		}
		task.ColumnId = column.Id
	}

	if payload.Priority != 0 {
		task.Priority = payload.Priority
	}

	if !v.Valid {
		app.failedValidationError(w, r, v.Errors)
		return
	}

	err = app.models.KanbanTaskModel.Update(task)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	app.ws.broadcast <- WSMessage{FamilyId: task.FamilyId, Data: WebsocketResponseModel{Model: "kanban_task", Action: WebsocketResponseActionUpsert, Data: task}}
	err = app.writeJSON(w, http.StatusOK, envelope{"status": "success", "message": "task_updated"}, nil)

	if err != nil {
		app.serverError(w, r, err)
	}

}

func (app *Application) deleteKanbanTask(w http.ResponseWriter, r *http.Request) {

	user := app.contextGetUser(r)
	taskId, err := app.readIDFromParams(r)

	if err != nil {
		app.responseError(w, r, http.StatusBadRequest, nil, err.Error())
		return
	}

	v := common.InitializeValidator()

	task, err := app.models.KanbanTaskModel.GetById(int(taskId), user.FamilyId)
	if err != nil {

		if errors.Is(err, sql.ErrNoRows) {
			v.Add("task_id", "not_valid")
			app.failedValidationError(w, r, v.Errors)
			return
		}

		app.serverError(w, r, err)
		return
	}

	v.Check(!task.HasPermissionToPerformOrIsParent(user), "operation", "no_permission")
	if !v.Valid {
		app.failedValidationError(w, r, v.Errors)
		return
	}

	err = app.models.KanbanTaskModel.DeleteById(int(taskId), user.FamilyId)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	app.ws.broadcast <- WSMessage{FamilyId: user.FamilyId, Data: WebsocketResponseModel{Action: WebsocketResponseActionDelete, Model: "kanban_task", Data: envelope{"id": taskId}}}
	err = app.writeJSON(w, http.StatusNoContent, nil, nil)

	if err != nil {
		app.serverError(w, r, err)
		return
	}
}

func (app *Application) assignKanbanTaskAssignee(w http.ResponseWriter, r *http.Request) {

	tx, err := app.db.BeginTx(r.Context(), nil)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	defer tx.Rollback()
	txModels := models.InitializeWithTx(tx)

	v := common.InitializeValidator()
	user := app.contextGetUser(r)
	var payload struct {
		UserId []int `json:"user_id"`
		TaskId int   `json:"task_id"`
	}

	if err := app.readJSON(w, r, &payload); err != nil {
		app.responseError(w, r, http.StatusBadRequest, nil, err.Error())
		return
	}

	v.Check(common.ContainsNegativeOrZero(payload.UserId), "user_id", "not_valid")
	v.Check(payload.TaskId <= 0, "task_id", "not_valid")

	if !v.Valid {
		app.failedValidationError(w, r, v.Errors)
		return
	}

	newAssigneeRecord := models.KanbanTaskAssigneePayloadModel{FamilyId: user.FamilyId, UserId: payload.UserId, TaskId: payload.TaskId}
	err = txModels.KanbanTaskAssigneeModel.SyncTaskAssignees(&newAssigneeRecord)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	if err := tx.Commit(); err != nil {
		app.serverError(w, r, err)
		return
	}

	app.ws.broadcast <- WSMessage{FamilyId: user.FamilyId, Data: WebsocketResponseModel{Model: "kanban_task_assignee", Action: WebsocketResponseActionUpsert, Data: newAssigneeRecord}}
	err = app.writeJSON(w, http.StatusOK, envelope{"status": "success", "message": "task_assigned"}, nil)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

}

func (app *Application) getAllAssignmentsForFamily(w http.ResponseWriter, r *http.Request) {

	user := app.contextGetUser(r)
	assignments, err := app.models.KanbanTaskAssigneeModel.GetAllForFamily(user.FamilyId)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"status": "success", "data": assignments}, nil)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

}
