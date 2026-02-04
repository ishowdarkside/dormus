package main

import (
	"net/http"
)

func (app *Application) logError(r *http.Request, err error) {

	var (
		method = r.Method
		uri    = r.URL.RequestURI()
	)

	app.logger.PrintError(err.Error(), map[string]string{"method": method, "uri": uri})

}

func (app *Application) responseError(w http.ResponseWriter, r *http.Request, status int, headers http.Header, message any) {

	err := app.writeJSON(w, status, envelope{"status": "fail", "message": message}, headers)

	if err != nil {
		app.logError(r, err)
		w.WriteHeader(http.StatusInternalServerError)
	}

}

func (app *Application) resourceNotFoundError(w http.ResponseWriter, r *http.Request) {

	app.responseError(w, r, http.StatusNotFound, nil, "resource_not_found")

}

func (app *Application) serverError(w http.ResponseWriter, r *http.Request, err error) {

	app.logError(r, err)
	app.responseError(w, r, http.StatusInternalServerError, nil, "something_went_wrong")
}

func (app *Application) methodNotAllowedError(w http.ResponseWriter, r *http.Request) {
	app.responseError(w, r, http.StatusMethodNotAllowed, nil, "method_not_allowed")
}

func (app *Application) tooManyRequestsError(w http.ResponseWriter, r *http.Request) {
	app.responseError(w, r, http.StatusTooManyRequests, nil, "too_many_requests")
}

func (app *Application) failedValidationError(w http.ResponseWriter, r *http.Request, errors map[string]string) {

	err := app.writeJSON(w, http.StatusUnprocessableEntity, envelope{"status": "fail", "message": "failed_validation", "errors": errors}, nil)

	if err != nil {
		app.logError(r, err)
		w.WriteHeader(http.StatusInternalServerError)
	}
}

func (app *Application) unauthorizedError(w http.ResponseWriter, r *http.Request) {

	app.responseError(w, r, http.StatusUnauthorized, nil, "unauthorized")
}
