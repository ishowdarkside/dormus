package main

import (
	"net/http"

	"github.com/ishowdarkside/family-manager/internal/models"
	"github.com/julienschmidt/httprouter"
)

func (app *Application) Routes() http.Handler {

	r := httprouter.New()
	r.NotFound = http.HandlerFunc(app.resourceNotFoundError)
	r.MethodNotAllowed = http.HandlerFunc(app.methodNotAllowedError)

	//Family handlers
	r.HandlerFunc(http.MethodPost, "/api/v1/family", app.createFamily)
	r.HandlerFunc(http.MethodPost, "/api/v1/family/refresh_token", app.authenticate(app.refreshInviteToken))
	r.HandlerFunc(http.MethodGet, "/api/v1/family", app.authenticate(app.getFamily))
	r.HandlerFunc(http.MethodPost, "/api/v1/family/update_name", app.authenticate(app.changeFamilyName))

	//Status handlers
	r.HandlerFunc(http.MethodPost, "/api/v1/status", app.authenticate(app.createStatus))

	//validator handlers
	r.HandlerFunc(http.MethodPost, "/api/v1/validators/phone-number", app.validatePhoneNumber)

	//Auth handlers
	r.HandlerFunc(http.MethodPost, "/api/v1/auth/magic/request", app.requestLink)
	r.HandlerFunc(http.MethodPost, "/api/v1/auth/family/join", app.joinFamily)
	r.HandlerFunc(http.MethodPost, "/api/v1/auth/family/handle_request", app.authenticate(app.restrictToRole(models.UserRoleParent, app.handleJoinRequest)))
	r.HandlerFunc(http.MethodGet, "/api/v1/auth/magic/consume", app.authenticate(app.consumeMagicLink))
	r.HandlerFunc(http.MethodGet, "/api/v1/auth/me", app.authenticate(app.me))
	r.HandlerFunc(http.MethodPost, "/api/v1/auth/kick_member", app.authenticate(app.restrictToRole(models.UserRoleParent, app.kickUserFromFamily)))

	//Kanban columns handlers
	//r.HandlerFunc(http.MethodPost, "/api/v1/kanban_columns/create", app.authenticate(app.restrictToRole(models.UserRoleParent, app.createKanbanColumn)))
	//r.HandlerFunc(http.MethodDelete, "/api/v1/kanban_columns/delete", app.authenticate(app.restrictToRole(models.UserRoleParent, app.deleteKanbanColumn)))
	r.HandlerFunc(http.MethodGet, "/api/v1/kanban_columns", app.authenticate(app.retrieveKanbanColumns))

	//Kanban tasks handlers
	r.HandlerFunc(http.MethodGet, "/api/v1/kanban_tasks", app.authenticate(app.retrieveAllFamilyTasks))
	r.HandlerFunc(http.MethodPost, "/api/v1/kanban_tasks/create", app.authenticate(app.createKanbanTask))
	r.HandlerFunc(http.MethodPost, "/api/v1/kanban_tasks/update", app.authenticate(app.updateKanbanTask))
	r.HandlerFunc(http.MethodDelete, "/api/v1/kanban_tasks/:id", app.authenticate(app.deleteKanbanTask))
	r.HandlerFunc(http.MethodPost, "/api/v1/kanban_tasks/assignee", app.authenticate(app.assignKanbanTaskAssignee))
	r.HandlerFunc(http.MethodGet, "/api/v1/kanban_tasks/assignee", app.authenticate(app.getAllAssignmentsForFamily))

	// Notes handlers
	r.HandlerFunc(http.MethodPost, "/api/v1/notes", app.authenticate(app.createNote))
	r.HandlerFunc(http.MethodGet, "/api/v1/notes", app.authenticate(app.getAllNotesForFamily))
	r.HandlerFunc(http.MethodPost, "/api/v1/notes/update", app.authenticate(app.updateNote))
	r.HandlerFunc(http.MethodDelete, "/api/v1/notes/:id", app.authenticate(app.deleteNote))

	// Bills notes
	r.HandlerFunc(http.MethodGet, "/api/v1/bills", app.authenticate(app.getBillsForFamily))
	r.HandlerFunc(http.MethodPost, "/api/v1/bills", app.authenticate(app.createBill))
	r.HandlerFunc(http.MethodPost, "/api/v1/bills/:id", app.authenticate(app.updateBill))
	r.HandlerFunc(http.MethodDelete, "/api/v1/bills/:id", app.authenticate(app.deleteBill))

	//budget handlers
	r.HandlerFunc(http.MethodPost, "/api/v1/budgets", app.authenticate(app.createBudgetItem))
	r.HandlerFunc(http.MethodGet, "/api/v1/budgets", app.authenticate(app.getBudgetItemsForFamily))

	//User handlers
	r.HandlerFunc(http.MethodGet, "/api/v1/users", app.authenticate(app.getFamilyUsers))

	//Websocket handlers
	r.HandlerFunc(http.MethodGet, "/api/v1/ws", app.authenticateWithToken(app.wsHandler))

	return app.recoverPanic(app.enableCORS(app.rateLimiter(r)))
}
