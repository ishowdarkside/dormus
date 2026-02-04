import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteKanbanTaskService } from "@/modules/Kanban/services.ts";
import type { AxiosError } from "axios";
import type { ServerError } from "@/models/errors.ts";
import { toast } from "react-toastify";
import type { KanbanTask } from "@/models/Kabanan.ts";
import { KanbanQueryKeys } from "@/modules/Kanban/queryKeys.ts";
import { useTranslation } from "react-i18next";

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { mutateAsync: deleteTaskMutation } = useMutation({
    mutationFn: async ({ id }: { id: number }) => await deleteKanbanTaskService(id),
    onError: (err: AxiosError<ServerError>) => {
      toast.error(err.response?.data?.message);
    },
    onSuccess: (_, { id }) => {
      toast.success(t("task_deleted"));
      const currentTasks = queryClient.getQueryData<KanbanTask[]>(KanbanQueryKeys.Tasks);
      if (!currentTasks) return;

      const updatedTasks = currentTasks.filter((e) => e.id !== id);
      queryClient.setQueryData(KanbanQueryKeys.Tasks, updatedTasks);
    },
  });

  return { deleteTaskMutation };
};
