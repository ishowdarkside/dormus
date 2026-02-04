import { FormDropdown } from "@/components";
import type { CreateEditTicketAndAssigneeModel } from "@/modules/Kanban/types.ts";
import { useTranslation } from "react-i18next";
import { TaskPriority } from "@/models/Kabanan.ts";
import { CaretDoubleUp, CaretDown, CaretUp } from "phosphor-react";

export const KanbanTaskPriority = () => {
  const { t } = useTranslation();
  const options = [
    { label: t("low"), value: TaskPriority.TaskPriorityLow, icon: <CaretDown className="text-green-300" /> },
    { label: t("medium"), value: TaskPriority.TaskPriorityMedium, icon: <CaretUp className="text-blue-300" /> },
    { label: t("high"), value: TaskPriority.TaskPriorityHigh, icon: <CaretDoubleUp className="text-red-300" /> },
  ];
  return <FormDropdown<CreateEditTicketAndAssigneeModel> options={options} name="priority" trigger={t("priority")} />;
};
