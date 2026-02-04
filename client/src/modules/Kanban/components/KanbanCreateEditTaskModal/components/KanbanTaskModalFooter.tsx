import { Button } from "@/components";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import type { CreateEditTicketAndAssigneeModel } from "@/modules/Kanban/types.ts";
import { useAssignTask, useCreateKanbanTask, useUpdateKanbanTask } from "@/modules/Kanban/hooks";
import type { KanbanTask } from "@/models/Kabanan.ts";
import { toast } from "react-toastify";
import { SERVER_RESPONSE_STATUS } from "@/utils/common.ts";
import { Trash } from "phosphor-react";
import { useUser } from "@/hooks";
import { USER_ROLE } from "@/models/User.ts";
import { cn } from "@/lib/utils.ts";
import { useDeleteTask } from "@/modules/Kanban/hooks/useDeleteTask.ts";

interface KanbanTaskModalFooterProps {
  closeModal: VoidFunction;
  editTask: KanbanTask | null;
}
export const KanbanTaskModalFooter = ({ closeModal, editTask }: KanbanTaskModalFooterProps) => {
  const { t } = useTranslation();
  const { handleSubmit } = useFormContext<CreateEditTicketAndAssigneeModel>();
  const { createTaskMutation } = useCreateKanbanTask();
  const { updateKanbanTaskMutation } = useUpdateKanbanTask();
  const { assignTaskMutation } = useAssignTask();
  const { deleteTaskMutation } = useDeleteTask();
  const { user } = useUser();

  const createTicketSubmitHandler = handleSubmit(async (data) => {
    const updateData = { title: data.title, description: data.description, priority: data.priority, column_id: data.column_id };

    if (editTask)
      await updateKanbanTaskMutation(
        { ...updateData, task_id: editTask.id },
        {
          onSuccess: async (res) => {
            if (res.data.status !== SERVER_RESPONSE_STATUS.Success) return;
            toast.success(t("task_updated"));
            await assignTaskMutation({ task_id: editTask.id, user_id: data.assignees });
          },
        },
      );
    else
      await createTaskMutation(updateData, {
        onSuccess: async (res) => {
          if (res.data.status !== SERVER_RESPONSE_STATUS.Success || !data.assignees.length) return;
          await assignTaskMutation({ task_id: res.data.data.id, user_id: data.assignees });
        },
      });
    closeModal();
  });

  const hasPermissionToDelete = editTask && (user?.role === USER_ROLE.Parent || user?.id === editTask.id);
  return (
    <div className={cn("flex mt-4", hasPermissionToDelete ? "justify-between" : "justify-end")}>
      {hasPermissionToDelete && (
        <Button variant="destructive" onClick={() => deleteTaskMutation({ id: editTask.id }, { onSuccess: closeModal })}>
          <Trash />
        </Button>
      )}
      <div className="flex gap-2">
        <Button variant="outline" onClick={closeModal}>
          {t("cancel")}
        </Button>
        <Button className="bg-cinco" onClick={createTicketSubmitHandler}>
          {t("save")}
        </Button>
      </div>
    </div>
  );
};
