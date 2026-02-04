package main

import (
	"net/http"

	"github.com/ishowdarkside/family-manager/internal/common"
)

func (app *Application) validatePhoneNumber(w http.ResponseWriter, r *http.Request) {

	var Input struct {
		Region      string `json:"region"`
		PhoneNumber string `json:"phone_number"`
	}

	err := app.readJSON(w, r, &Input)
	if err != nil {
		app.responseError(w, r, http.StatusBadRequest, nil, err.Error())
		return
	}

	v := common.InitializeValidator()
	v.Check(Input.Region == "", "region", "must be provided")
	v.Check(Input.PhoneNumber == "", "phone_number", "must be provided")

	if !v.Valid {
		app.failedValidationError(w, r, v.Errors)
		return
	}

	isValid := v.ValidatePhoneNum(Input.PhoneNumber, Input.Region)
	err = app.writeJSON(w, http.StatusOK, envelope{"status": "success", "is_valid": isValid}, nil)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

}
