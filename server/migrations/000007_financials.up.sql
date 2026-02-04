CREATE TABLE IF NOT EXISTS bills
(
    id         BIGSERIAL PRIMARY KEY,
    due_date   TIMESTAMP(0) WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW(),
    name       TEXT                        NOT NULL,
    price      NUMERIC(12, 4)              NOT NULL,
    status     TEXT                        NOT NULL,
    creator_id BIGINT                      NOT NULL REFERENCES users (id),
    family_id  BIGINT                      NOT NULL REFERENCES family (id)
);

CREATE TABLE IF NOT EXISTS budget
(
    id         BIGSERIAL PRIMARY KEY,
    name       TEXT                        NOT NULL,
    created_at TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW(),
    price      NUMERIC(12, 4)              NOT NULL,
    progress   NUMERIC(12, 4)              NOT NULL,
    creator_id BIGINT                      NOT NULL REFERENCES users (id),
    family_id  BIGINT                      NOT NULL REFERENCES family (id)
)



