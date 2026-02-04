CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS kanban_columns
(
    id         UUID PRIMARY KEY                     DEFAULT gen_random_uuid(),
    name       TEXT                        NOT NULL,
    created_at TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kanban_tasks
(
    id          BIGSERIAL,
    column_id   UUID        NOT NULL REFERENCES kanban_columns (id) ON DELETE CASCADE,
    title       TEXT        NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    family_id   BIGINT      NOT NULL REFERENCES family (id),
    creator_id  BIGINT      NOT NULL REFERENCES users (id),
    priority    SMALLINT    NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (id, family_id)
);

CREATE TABLE IF NOT EXISTS kanban_task_assignees
(
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT      NOT NULL REFERENCES users (id),
    task_id     BIGINT      NOT NULL,
    family_id   BIGINT      NOT NULL REFERENCES family (id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_task_family FOREIGN KEY (task_id, family_id) REFERENCES kanban_tasks (id, family_id) ON DELETE CASCADE,
    CONSTRAINT ux_task_user UNIQUE (task_id, user_id)
);

CREATE INDEX idx_kanban_tasks_family_column
    ON kanban_tasks (family_id, column_id);

CREATE INDEX idx_kanban_tasks_creator
    ON kanban_tasks (creator_id);

CREATE INDEX idx_kanban_task_assignees_user
    ON kanban_task_assignees (user_id);

CREATE INDEX idx_kanban_task_assignees_family
    ON kanban_task_assignees (family_id);


INSERT INTO kanban_columns (name)
VALUES ('todo'),
       ('in_progress'),
       ('done')
