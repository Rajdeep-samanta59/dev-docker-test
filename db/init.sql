-- ===================================================
-- This script runs AUTOMATICALLY when the Postgres
-- container starts for the FIRST TIME.
-- Docker mounts it into /docker-entrypoint-initdb.d/
-- ===================================================

CREATE TABLE IF NOT EXISTS tasks (
    id          SERIAL PRIMARY KEY,          -- Auto-incrementing ID
    title       VARCHAR(255) NOT NULL,       -- Task description
    completed   BOOLEAN DEFAULT FALSE,       -- Status flag
    created_at  TIMESTAMP DEFAULT NOW()      -- When it was created
);

-- Insert a couple of sample tasks so the app isn't empty on first load
INSERT INTO tasks (title) VALUES ('task 1 ');
INSERT INTO tasks (title) VALUES ('task 2 ');
INSERT INTO tasks (title) VALUES ('task 3 ');
