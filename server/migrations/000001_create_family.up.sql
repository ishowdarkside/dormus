CREATE TABLE IF NOT EXISTS family
(
    id           BIGSERIAL PRIMARY KEY,
    name         TEXT                        NOT NULL,
    created_at   TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version      INTEGER                     NOT NULL DEFAULT 1,
    invite_token TEXT                        NOT NULL
);