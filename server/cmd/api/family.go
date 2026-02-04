package main

import (
	"database/sql"
	"errors"
	"net/http"
	"time"

	"github.com/ishowdarkside/family-manager/internal/common"
	"github.com/ishowdarkside/family-manager/internal/models"
)

func (app *Application) createFamily(w http.ResponseWriter, r *http.Request) {

	v := common.InitializeValidator()
	tx, err := app.db.BeginTx(r.Context(), nil)
	if err != nil {
		app.serverError(w, r, err)
		return
	}
	defer tx.Rollback()
	txModels := models.InitializeWithTx(tx)

	var input struct {
		FamilyName string          `json:"family_name"`
		Name       string          `json:"name"`
		Gender     string          `json:"gender"`
		Age        int             `json:"age"`
		Role       models.UserRole `json:"role"`
		Email      string          `json:"email"`
		PhoneNum   string          `json:"phone_number"`
		Region     string          `json:"region"`
	}

	err = app.readJSON(w, r, &input)

	if err != nil {
		app.responseError(w, r, http.StatusBadRequest, nil, err.Error())
		return
	}

	family := models.Family{Name: input.FamilyName}
	family.Validate(v)

	if !v.Valid {
		app.failedValidationError(w, r, v.Errors)
		return
	}

	err = txModels.FamilyModel.Insert(&family)

	if err != nil {
		app.responseError(w, r, http.StatusBadRequest, nil, err.Error())
		return
	}

	user := &models.User{
		Age:         input.Age,
		Gender:      input.Gender,
		Name:        input.Name,
		Role:        input.Role,
		Email:       input.Email,
		PhoneNumber: input.PhoneNum,
		Region:      input.Region,
	}

	user.Validate(v)

	if !v.Valid {
		app.failedValidationError(w, r, v.Errors)
		return
	}

	user.PhoneNumber = common.FormatPhoneNumber(user.PhoneNumber, user.Region)
	now := time.Now()
	user.DateJoined = &now

	err = txModels.UserModel.Insert(family.Id, user)

	if err != nil {

		if errors.Is(err, models.ErrUserEmailAlreadyUse) || errors.Is(err, models.ErrUserPhoneAlreadyUse) {
			app.responseError(w, r, http.StatusBadRequest, nil, err.Error())
			return
		}

		app.serverError(w, r, err)
		return
	}

	session, err := txModels.SessionModel.Insert(family.Id, user.Id, true, time.Now().Add(models.AuthTokenTTL))
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	if err = tx.Commit(); err != nil {
		app.serverError(w, r, err)
		return
	}

	response := envelope{"status": "success", "message": "welcome_to_dormus", "token": session.PlainText}
	err = app.writeJSON(w, http.StatusCreated, response, nil)

	if err != nil {
		app.serverError(w, r, err)
	}

}

func (app *Application) getFamily(w http.ResponseWriter, r *http.Request) {

	user := app.contextGetUser(r)

	family, err := app.models.FamilyModel.GetForId(user.FamilyId)
	if err != nil {

		if errors.Is(err, sql.ErrNoRows) {

			app.responseError(w, r, http.StatusForbidden, nil, "no_permission")
			return
		}

		app.serverError(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"status": "success", "family": family}, nil)
}

func (app *Application) refreshInviteToken(w http.ResponseWriter, r *http.Request) {

	user := app.contextGetUser(r)
	family, err := app.models.FamilyModel.GetForId(user.FamilyId)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	newToken, err := family.GenerateToken()
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	family.InviteToken = newToken
	err = app.models.FamilyModel.Update(family)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	app.ws.broadcast <- WSMessage{FamilyId: family.Id, Data: WebsocketResponseModel{Model: "family", Action: WebsocketResponseActionUpsert, Data: family}}
	err = app.writeJSON(w, http.StatusOK, envelope{"status": "success", "invite_token": family.InviteToken}, nil)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

}

func (app *Application) joinFamily(w http.ResponseWriter, r *http.Request) {

	tx, err := app.db.BeginTx(r.Context(), nil)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	defer tx.Rollback()
	txModels := models.InitializeWithTx(tx)

	var payload struct {
		InviteToken models.InviteTokenType `json:"invite_token"`
		Name        string                 `json:"name"`
		Gender      string                 `json:"gender"`
		Age         int                    `json:"age"`
		Role        models.UserRole        `json:"role"`
		Email       string                 `json:"email"`
		PhoneNum    string                 `json:"phone_number"`
		Region      string                 `json:"region"`
	}

	err = app.readJSON(w, r, &payload)
	if err != nil {
		app.responseError(w, r, http.StatusBadRequest, nil, err.Error())
		return
	}

	v := common.InitializeValidator()
	payload.InviteToken.ValidateInviteToken(v)

	user := models.User{
		Name:        payload.Name,
		Email:       payload.Email,
		Gender:      payload.Gender,
		Age:         payload.Age,
		Role:        payload.Role,
		PhoneNumber: payload.PhoneNum,
		Region:      payload.Region,
	}

	user.Validate(v)

	if !v.Valid {
		app.failedValidationError(w, r, v.Errors)
		return
	}

	family, err := txModels.FamilyModel.GetForInviteToken(payload.InviteToken)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			app.responseError(w, r, http.StatusBadRequest, nil, "invalid_invite_token")
			return
		}
		app.serverError(w, r, err)
		return
	}

	newInviteToken, err := family.GenerateToken()
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	family.InviteToken = newInviteToken
	err = txModels.FamilyModel.Update(family)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	user.PhoneNumber = common.FormatPhoneNumber(user.PhoneNumber, user.Region)
	err = txModels.UserModel.Insert(family.Id, &user)

	if err != nil {

		if errors.Is(err, models.ErrUserEmailAlreadyUse) || errors.Is(err, models.ErrUserPhoneAlreadyUse) {
			app.responseError(w, r, http.StatusBadRequest, nil, err.Error())
			return
		}

		app.serverError(w, r, err)
	}

	session, err := txModels.SessionModel.Insert(family.Id, user.Id, false, time.Now().Add(models.AuthTokenTTL))

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	if err = tx.Commit(); err != nil {
		app.serverError(w, r, err)
		return
	}

	app.ws.broadcast <- WSMessage{FamilyId: family.Id, Data: WebsocketResponseModel{Action: WebsocketResponseActionUpsert, Model: "family", Data: family}}
	app.ws.broadcast <- WSMessage{FamilyId: family.Id, Data: WebsocketResponseModel{Action: WebsocketResponseActionUpsert, Model: "family_member", Data: user}}
	err = app.writeJSON(w, http.StatusCreated, envelope{"status": "success", "message": "request_access_sent", "token": session.PlainText}, nil)
	if err != nil {
		app.serverError(w, r, err)
	}

}

func (app *Application) changeFamilyName(w http.ResponseWriter, r *http.Request) {

	user := app.contextGetUser(r)
	var payload struct {
		Name string `json:"name"`
	}

	err := app.readJSON(w, r, &payload)
	if err != nil {
		app.responseError(w, r, http.StatusBadRequest, nil, err.Error())
		return
	}

	family, err := app.models.FamilyModel.GetForId(user.FamilyId)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	family.Name = payload.Name
	err = app.models.FamilyModel.Update(family)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	app.ws.broadcast <- WSMessage{FamilyId: family.Id, Data: WebsocketResponseModel{Action: WebsocketResponseActionUpsert, Model: "family", Data: family}}
	err = app.writeJSON(w, http.StatusOK, envelope{"status": "success", "message": "family_name_updated"}, nil)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

}
