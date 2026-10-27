CREATE TABLE IF NOT EXISTS recorded_classes (id text PRIMARY KEY, data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
INSERT INTO schema_migrations(version) VALUES ('003-recorded-classes') ON CONFLICT DO NOTHING;
