package main

import (
	"net/http"
)

func (app *Application) retrieveKanbanColumns(w http.ResponseWriter, r *http.Request) {

	rows, err := app.models.KanbanColumnModel.GetAll()

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
