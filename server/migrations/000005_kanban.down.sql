DROP INDEX IF EXISTS idx_kanban_task_assignees_family;
DROP INDEX IF EXISTS idx_kanban_task_assignees_user;
DROP INDEX IF EXISTS idx_kanban_tasks_creator;
DROP INDEX IF EXISTS idx_kanban_tasks_family_column;

DROP TABLE IF EXISTS kanban_task_assignees;
DROP TABLE IF EXISTS kanban_tasks;
DROP TABLE IF EXISTS kanban_columns;