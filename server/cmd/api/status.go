package main

import (
	"errors"
	"net/http"

	"github.com/ishowdarkside/family-manager/internal/common"
	"github.com/ishowdarkside/family-manager/internal/models"
)

func (app *Application) createStatus(w http.ResponseWriter, r *http.Request) {

	user := app.contextGetUser(r)

	var input struct {
		Status string `json:"status"`
		Emoji  string `json:"emoji"`
	}

	if err := app.readJSON(w, r, &input); err != nil {
		app.responseError(w, r, http.StatusBadRequest, nil, err.Error())
		return
	}

	v := common.InitializeValidator()
	v.Check(input.Status == "", "status", "must be provided")

	if !v.Valid {
		app.failedValidationError(w, r, v.Errors)
		return
	}

	status := models.Status{Status: input.Status, Emoji: input.Emoji, UserId: user.Id}
	err := app.models.StatusModel.Insert(user.Id, &status)

	if err != nil {

		if errors.Is(err, models.ErrorStatusAlreadyExists) {
			app.responseError(w, r, http.StatusBadRequest, nil, err.Error())
			return
		}

		app.serverError(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusCreated, envelope{"status": "success", "message": "status successfully created", "data": status}, nil)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

}
