export interface KanbanColumn {
  id: string;
  name: string;
}

export enum TaskPriority {
  TaskPriorityLow = 1,
  TaskPriorityMedium,
  TaskPriorityHigh,
}

export interface KanbanTask {
  id: number;
  column_id: string;
  priority: TaskPriority;
  title: string;
  description?: string;
  created_at: Date;
  family_id: number;
  creator_id: number;
}

export interface KanbanTaskAssignee {
  id: number | string;
  user_id: number;
  task_id: number;
  family_id: number;
  assigned_at: Date;
}
