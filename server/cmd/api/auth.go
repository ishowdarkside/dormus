package main

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"slices"
	"strings"
	"time"

	"github.com/ishowdarkside/family-manager/internal/common"
	"github.com/ishowdarkside/family-manager/internal/models"
)

var templateLanguageMapper = map[string]string{
	"en": "login_request_en.tmpl",
	"bs": "login_request_bs.tmpl",
}

func (app *Application) requestLink(w http.ResponseWriter, r *http.Request) {

	var user *models.User
	validator := common.InitializeValidator()
	var payload struct {
		Identifier string `json:"identifier"`
		Region     string `json:"region"`
		Language   string `json:"lang"`
	}

	err := app.readJSON(w, r, &payload)
	if err != nil {
		app.responseError(w, r, http.StatusBadRequest, nil, err.Error())
		return
	}

	// Finding user by phone number
	if payload.Region != "" {
		isValidPhoneNum := validator.ValidatePhoneNum(payload.Identifier, payload.Region)
		if !isValidPhoneNum {
			validator.Add("phone_number", "invalid_as_per_region")
			app.failedValidationError(w, r, validator.Errors)
			return
		}

		user, err = app.models.UserModel.GetForIdentifier(common.FormatPhoneNumber(payload.Identifier, payload.Region), models.IdentifierPhone)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				app.writeJSON(w, http.StatusOK, envelope{"status": "success"}, nil)
				return
			}
			app.logger.PrintError(err.Error(), nil)
			app.serverError(w, r, err)
			return

		}

	} else {
		isValidEmail := validator.ValidateEmail(payload.Identifier)
		if !isValidEmail {
			validator.Add("email", "invalid_email")
			app.failedValidationError(w, r, validator.Errors)
			return
		}

		user, err = app.models.UserModel.GetForIdentifier(payload.Identifier, models.IdentifierEmail)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				app.writeJSON(w, http.StatusOK, envelope{"status": "success"}, nil)
				return
			}
			app.serverError(w, r, err)
			return
		}

	}

	session, err := app.models.SessionModel.Insert(user.FamilyId, user.Id, true, time.Now().Add(models.MagicLinkTokenTTL))
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	app.background(func() {

		template, ok := templateLanguageMapper[payload.Language]

		if !ok {
			template = templateLanguageMapper["en"]
		}
		err := app.mailer.Send(user.Email, template, struct{ LoginLink string }{LoginLink: fmt.Sprintf("%s/magic-token/%s", app.config.WebURL, session.PlainText)})
		if err != nil {
			app.logger.PrintError(err.Error(), nil)
		}
	})

	err = app.writeJSON(w, http.StatusOK, envelope{"status": "success"}, nil)
	if err != nil {
		app.serverError(w, r, err)
	}

}

func (app *Application) consumeMagicLink(w http.ResponseWriter, r *http.Request) {

	tx, err := app.db.BeginTx(r.Context(), nil)
	if err != nil {
		app.serverError(w, r, err)
		return
	}
	defer tx.Rollback()
	txModels := models.InitializeWithTx(tx)

	user := app.contextGetUser(r)
	token := strings.Split(r.Header.Get("Authorization"), " ")[1]

	newToken, err := txModels.SessionModel.Insert(user.FamilyId, user.Id, true, time.Now().Add(models.AuthTokenTTL))
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	err = txModels.SessionModel.RevokeWithToken(token)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	if err = tx.Commit(); err != nil {
		app.serverError(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"status": "success", "token": newToken.PlainText}, nil)
	if err != nil {
		app.serverError(w, r, err)
	}
}

func (app *Application) me(w http.ResponseWriter, r *http.Request) {

	user := app.contextGetUser(r)
	err := app.writeJSON(w, http.StatusOK, envelope{"status": "success", "user": user}, nil)

	if err != nil {
		app.serverError(w, r, err)
	}

}

func (app *Application) handleJoinRequest(w http.ResponseWriter, r *http.Request) {

	tx, err := app.db.BeginTx(r.Context(), nil)
	if err != nil {
		app.serverError(w, r, err)
		return
	}
	defer tx.Rollback()

	txModels := models.InitializeWithTx(tx)

	const RequestActionApprove = "approve"
	const RequestActionDecline = "decline"

	user := app.contextGetUser(r)

	var payload struct {
		UserId int    `json:"user_id"`
		Action string `json:"action"`
	}

	err = app.readJSON(w, r, &payload)
	if err != nil {
		app.responseError(w, r, http.StatusBadRequest, nil, err.Error())
		return
	}

	validActions := []string{RequestActionApprove, RequestActionDecline}
	v := common.InitializeValidator()
	v.Check(!slices.Contains(validActions, payload.Action), "action", "invalid_action_type")

	if !v.Valid {
		app.failedValidationError(w, r, v.Errors)
		return
	}

	if payload.Action == RequestActionDecline {

		err := txModels.SessionModel.RevokeForUser(payload.UserId, user.FamilyId)
		if err != nil {
			app.serverError(w, r, err)
			return
		}

		err = txModels.UserModel.Delete(payload.UserId, user.FamilyId)
		if err != nil {
			app.serverError(w, r, err)
			return
		}

		if err = tx.Commit(); err != nil {
			app.serverError(w, r, err)
			return
		}

		app.ws.broadcast <- WSMessage{
			FamilyId: user.FamilyId,
			Data:     WebsocketResponseModel{Action: WebsocketResponseActionDelete, Model: "family_member", Data: envelope{"id": payload.UserId}}}

		err = app.writeJSON(w, http.StatusOK, envelope{"status": "success", "message": "user_declined"}, nil)
		if err != nil {
			app.serverError(w, r, err)
			return
		}

		return
	}

	err = txModels.SessionModel.ApproveForUser(payload.UserId, user.FamilyId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			app.responseError(w, r, http.StatusBadRequest, nil, "user_not_request_access")
			return
		}
	}

	member, err := txModels.UserModel.GetById(payload.UserId)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	now := time.Now()
	member.DateJoined = &now

	err = txModels.UserModel.Update(member)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	if err = tx.Commit(); err != nil {
		app.serverError(w, r, err)
		return
	}

	app.ws.broadcast <- WSMessage{FamilyId: user.FamilyId, Data: WebsocketResponseModel{Action: WebsocketResponseActionUpsert, Model: "family_member", Data: member}}
	err = app.writeJSON(w, http.StatusOK, envelope{"status": "success", "message": "user_approved"}, nil)
	if err != nil {
		app.serverError(w, r, err)
	}

}

func (app *Application) kickUserFromFamily(w http.ResponseWriter, r *http.Request) {

	user := app.contextGetUser(r)

	tx, err := app.db.BeginTx(r.Context(), nil)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	defer tx.Rollback()
	txModels := models.InitializeWithTx(tx)

	var payload struct {
		UserId int `json:"user_id"`
	}

	err = app.readJSON(w, r, &payload)
	if err != nil {
		app.responseError(w, r, http.StatusBadRequest, nil, err.Error())
		return
	}

	if user.Id == payload.UserId {
		app.responseError(w, r, http.StatusBadRequest, nil, "invalid_operation")
		return
	}

	err = txModels.UserModel.Delete(payload.UserId, user.FamilyId)
	if err != nil {

		app.serverError(w, r, err)
		return
	}

	err = txModels.SessionModel.RevokeForUser(payload.UserId, user.FamilyId)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	if err = tx.Commit(); err != nil {
		app.serverError(w, r, err)
		return
	}

	app.ws.broadcast <- WSMessage{FamilyId: user.FamilyId, Data: WebsocketResponseModel{Action: WebsocketResponseActionDelete, Model: "family_member", Data: envelope{"id": payload.UserId}}}
	app.ws.kick <- &WebsocketKickMessage{FamilyId: user.FamilyId, UserId: payload.UserId}
	err = app.writeJSON(w, http.StatusOK, envelope{"status": "success", "message": "user_kicked"}, nil)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

}
