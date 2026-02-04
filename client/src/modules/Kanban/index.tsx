import { useTranslation } from "react-i18next";
import { KanbanBoard } from "@/modules/Kanban/components";

export const Kanban = () => {
  const { t } = useTranslation();

  return (
    <div className="mx-auto">
      <h2 className="text-3xl mb-8">{t("kanban")}</h2>
      <KanbanBoard />
    </div>
  );
};
