CREATE TABLE IF NOT EXISTS status (
    id BIGSERIAL PRIMARY KEY,
    status TEXT NOT NULL,
    emoji TEXT,
    created_at TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW(),
    user_id BIGINT NOT NULL REFERENCES users(id)
);


-- add reference to users - status id
ALTER TABLE users ADD COLUMN IF NOT EXISTS status_id BIGINT REFERENCES status(id) ON DELETE SET NULL;

-- Remove family_id reference from users and add it again with on delete cascade constraint
ALTER TABLE users DROP CONSTRAINT users_family_id_fkey;
ALTER TABLE users ADD CONSTRAINT users_family_id_fkey FOREIGN KEY (family_id) REFERENCES family(id) ON DELETE CASCADE;


-- Add constraint to guarantee uniquness among statuses for each user

ALTER TABLE status ADD CONSTRAINT unique_user_status UNIQUE (user_id, status);