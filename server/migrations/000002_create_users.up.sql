CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS users
(
    id           BIGSERIAL PRIMARY KEY,
    family_id    BIGINT REFERENCES family (id),
    created_at   TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version      SMALLINT                             DEFAULT 1,
    role         TEXT                        NOT NULL,
    age          smallint                    NOT NULL,
    gender       TEXT                        NOT NULL,
    name         TEXT                        NOT NULL,
    email        citext UNIQUE               NOT NULL,
    phone_number TEXT UNIQUE                 NOT NULL,
    date_joined  TIMESTAMP(0) WITH TIME ZONE,
    last_seen    TIMESTAMP(0) WITH TIME ZONE,
    region       TEXT                        NOT NULL
);

CREATE INDEX users_family_id_idx ON users (family_id);
