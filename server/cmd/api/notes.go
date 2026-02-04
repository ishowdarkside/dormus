package main

import (
	"database/sql"
	"errors"
	"net/http"

	"github.com/ishowdarkside/family-manager/internal/common"
	"github.com/ishowdarkside/family-manager/internal/models"
)

func (app *Application) createNote(w http.ResponseWriter, r *http.Request) {

	user := app.contextGetUser(r)
	var payload struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		IsPinned    bool   `json:"is_pinned"`
	}

	err := app.readJSON(w, r, &payload)
	if err != nil {
		app.responseError(w, r, http.StatusBadRequest, nil, err.Error())
		return
	}

	v := common.InitializeValidator()
	note := &models.Note{Title: payload.Title, Description: payload.Description, IsPinned: payload.IsPinned, CreatedBy: user.Id, FamilyId: user.FamilyId}

	models.ValidateNote(v, note)
	if !v.Valid {
		app.failedValidationError(w, r, v.Errors)
		return
	}

	err = app.models.NoteModel.Insert(note)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	app.ws.broadcast <- WSMessage{FamilyId: user.FamilyId, Data: WebsocketResponseModel{Model: "note", Action: WebsocketResponseActionUpsert, Data: note}}
	err = app.writeJSON(w, http.StatusCreated, envelope{"status": "success", "message": "note_created", "note": note}, nil)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

}

func (app *Application) updateNote(w http.ResponseWriter, r *http.Request) {

	user := app.contextGetUser(r)

	var payload struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		IsPinned    bool   `json:"is_pinned"`
		Id          int    `json:"id"`
	}

	err := app.readJSON(w, r, &payload)
	if err != nil {
		app.responseError(w, r, http.StatusBadRequest, nil, err.Error())
		return
	}

	if payload.Id <= 0 {
		app.resourceNotFoundError(w, r)
		return
	}

	note, err := app.models.NoteModel.GetById(payload.Id)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			app.resourceNotFoundError(w, r)
			return
		}

		app.serverError(w, r, err)
		return
	}

	if payload.Title != "" {
		note.Title = payload.Title
	}

	if payload.Description != "" {
		note.Description = payload.Description
	}

	note.IsPinned = payload.IsPinned
	err = app.models.NoteModel.Update(note)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	app.ws.broadcast <- WSMessage{FamilyId: user.FamilyId, Data: WebsocketResponseModel{Model: "note", Action: WebsocketResponseActionUpsert, Data: note}}
	err = app.writeJSON(w, http.StatusOK, envelope{"status": "success", "message": "note_updated"}, nil)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

}

func (app *Application) getAllNotesForFamily(w http.ResponseWriter, r *http.Request) {

	user := app.contextGetUser(r)
	notes, err := app.models.NoteModel.GetAllForFamily(user.FamilyId)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"status": "success", "notes": notes}, nil)
	if err != nil {
		app.serverError(w, r, err)
	}
}

func (app *Application) deleteNote(w http.ResponseWriter, r *http.Request) {

	user := app.contextGetUser(r)
	id, err := app.readIDFromParams(r)
	if err != nil {
		app.responseError(w, r, http.StatusBadRequest, nil, err.Error())
		return
	}

	note, err := app.models.NoteModel.GetById(int(id))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			app.resourceNotFoundError(w, r)
			return
		}

		app.serverError(w, r, err)
		return
	}

	if user.Id != note.CreatedBy || user.Role != models.UserRoleParent {
		app.responseError(w, r, http.StatusForbidden, nil, "no_permission")
		return
	}

	err = app.models.NoteModel.RemoveById(note.Id, user.FamilyId)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	app.ws.broadcast <- WSMessage{FamilyId: user.FamilyId, Data: WebsocketResponseModel{Action: WebsocketResponseActionDelete, Model: "note", Data: envelope{"id": id}}}

	err = app.writeJSON(w, http.StatusNoContent, nil, nil)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

}
