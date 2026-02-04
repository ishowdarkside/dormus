package main

import (
	"errors"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/ishowdarkside/family-manager/internal/models"
	"github.com/tomasen/realip"
	"golang.org/x/time/rate"
)

func (app *Application) recoverPanic(fn http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		defer func() {

			if err := recover(); err != nil {

				w.Header().Set("Connection", "close")
				app.serverError(w, r, fmt.Errorf("%s", err))
				return
			}

		}()

		fn.ServeHTTP(w, r)

	})

}

func (app *Application) rateLimiter(fn http.Handler) http.Handler {

	type client struct {
		limiter  *rate.Limiter
		lastSeen time.Time
	}
	var (
		mu      sync.Mutex
		clients = make(map[string]*client)
	)

	app.background(func() {

		if !app.config.Limiter.Enabled {
			return
		}

		for {

			time.Sleep(time.Minute)
			mu.Lock()

			for ip, client := range clients {

				if time.Since(client.lastSeen) > time.Minute*3 {
					delete(clients, ip)
				}
			}

			mu.Unlock()
		}

	})

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		if !app.config.Limiter.Enabled {

			fn.ServeHTTP(w, r)
			return
		}
		ip := realip.FromRequest(r)
		mu.Lock()

		if _, found := clients[ip]; !found {
			clients[ip] = &client{limiter: rate.NewLimiter(rate.Limit(app.config.Limiter.RPS), app.config.Limiter.Burst)}
		}

		clients[ip].lastSeen = time.Now()

		if !clients[ip].limiter.Allow() {
			mu.Unlock()
			app.tooManyRequestsError(w, r)
			return
		}

		mu.Unlock()
		fn.ServeHTTP(w, r)
	})

}

func (app *Application) authenticate(fn http.HandlerFunc) http.HandlerFunc {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		w.Header().Set("Vary", "Authorization")
		authHeader := r.Header.Get("Authorization")

		if authHeader == "" {
			app.unauthorizedError(w, r)
			return
		}

		s := strings.Split(authHeader, " ")
		if len(s) != 2 || s[0] != "Bearer" {

			app.unauthorizedError(w, r)
			return
		}

		token := s[1]

		user, err := app.models.UserModel.GetForToken(token)

		if err != nil {
			if errors.Is(err, models.ErrUserNotFound) {
				app.unauthorizedError(w, r)
				return
			}

			app.serverError(w, r, err)
			return
		}

		r = app.contextSetUser(r, user)
		fn.ServeHTTP(w, r)
	})
}

func (app *Application) authenticateWithToken(fn http.HandlerFunc) http.HandlerFunc {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		var token string

		cookieToken, err := r.Cookie("token")
		if err != nil {
			app.unauthorizedError(w, r)
			return
		}

		token = cookieToken.Value

		user, err := app.models.UserModel.GetForToken(token)

		if err != nil {
			if errors.Is(err, models.ErrUserNotFound) {
				app.unauthorizedError(w, r)
				return
			}

			app.serverError(w, r, err)
			return
		}

		r = app.contextSetUser(r, user)
		fn.ServeHTTP(w, r)
	})
}

func (app *Application) enableCORS(next http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		w.Header().Set("Access-Control-Allow-Origin", app.config.WebURL)
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")

		next.ServeHTTP(w, r)
	})
}

func (app *Application) restrictToRole(role models.UserRole, next http.HandlerFunc) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		user := app.contextGetUser(r)
		if user.Role != role {
			app.responseError(w, r, http.StatusForbidden, nil, "no_permission")
			return
		}

		next.ServeHTTP(w, r)
	}
}
