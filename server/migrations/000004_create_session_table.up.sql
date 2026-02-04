CREATE TABLE IF NOT EXISTS sessions
(
    id         BIGSERIAL PRIMARY KEY,
    family_id  BIGINT                      NOT NULL REFERENCES family (id) ON DELETE CASCADE,
    user_id    BIGINT                      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token      BYTEA                       NOT NULL,
    created_at TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP(0) WITH TIME ZONE NOT NULL,
    approved   BOOLEAN                     NOT NULL DEFAULT false
);

CREATE UNIQUE INDEX session_token_idx ON sessions (token) WHERE approved = true;
CREATE INDEX sessions_user_id_idx ON sessions (user_id);
CREATE INDEX sessions_expires_at_idx ON sessions (expires_at);