import { type KanbanColumn, type KanbanTask, type KanbanTaskAssignee, TaskPriority } from "@/models/Kabanan.ts";

export interface retrieveColumnsResponseModel {
  status: string;
  data?: KanbanColumn[];
}

export interface retrieveKanbanTasksResponseModel {
  status: string;
  data?: KanbanTask[];
}

export interface updateKanbanColumnPayloadModel {
  title?: string;
  description?: string;
  column_id?: string;
  task_id: number;
}

export interface assignKanbanTaskPayloadModel {
  user_id: number[];
  task_id: number;
}

export interface assignKanbanTaskResponseModel {
  status: string;
  message: string;
}

export interface updateKanbanColumnResponseModel {
  message: string;
  status: string;
}

export interface CreateEditTicketAndAssigneeModel {
  column_id: string;
  title: string;
  priority: TaskPriority;
  description: string;
  assignees: number[];
  task_id: number;
}

export interface CreateTicketAndAssigneeResponseModel {
  data: KanbanTask;
  message: string;
  status: string;
}

export interface RetrieveTaskAssigneesResponseModel {
  data: KanbanTaskAssignee[];
  status: string;
}
