import { FormInput, FormTextarea } from "@/components";
import type { CreateEditTicketAndAssigneeModel } from "@/modules/Kanban/types.ts";
import { KanbanTaskAssignees } from "@/modules/Kanban/components/KanbanCreateEditTaskModal/components/KanbanTaskAssignees.tsx";
import { KanbanTaskPriority } from "@/modules/Kanban/components/KanbanCreateEditTaskModal/components/KanbanTaskPriority.tsx";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";

export const KanbanTaskModalContent = () => {
  const { t } = useTranslation();
  const {} = useFormContext<CreateEditTicketAndAssigneeModel>();
  return (
    <div className="w-full flex flex-col gap-3">
      <FormInput<CreateEditTicketAndAssigneeModel> placeholder={t("title")} name="title" />
      <FormTextarea<CreateEditTicketAndAssigneeModel>
        placeholder={t("description")}
        name="description"
        required={false}
        className="max-h-[300px] h-[300px]"
      />
      <KanbanTaskAssignees />
      <KanbanTaskPriority />
    </div>
  );
};
