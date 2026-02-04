import { ws } from "@/lib/websocket.ts";
import { useEffect } from "react";
import { useInitiliazeHandlers } from "@/components/WebsocketSubscriber/useInitializeHandlers.ts";
import { useAuthToken } from "@/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export const WebsocketSubscriber = () => {
  const { handlers } = useInitiliazeHandlers();
  const { handleAuthTokenRemove } = useAuthToken();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const kickHandler = async () => {
    queryClient.clear();
    await handleAuthTokenRemove({ redirectToAuth: true });
  };

  useEffect(() => {
    ws.connect();
    ws.initializeHandlers(handlers);
    ws.initializeKickFromSessionHandler(kickHandler);
    ws.initializeTranslationHandler(t);
  }, []);
  return null;
};
