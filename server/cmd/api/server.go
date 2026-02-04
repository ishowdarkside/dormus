package main

import (
	"fmt"
	"log"
	"net/http"
	"time"
)

func (app *Application) serve() error {

	server := http.Server{
		Addr:         fmt.Sprintf(":%s", app.config.Port),
		Handler:      app.Routes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		ErrorLog:     log.New(app.logger, "", 0),
	}

	app.logger.PrintInfo(fmt.Sprintf("Listening on port %s", app.config.Port), map[string]string{"env": app.config.Env})
	err := server.ListenAndServe()
	return err
}
