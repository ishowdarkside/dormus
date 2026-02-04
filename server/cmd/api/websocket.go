package main

import (
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

const (
	writeWait  = 10 * time.Second
	pongWait   = 60 * time.Second
	pingPeriod = (pongWait * 9) / 10
)

type WebsocketResponseActionType string

const (
	WebsocketResponseActionUpsert WebsocketResponseActionType = "upsert"
	WebsocketResponseActionDelete WebsocketResponseActionType = "delete"
)

type WebsocketResponseModel struct {
	Action WebsocketResponseActionType `json:"action"`
	Model  string                      `json:"model"`
	Data   any                         `json:"data"`
}

type WebsocketKickMessage struct {
	FamilyId int
	UserId   int
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (app *Application) wsHandler(w http.ResponseWriter, r *http.Request) {

	user := app.contextGetUser(r)

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		app.logger.PrintError(err.Error(), nil)
		return
	}

	client := &WSClient{
		Conn:     conn,
		Send:     make(chan WebsocketResponseModel, 256),
		UserId:   user.Id,
		FamilyId: user.FamilyId,
	}

	app.ws.register <- client
	app.background(client.writePump)
	client.readPump(app)

}

type WSClient struct {
	Conn     *websocket.Conn
	Send     chan WebsocketResponseModel
	UserId   int
	FamilyId int
}

func (c *WSClient) readPump(app *Application) {
	defer func() {
		app.ws.unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {

		var msg WebsocketResponseModel
		err := c.Conn.ReadJSON(&msg)
		if err != nil {
			return
		}

		app.ws.broadcast <- WSMessage{
			FamilyId: c.FamilyId,
			Data:     msg,
		}

	}
}

func (c *WSClient) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case msg, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.Conn.WriteJSON(msg); err != nil {
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

type Room struct {
	id      int
	clients map[*WSClient]bool
}

type WSMessage struct {
	FamilyId int
	Data     WebsocketResponseModel
}

type WebsocketHub struct {
	rooms      map[int]*Room
	register   chan *WSClient
	unregister chan *WSClient
	broadcast  chan WSMessage
	kick       chan *WebsocketKickMessage
}

func (h *WebsocketHub) getOrCreateRoom(familyId int) *Room {

	room, ok := h.rooms[familyId]
	if !ok {
		room = &Room{
			id:      familyId,
			clients: make(map[*WSClient]bool),
		}

		h.rooms[familyId] = room
	}

	return room
}

func (h *WebsocketHub) Run() {

	for {
		select {
		case client := <-h.register:
			room := h.getOrCreateRoom(client.FamilyId)
			room.clients[client] = true
		case client := <-h.unregister:
			room, ok := h.rooms[client.FamilyId]
			if ok {
				delete(room.clients, client)
				if len(room.clients) == 0 {
					delete(h.rooms, client.FamilyId) // cleanup
				}
			}
			close(client.Send)
		case kick := <-h.kick:
			room, ok := h.rooms[kick.FamilyId]
			if !ok {
				continue
			}
			for client := range room.clients {
				if client.UserId == kick.UserId {

					client.Conn.WriteControl(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.ClosePolicyViolation, "kicked"), time.Now().Add(time.Second))
					client.Conn.Close()
				}
			}
		case msg := <-h.broadcast:
			room, ok := h.rooms[msg.FamilyId]
			if !ok {
				continue
			}
			for client := range room.clients {
				select {
				case client.Send <- msg.Data:
				default:
					delete(room.clients, client)
					close(client.Send)
				}
			}
		}
	}
}

func NewWebsocketHub() *WebsocketHub {

	return &WebsocketHub{
		rooms:      make(map[int]*Room),
		register:   make(chan *WSClient),
		unregister: make(chan *WSClient),
		broadcast:  make(chan WSMessage),
		kick:       make(chan *WebsocketKickMessage),
	}
}
