export const KanbanQueryKeys = {
  Columns: [{ component: "KanbanBoard", params: { name: "kanban_columns", type: "remote" } }] as const,
  Tasks: [{ component: "KanbanBoard", params: { name: "kanban_tasks", type: "remote" } }] as const,
  TaskAssignments: [{ component: "KanbanBoard", params: { name: "kanban_task_assignees", type: "remote" } }] as const,
};
