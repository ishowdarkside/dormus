package main

import "net/http"

func (app *Application) getFamilyUsers(w http.ResponseWriter, r *http.Request) {

	user := app.contextGetUser(r)
	users, err := app.models.UserModel.GetForFamily(user.FamilyId)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"status": "success", "users": users}, nil)
	if err != nil {
		app.serverError(w, r, err)
	}

}
