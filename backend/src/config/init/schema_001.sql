-- =====================================================================
-- Single Postgres setup + migration script (idempotent where possible)
-- - Keeps your existing schema
-- - Adds PG niceties (citext, trgm), indexes, constraints, and utility tables
-- - Hardens auth, search, and ops
-- =====================================================================

-- 0) Extensions ---------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- Optional: UUIDs for new tables
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Core tables (your originals, left as-is; SAFE if they already exist)
CREATE TABLE IF NOT EXISTS users (
    user_id        SERIAL PRIMARY KEY,
    username       VARCHAR(50) UNIQUE NOT NULL,
    email          VARCHAR(100) UNIQUE NOT NULL,
    password       VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS tokens (
    token_id    SERIAL PRIMARY KEY,
    user_id     INT NOT NULL,
    token       VARCHAR(255) NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_tokens_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tv_shows (
    show_id       SERIAL PRIMARY KEY,
    title         VARCHAR(200) NOT NULL,
    description   TEXT,
    genre         VARCHAR(100),
    type          VARCHAR(50),
    release_date  DATE,
    rating        NUMERIC(3,1),
    CONSTRAINT rating_range CHECK (rating IS NULL OR (rating >= 0 AND rating <= 10))
);

CREATE TABLE IF NOT EXISTS episodes (
    episode_id     SERIAL PRIMARY KEY,
    show_id        INT NOT NULL,
    title          VARCHAR(200) NOT NULL,
    episode_number INT NOT NULL,
    season_number  INT NOT NULL,
    release_date   DATE,
    CONSTRAINT fk_episodes_show
        FOREIGN KEY (show_id) REFERENCES tv_shows(show_id) ON DELETE CASCADE,
    CONSTRAINT uq_episode UNIQUE (show_id, season_number, episode_number)
);

CREATE TABLE IF NOT EXISTS actors (
    actor_id    SERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    birth_date  DATE,
    biography   TEXT
);

CREATE TABLE IF NOT EXISTS show_actors (
    show_id   INT NOT NULL,
    actor_id  INT NOT NULL,
    PRIMARY KEY (show_id, actor_id),
    CONSTRAINT fk_showactors_show
        FOREIGN KEY (show_id) REFERENCES tv_shows(show_id) ON DELETE CASCADE,
    CONSTRAINT fk_showactors_actor
        FOREIGN KEY (actor_id) REFERENCES actors(actor_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favorites (
    user_id  INT NOT NULL,
    show_id  INT NOT NULL,
    PRIMARY KEY (user_id, show_id),
    CONSTRAINT fk_favorites_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_favorites_show
        FOREIGN KEY (show_id) REFERENCES tv_shows(show_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recommendations (
    recommendation_id  SERIAL PRIMARY KEY,
    user_id            INT NOT NULL,
    show_id            INT NOT NULL,
    recommended_at     TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_recommendations_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_recommendations_show
        FOREIGN KEY (show_id) REFERENCES tv_shows(show_id) ON DELETE CASCADE
);

-- 2) Helpful indexes for existing FKs ----------------------------------
CREATE INDEX IF NOT EXISTS idx_tokens_user_id           ON tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_episodes_show_id         ON episodes(show_id);
CREATE INDEX IF NOT EXISTS idx_show_actors_actor_id     ON show_actors(actor_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id        ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_show_id        ON favorites(show_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id  ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_show_id  ON recommendations(show_id);

-- 3) Postgres-specific upgrades ----------------------------------------

-- 3a) Case-insensitive login: switch users.username/email to CITEXT
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name='users' AND column_name='username' AND data_type <> 'citext'
  ) THEN
    ALTER TABLE users ALTER COLUMN username TYPE CITEXT;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name='users' AND column_name='email' AND data_type <> 'citext'
  ) THEN
    ALTER TABLE users ALTER COLUMN email TYPE CITEXT;
  END IF;
END$$;

-- 3b) Token hygiene
ALTER TABLE tokens
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_used  TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_tokens_token'
  ) THEN
    ALTER TABLE tokens ADD CONSTRAINT uq_tokens_token UNIQUE (token);
  END IF;
END$$;

-- Expiry sweep helpers & lookups
CREATE INDEX IF NOT EXISTS idx_tokens_not_expired
  ON tokens(expires_at)
  WHERE expires_at > now();

CREATE INDEX IF NOT EXISTS idx_tokens_token ON tokens(token);

-- 3c) Useful show/episode indexes & trigram search for titles
CREATE INDEX IF NOT EXISTS idx_tv_shows_genre ON tv_shows(genre);
CREATE INDEX IF NOT EXISTS idx_tv_shows_type  ON tv_shows(type);
CREATE INDEX IF NOT EXISTS idx_tv_shows_title ON tv_shows(title);
CREATE INDEX IF NOT EXISTS idx_episodes_show_season_ep
  ON episodes(show_id, season_number, episode_number);

CREATE INDEX IF NOT EXISTS idx_tv_shows_title_trgm
  ON tv_shows USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_episodes_title_trgm
  ON episodes USING gin (title gin_trgm_ops);

-- 3d) Timestamps (light audit)
ALTER TABLE users     ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE tv_shows  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE episodes  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 3e) Controlled vocab for tv_shows.type via ENUM (safe creation)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'show_type') THEN
    CREATE TYPE show_type AS ENUM ('Drama','Sitcom','Animation','Miniseries','Documentary','Sci-Fi','Fantasy','Comedy');
  END IF;
  -- only alter if column exists and isn't already enum
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name='tv_shows' AND column_name='type'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name='tv_shows' AND column_name='type' AND udt_name='show_type'
  ) THEN
    -- Attempt cast; if it fails, you may need to map values first.
    ALTER TABLE tv_shows
      ALTER COLUMN type TYPE show_type USING (CASE
        WHEN type IN ('Drama','Sitcom','Animation','Miniseries','Documentary','Sci-Fi','Fantasy','Comedy')
          THEN type::show_type
        ELSE NULL
      END);
  END IF;
END$$;

-- 3f) Basic authorization scaffolding (roles & membership)
CREATE TABLE IF NOT EXISTS roles (
  role_id SERIAL PRIMARY KEY,
  name CITEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  role_id INT NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- 3g) Email outbox (for background mailer worker)
CREATE TABLE IF NOT EXISTS email_outbox (
  email_id      SERIAL PRIMARY KEY,
  to_user_id    INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  subject       TEXT NOT NULL,
  body          TEXT NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending|sent|failed
  scheduled_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at       TIMESTAMPTZ,
  last_error    TEXT
);
CREATE INDEX IF NOT EXISTS idx_email_outbox_status_sched
  ON email_outbox(status, scheduled_at);

-- 3h) GDPR / RGPD essentials
CREATE TABLE IF NOT EXISTS user_consents (
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  policy_version TEXT NOT NULL,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, policy_version)
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 3i) Recommendation hygiene
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_reco_user_show'
  ) THEN
    ALTER TABLE recommendations
      ADD CONSTRAINT uq_reco_user_show UNIQUE (user_id, show_id);
  END IF;
END$$;

ALTER TABLE recommendations
  ADD COLUMN IF NOT EXISTS score NUMERIC(4,3);

-- 3j) RLS (optional) for favorites (requires your app to SET app.user_id)
DO $$
BEGIN
  -- enable only once
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'favorites'
  ) THEN
    -- table not present (handled above), nothing to do here
    NULL;
  ELSE
    -- enable RLS if not already enabled
    PERFORM 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname='public' AND c.relname='favorites' AND c.relrowsecurity;
    IF NOT FOUND THEN
      ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
    END IF;

    -- create policy if missing
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='favorites' AND policyname='favorites_owner'
    ) THEN
      CREATE POLICY favorites_owner
        ON favorites FOR ALL
        USING (user_id = current_setting('app.user_id', true)::INT);
    END IF;
  END IF;
END$$;

-- 4) Seed data (safe re-inserts) ---------------------------------------
INSERT INTO users (user_id, username, email, password) VALUES
('alice', 'alice@example.com', 'hash_alice'),
('bob', 'bob@example.com', 'hash_bob'),
('charlie', 'charlie@example.com', 'hash_charlie'),
('admin', 'admin@admin.com', '$2b$10$syAKuv9A88t.zRT5QRWVauIua3OH4mm2.nMqzg8KwwiF4JwdfkIUm')
ON CONFLICT DO NOTHING;

INSERT INTO tokens (user_id, token, expires_at) VALUES
(1, 'token_alice_abc123', NOW() + INTERVAL '1 hour'),
(2, 'token_bob_def456',   NOW() + INTERVAL '1 hour')
ON CONFLICT DO NOTHING;

INSERT INTO tv_shows (title, description, genre, type, release_date, rating) VALUES
('Breaking Bad', 'A chemistry teacher turns to making meth to secure his familys future.', 'Crime', 'Drama', '2008-01-20', 9.5),
('Stranger Things', 'Kids in a small town uncover supernatural mysteries.', 'Sci-Fi', 'Drama', '2016-07-15', 8.7),
('The Office', 'Mockumentary sitcom about the everyday work life of office employees.', 'Comedy', 'Sitcom', '2005-03-24', 8.9),
('The Witcher', 'A monster hunter struggles to find his place in a world of magic and politics.', 'Fantasy', 'Drama', '2019-12-20', 8.2)
ON CONFLICT DO NOTHING;

INSERT INTO episodes (show_id, title, episode_number, season_number, release_date) VALUES
(1, 'Pilot', 1, 1, '2008-01-20'),
(1, 'Cats in the Bag...', 2, 1, '2008-01-27'),
(2, 'The Vanishing of Will Byers', 1, 1, '2016-07-15'),
(2, 'The Weirdo on Maple Street', 2, 1, '2016-07-15'),
(3, 'Pilot', 1, 1, '2005-03-24'),
(3, 'Diversity Day', 2, 1, '2005-03-29'),
(4, 'The Ends Beginning', 1, 1, '2019-12-20'),
(4, 'Four Marks', 2, 1, '2019-12-20')
ON CONFLICT DO NOTHING;

INSERT INTO actors (name, birth_date, biography) VALUES
('Bryan Cranston', '1956-03-07', 'American actor and director, known for Breaking Bad.'),
('Aaron Paul', '1979-08-27', 'American actor known for his role as Jesse Pinkman.'),
('Winona Ryder', '1971-10-29', 'American actress starring in Stranger Things.'),
('Millie Bobby Brown', '2004-02-19', 'British actress known for playing Eleven.'),
('Steve Carell', '1962-08-16', 'American actor and comedian, star of The Office.'),
('Henry Cavill', '1983-05-05', 'British actor known for playing Geralt in The Witcher.')
ON CONFLICT DO NOTHING;

INSERT INTO show_actors (show_id, actor_id) VALUES
(1, 1),
(1, 2),
(2, 3),
(2, 4),
(3, 5),
(4, 6)
ON CONFLICT DO NOTHING;

INSERT INTO favorites (user_id, show_id) VALUES
(1, 1),
(1, 2),
(2, 3),
(3, 4)
ON CONFLICT DO NOTHING;

INSERT INTO recommendations (user_id, show_id) VALUES
(1, 4),
(2, 1),
(3, 2)
ON CONFLICT DO NOTHING;

-- Optional seeds for roles
INSERT INTO roles (name) VALUES ('admin'), ('user')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- Done
-- =====================================================================
