import { api, ApiService } from "@/lib/api.ts";
import type {
  assignKanbanTaskPayloadModel,
  assignKanbanTaskResponseModel,
  CreateEditTicketAndAssigneeModel,
  CreateTicketAndAssigneeResponseModel,
  retrieveColumnsResponseModel,
  retrieveKanbanTasksResponseModel,
  RetrieveTaskAssigneesResponseModel,
  updateKanbanColumnPayloadModel,
  updateKanbanColumnResponseModel,
} from "@/modules/Kanban/types.ts";

export const retrieveColumnsService = async () => {
  return await ApiService.get<retrieveColumnsResponseModel>(api.kanban_columns);
};

export const retrieveKanbanTasksService = async () => {
  return await ApiService.get<retrieveKanbanTasksResponseModel>(api.kanban_tasks);
};

export const updateKanbanTaskService = async (data: updateKanbanColumnPayloadModel) => {
  return await ApiService.post<updateKanbanColumnPayloadModel, updateKanbanColumnResponseModel>(api.kanban_tasks, "/update", data);
};

export const createKanbanTaskService = async (data: Partial<CreateEditTicketAndAssigneeModel>) => {
  return await ApiService.post<Partial<CreateEditTicketAndAssigneeModel>, CreateTicketAndAssigneeResponseModel>(
    api.kanban_tasks,
    "/create",
    data,
  );
};

export const deleteKanbanTaskService = async (id: number) => {
  return await ApiService.delete(api.kanban_tasks, `/${id}`);
};

export const assignKanbanTaskService = async (data: assignKanbanTaskPayloadModel) => {
  return await ApiService.post<assignKanbanTaskPayloadModel, assignKanbanTaskResponseModel>(api.kanban_tasks, "/assignee", data);
};

export const retrieveTaskAssignmentsService = async () => {
  return await ApiService.get<RetrieveTaskAssigneesResponseModel>(api.kanban_tasks, "/assignee");
};
