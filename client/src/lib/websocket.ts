import type { TFunction } from "i18next";
import { toast } from "react-toastify";

type WebsocketResponseModel = {
  model: string;
  data: unknown;
  action: "upsert" | "delete";
};

export type WebsocketHandlerModel = {
  action: "upsert" | "delete";
  handler: Function;
  model: string;
};

const WEBSOCKET_CLOSE_REASONS = {
  Kicked: "kicked",
};

class WebSocketManager {
  private socket?: WebSocket;
  private handlers: WebsocketHandlerModel[] = [];
  private kickFromSessionHandler: VoidFunction | undefined = undefined;
  private translation: TFunction<"translation", undefined> | undefined = undefined;

  async connect() {
    if (this.socket) return;
    this.socket = new WebSocket(`ws://localhost:8080/api/v1/ws`);
    this.socket.onmessage = (event: MessageEvent) => {
      const message: WebsocketResponseModel = JSON.parse(event.data);
      this.handlers.find((handler) => handler.action === message.action && handler.model === message.model)?.handler(message.data);
    };

    this.socket.onclose = (event) => {
      this.socket = undefined;
      if (event.reason === WEBSOCKET_CLOSE_REASONS.Kicked) {
        this.kickFromSessionHandler?.();
        toast.error(this.translation?.("kicked_from_organization"));
      }
    };
  }

  initializeKickFromSessionHandler(handler: VoidFunction) {
    this.kickFromSessionHandler = handler;
  }

  initializeTranslationHandler = (handler: TFunction<"translation", undefined>) => {
    this.translation = handler;
  };

  initializeHandlers(handlers: WebsocketHandlerModel[]) {
    this.handlers = [...handlers];
  }

  // TO-DO: ovo je boilerplate, refine..
  send(type: string, payload: unknown) {
    this.socket?.send(JSON.stringify({ type, payload }));
  }
}

export const ws = new WebSocketManager();
