import { useLocation } from "react-router";
import { useEffect, useMemo } from "react";
import { PATHS } from "@/router/paths.ts";
import { useTranslation } from "react-i18next";
import { useUser } from "@/hooks/useUser.ts";

export const useWindowName = () => {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();

  const { user } = useUser();

  const mapper = useMemo(
    () => ({
      [PATHS.Notes]: t("dormus_notes"),
      [PATHS.Kanban]: t("dormus_kanban"),
      [PATHS.Chat]: t("dormus_chat"),
      [PATHS.Shopping]: t("dormus_shopping"),
      [PATHS.Notifications]: t("dormus_notifications"),
      [PATHS.Calendar]: t("dormus_calendar"),
      [PATHS.Financials]: t("dormus_duties"),
      [PATHS.Family]: t("dormus_family"),
      [PATHS.Me]: user ? `Dormus - ${user.name}` : "Dormus",
    }),
    [user, i18n.language],
  );

  useEffect(() => {
    window.document.title = mapper[pathname];
  }, [pathname]);
};
