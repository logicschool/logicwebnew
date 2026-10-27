CREATE TABLE IF NOT EXISTS website_content (id text PRIMARY KEY, data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS website_content_kind ON website_content ((data->>'kind'));
INSERT INTO schema_migrations(version) VALUES ('004-website-content') ON CONFLICT DO NOTHING;
