import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { KanbanTask, KanbanTaskAssignee } from "@/models/Kabanan.ts";
import type { AxiosError } from "axios";
import type { ServerError } from "@/models/errors.ts";
import { KanbanQueryKeys } from "@/modules/Kanban/queryKeys.ts";
import {
  assignKanbanTaskService,
  createKanbanTaskService,
  retrieveKanbanTasksService,
  retrieveTaskAssignmentsService,
  updateKanbanTaskService,
} from "@/modules/Kanban/services.ts";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { SERVER_RESPONSE_STATUS } from "@/utils/common.ts";

export const useKanbanTasks = () => {
  const { data: kanbanTasks, isLoading: isLoadingKanbanTasks } = useQuery<KanbanTask[], AxiosError<ServerError>>({
    queryKey: KanbanQueryKeys.Tasks,
    queryFn: () => retrieveKanbanTasksService().then((e) => e.data.data ?? []),
    placeholderData: [],
  });

  return { kanbanTasks: kanbanTasks ?? [], isLoadingKanbanTasks };
};

export const useUpdateKanbanTask = () => {
  const { mutateAsync: updateKanbanTaskMutation } = useMutation({
    mutationFn: updateKanbanTaskService,

    onError: (err: AxiosError<ServerError>) => {
      toast.error(err.response?.data?.message);
    },
  });

  return { updateKanbanTaskMutation };
};

export const useCreateKanbanTask = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { mutateAsync: createTaskMutation } = useMutation({
    mutationFn: createKanbanTaskService,
    onSuccess: (res) => {
      if (res.data.status !== SERVER_RESPONSE_STATUS.Success) return toast.error(t(res.data.message));

      const currentTasks = queryClient.getQueryData<KanbanTask[]>(KanbanQueryKeys.Tasks);
      if (!currentTasks) return;

      toast.success(t(res.data.message));
      const isTaskAlreadyAdded = currentTasks.some((task) => task.id === res.data.data.id);
      if (isTaskAlreadyAdded) return;
      queryClient.setQueryData(KanbanQueryKeys.Tasks, [...currentTasks, res.data.data]);
    },
    onError: (err: AxiosError<ServerError>) => {
      toast.error(err.response?.data?.message);
    },
  });

  return { createTaskMutation };
};

export const useAssignTask = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: assignTaskMutation } = useMutation({
    mutationFn: assignKanbanTaskService,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KanbanQueryKeys.TaskAssignments }),
  });

  return { assignTaskMutation };
};

export const useFamilyTaskAssignments = () => {
  const { data: kanbanTaskAssignees, isLoading } = useQuery<KanbanTaskAssignee[], AxiosError<ServerError>>({
    queryFn: async () => {
      const res = await retrieveTaskAssignmentsService();
      return res.data.data;
    },
    queryKey: KanbanQueryKeys.TaskAssignments,
    staleTime: 0,
    gcTime: 0,
  });

  return { kanbanTaskAssignees, isLoading };
};

export const useGetMatchingAssigneesForTask = (taskId: number | undefined) => {
  const { kanbanTaskAssignees } = useFamilyTaskAssignments();
  if (!taskId || !kanbanTaskAssignees) return [];
  return kanbanTaskAssignees?.filter((assignee) => assignee.task_id === taskId);
};
