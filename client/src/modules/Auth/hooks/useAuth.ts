import { ACTIVE_SCREEN } from "@/modules/Auth/types.ts";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { consumeMagicToken } from "@/modules/Auth/services.ts";
import { useNavigate, useParams } from "react-router";
import { PATHS } from "@/router/paths.ts";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useAuthToken } from "@/hooks";
import { SERVER_RESPONSE_STATUS } from "@/utils/common.ts";

export const useAuth = () => {
  const [activeScreen, setActiveScreen] = useState(ACTIVE_SCREEN.Register);

  const navigateToJoinScreen = () => setActiveScreen(ACTIVE_SCREEN.Join);
  const navigateToLoginScreen = () => setActiveScreen(ACTIVE_SCREEN.Login);
  const navigateToStartScreen = () => setActiveScreen(ACTIVE_SCREEN.Register);
  return { activeScreen, setActiveScreen, navigateToLoginScreen, navigateToStartScreen, navigateToJoinScreen };
};

export const useConsumeMagicToken = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token } = useParams<"token">();
  const { handleAuthTokenSet } = useAuthToken();

  const { mutateAsync: consumeMagicTokenMutate } = useMutation({
    mutationFn: consumeMagicToken,
    onSuccess: async (res) => {
      if (res.data.status === SERVER_RESPONSE_STATUS.Success) {
        await handleAuthTokenSet(res.data.token);
        navigate(PATHS.App);
      }
    },
    onError: () => {
      toast.error(t("invalid_expired_link"));
      return navigate(PATHS.Auth);
    },
  });
  useEffect(() => {
    (async () => {
      if (!token) return navigate(PATHS.Auth);

      handleAuthTokenSet(token);
      await consumeMagicTokenMutate();
    })();
  }, [token]);
};
