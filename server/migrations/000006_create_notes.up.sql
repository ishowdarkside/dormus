CREATE TABLE IF NOT EXISTS notes
(
    id          BIGSERIAL PRIMARY KEY,
    title       TEXT                        NOT NULL,
    description TEXT,
    created_by  BIGINT                      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at  TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW(),
    family_id   BIGINT                      NOT NULL REFERENCES family (id) ON DELETE CASCADE,
    is_pinned   BOOL                        NOT NULL DEFAULT false
)