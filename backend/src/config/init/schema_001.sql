  -- =====================================================================
  -- 0) Start fresh --------------------------------------------------------
  DROP POLICY IF EXISTS favorites_owner ON favorites;
  ALTER TABLE IF EXISTS favorites DISABLE ROW LEVEL SECURITY;

  DROP TABLE IF EXISTS user_roles CASCADE;
  DROP TABLE IF EXISTS roles CASCADE;
  DROP TABLE IF EXISTS email_outbox CASCADE;
  DROP TABLE IF EXISTS user_consents CASCADE;
  DROP TABLE IF EXISTS favorites CASCADE;
  DROP TABLE IF EXISTS show_actors CASCADE;
  DROP TABLE IF EXISTS recommendations CASCADE;
  DROP TABLE IF EXISTS tokens CASCADE;
  DROP TABLE IF EXISTS episodes CASCADE;
  DROP TABLE IF EXISTS actors CASCADE;
  DROP TABLE IF EXISTS tv_shows CASCADE;
  DROP TABLE IF EXISTS users CASCADE;

  DROP TYPE IF EXISTS show_type CASCADE;

  -- 1) Extensions & Types -------------------------------------------------
  CREATE EXTENSION IF NOT EXISTS citext;
  CREATE EXTENSION IF NOT EXISTS pg_trgm;

  -- Controlled vocabulary for tv_shows.type
  -- Se ainda não criou o tipo, crie já com todos os valores necessários:
  CREATE TYPE show_type AS ENUM (
    'Series',
    'Miniseries',
    'Documentary',
    'Movie'
  );


  -- 2) Core Tables --------------------------------------------------------
  CREATE TABLE users (
      user_id        SERIAL PRIMARY KEY,
      username       CITEXT UNIQUE NOT NULL,
      email          CITEXT UNIQUE NOT NULL,
      password       VARCHAR(255) NOT NULL,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      deleted_at     TIMESTAMPTZ
  );

  CREATE TABLE tokens (
      token_id    SERIAL PRIMARY KEY,
      user_id     INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      token       VARCHAR(255) NOT NULL UNIQUE,
      expires_at  TIMESTAMPTZ NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_used   TIMESTAMPTZ
  );

  CREATE TABLE tv_shows (
      show_id       SERIAL PRIMARY KEY,
      title         VARCHAR(200) NOT NULL,
      description   TEXT,
      genre         VARCHAR(100),
      type          show_type,
      release_date  DATE,
      rating        NUMERIC(3,1),
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT rating_range CHECK (rating IS NULL OR (rating >= 0 AND rating <= 10))
  );

  CREATE TABLE episodes (
      episode_id     SERIAL PRIMARY KEY,
      show_id        INT NOT NULL REFERENCES tv_shows(show_id) ON DELETE CASCADE,
      title          VARCHAR(200) NOT NULL,
      episode_number INT NOT NULL,
      season_number  INT NOT NULL,
      release_date   DATE,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT uq_episode UNIQUE (show_id, season_number, episode_number)
  );

  CREATE TABLE actors (
      actor_id    SERIAL PRIMARY KEY,
      name        VARCHAR(150) NOT NULL,
      birth_date  DATE,
      biography   TEXT
  );

  CREATE TABLE show_actors (
      show_id   INT NOT NULL REFERENCES tv_shows(show_id) ON DELETE CASCADE,
      actor_id  INT NOT NULL REFERENCES actors(actor_id) ON DELETE CASCADE,
      PRIMARY KEY (show_id, actor_id)
  );

  CREATE TABLE favorites (
      user_id  INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      show_id  INT NOT NULL REFERENCES tv_shows(show_id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, show_id)
  );

  CREATE TABLE recommendations (
      recommendation_id  SERIAL PRIMARY KEY,
      user_id            INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      show_id            INT NOT NULL REFERENCES tv_shows(show_id) ON DELETE CASCADE,
      recommended_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      score              NUMERIC(4,3),
      CONSTRAINT uq_reco_user_show UNIQUE (user_id, show_id)
  );

  -- AuthZ scaffolding
  CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    name CITEXT UNIQUE NOT NULL
  );

  CREATE TABLE user_roles (
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
  );

  -- Email outbox
  CREATE TABLE email_outbox (
    email_id      SERIAL PRIMARY KEY,
    to_user_id    INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    subject       TEXT NOT NULL,
    body          TEXT NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending|sent|failed
    scheduled_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at       TIMESTAMPTZ,
    last_error    TEXT
  );

  -- GDPR / RGPD essentials
  CREATE TABLE user_consents (
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    policy_version TEXT NOT NULL,
    consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    PRIMARY KEY (user_id, policy_version)
  );

  -- Users (SERIAL will assign 1..N deterministically on empty DB)
  INSERT INTO users (username, email, password) VALUES
  ('alice',   'alice@example.com',   'hash_alice'),
  ('bob',     'bob@example.com',     'hash_bob'),
  ('charlie', 'charlie@example.com', 'hash_charlie'),
  ('admin',   'admin@admin.com',     '$2b$10$syAKuv9A88t.zRT5QRWVauIua3OH4mm2.nMqzg8KwwiF4JwdfkIUm');

  -- Roles & admin membership
  INSERT INTO roles (name) VALUES ('admin'), ('user');

  INSERT INTO user_roles (user_id, role_id)
  SELECT u.user_id, r.role_id
  FROM users u CROSS JOIN roles r
  WHERE u.username = 'admin' AND r.name = 'admin';

  -- Tokens (ids are 1 for alice, 2 for bob in a fresh DB)
  INSERT INTO tokens (user_id, token, expires_at) VALUES
  (1, 'token_alice_abc123', NOW() + INTERVAL '1 hour'),
  (2, 'token_bob_def456',   NOW() + INTERVAL '1 hour');

  -- TV shows (deterministic order → ids 1..4)
INSERT INTO tv_shows (title, description, genre, type, release_date, rating) VALUES
-- Séries dramáticas e thriller
('Game of Thrones', 'Nobles battle for control of the Iron Throne in a world of dragons and intrigue.', 'Fantasy', 'Series', '2011-04-17', 9.3),
('The Crown', 'Chronicles the reign of Queen Elizabeth II and the political rivalries of her era.', 'Drama', 'Series', '2016-11-04', 8.6),
('The Sopranos', 'A mob boss balances family life with running a criminal organization.', 'Crime', 'Series', '1999-01-10', 9.2),
('Dark', 'A German town’s secrets unravel through time travel and mysterious disappearances.', 'Mystery', 'Series', '2017-12-01', 8.8),
('Mindhunter', 'FBI agents develop criminal profiling while interviewing serial killers.', 'Crime', 'Series', '2017-10-13', 8.6),

-- Ficção científica e fantasia
('Westworld', 'A futuristic theme park with AI hosts spirals into chaos.', 'Sci-Fi', 'Series', '2016-10-02', 8.5),
('The Mandalorian', 'A lone bounty hunter navigates the Star Wars galaxy after the fall of the Empire.', 'Sci-Fi', 'Series', '2019-11-12', 8.7),
('Black Mirror', 'Standalone episodes exploring the dark side of technology and society.', 'Sci-Fi', 'Series', '2011-12-04', 8.8),
('Arcane', 'In a world of magic and technology, two sisters find themselves on opposing sides.', 'Fantasy', 'Series', '2021-11-06', 9.0),
('Cowboy Bebop', 'Space bounty hunters chase criminals while dealing with their pasts.', 'Sci-Fi', 'Series', '1998-04-03', 8.9),

-- Comédia e sitcoms
('Friends', 'Six friends navigate life, love, and work in New York City.', 'Comedy', 'Series', '1994-09-22', 8.9),
('Parks and Recreation', 'A small-town public official works to make her community better.', 'Comedy', 'Series', '2009-04-09', 8.6),
('Brooklyn Nine-Nine', 'Detectives in a New York precinct solve crimes with humor and heart.', 'Comedy', 'Series', '2013-09-17', 8.4),
('BoJack Horseman', 'A washed-up TV star, who happens to be a horse, struggles with fame and addiction.', 'Comedy/Animation', 'Series', '2014-08-22', 8.8),

-- Terror e suspense
('The Haunting of Hill House', 'A fractured family confronts haunting memories of their old home.', 'Horror', 'Miniseries', '2018-10-12', 8.6),
('Penny Dreadful', 'Famous gothic characters fight evil forces in Victorian London.', 'Horror', 'Series', '2014-05-11', 8.2),

-- Ação e aventura
('The Boys', 'A vigilante group battles corrupt superheroes in a darkly comic world.', 'Action', 'Series', '2019-07-26', 8.7),
('Vikings', 'Legendary Norse heroes seek glory and adventure across Europe.', 'History/Action', 'Series', '2013-03-03', 8.5),
('Avatar: The Last Airbender', 'A young Avatar must master all four elements to bring peace to the world.', 'Fantasy/Animation', 'Series', '2005-02-21', 9.2),

-- Romance e mistério
('Bridgerton', 'High society scandals and romance unfold in Regency-era London.', 'Romance', 'Series', '2020-12-25', 7.4),
('Big Little Lies', 'A murder in a wealthy coastal town exposes deep secrets and lies.', 'Mystery/Drama', 'Miniseries', '2017-02-19', 8.5);



  -- Episodes (by numeric show_id since this is a clean DB)
  INSERT INTO episodes (show_id, title, episode_number, season_number, release_date) VALUES
  (1, 'Pilot', 1, 1, '2008-01-20'),
  (1, 'Cats in the Bag...', 2, 1, '2008-01-27'),
  (2, 'The Vanishing of Will Byers', 1, 1, '2016-07-15'),
  (2, 'The Weirdo on Maple Street', 2, 1, '2016-07-15'),
  (3, 'Pilot', 1, 1, '2005-03-24'),
  (3, 'Diversity Day', 2, 1, '2005-03-29'),
  (4, 'The Ends Beginning', 1, 1, '2019-12-20'),
  (4, 'Four Marks', 2, 1, '2019-12-20');

  -- Actors
  INSERT INTO actors (name, birth_date, biography) VALUES
  ('Bryan Cranston', '1956-03-07', 'American actor and director, known for Breaking Bad.'),
  ('Aaron Paul', '1979-08-27', 'American actor known for his role as Jesse Pinkman.'),
  ('Winona Ryder', '1971-10-29', 'American actress starring in Stranger Things.'),
  ('Millie Bobby Brown', '2004-02-19', 'British actress known for playing Eleven.'),
  ('Steve Carell', '1962-08-16', 'American actor and comedian, star of The Office.'),
  ('Henry Cavill', '1983-05-05', 'British actor known for playing Geralt in The Witcher.'),
  
  -- Game of Thrones actors
  ('Peter Dinklage', '1969-06-11', 'American actor known for playing Tyrion Lannister in Game of Thrones.'),
  ('Emilia Clarke', '1986-10-23', 'British actress known for playing Daenerys Targaryen.'),
  ('Kit Harington', '1986-12-26', 'British actor known for playing Jon Snow.'),
  
  -- The Crown actors
  ('Claire Foy', '1984-04-16', 'British actress known for playing Queen Elizabeth II in The Crown.'),
  ('Matt Smith', '1982-10-28', 'British actor known for playing Prince Philip.'),
  
  -- The Sopranos actors
  ('James Gandolfini', '1961-09-18', 'American actor known for playing Tony Soprano.'),
  ('Edie Falco', '1963-07-05', 'American actress known for playing Carmela Soprano.'),
  
  -- Friends actors
  ('Jennifer Aniston', '1969-02-11', 'American actress known for playing Rachel Green in Friends.'),
  ('Courteney Cox', '1964-06-15', 'American actress known for playing Monica Geller.'),
  ('Matthew Perry', '1969-08-19', 'American actor known for playing Chandler Bing.'),
  
  -- The Mandalorian actors
  ('Pedro Pascal', '1975-04-02', 'Chilean-American actor known for playing The Mandalorian.'),
  ('Gina Carano', '1982-04-16', 'American actress and former MMA fighter.'),
  
  -- Westworld actors
  ('Evan Rachel Wood', '1987-09-07', 'American actress known for playing Dolores Abernathy.'),
  ('Anthony Hopkins', '1937-12-31', 'Welsh actor known for playing Dr. Robert Ford.'),
  
  -- Black Mirror actors
  ('Jesse Plemons', '1988-04-02', 'American actor appearing in multiple Black Mirror episodes.'),
  ('Bryce Dallas Howard', '1981-03-02', 'American actress and director.'),
  
  -- Vikings actors
  ('Travis Fimmel', '1979-07-15', 'Australian actor known for playing Ragnar Lothbrok.'),
  ('Katheryn Winnick', '1977-12-17', 'Canadian actress known for playing Lagertha.'),
  
  -- The Boys actors
  ('Karl Urban', '1972-06-07', 'New Zealand actor known for playing Billy Butcher.'),
  ('Antony Starr', '1975-10-25', 'New Zealand actor known for playing Homelander.');

  -- Show–actors
  INSERT INTO show_actors (show_id, actor_id) VALUES
  -- Game of Thrones (show_id: 1)
  (1, 7), (1, 8), (1, 9),
  
  -- The Crown (show_id: 2) 
  (2, 10), (2, 11),
  
  -- The Sopranos (show_id: 3)
  (3, 12), (3, 13),
  
  -- Dark (show_id: 4) - keeping Henry Cavill for now
  (4, 6),
  
  -- Westworld (show_id: 6)
  (6, 19), (6, 20),
  
  -- The Mandalorian (show_id: 7)
  (7, 17), (7, 18),
  
  -- Black Mirror (show_id: 8)
  (8, 21), (8, 22),
  
  -- Friends (show_id: 11)
  (11, 14), (11, 15), (11, 16),
  
  -- Vikings (show_id: 18)
  (18, 23), (18, 24),
  
  -- The Boys (show_id: 17)
  (17, 25), (17, 26);

  -- Favorites
  INSERT INTO favorites (user_id, show_id) VALUES
  (1, 1),
  (1, 2),
  (2, 3),
  (3, 4);

  -- Recommendations
  INSERT INTO recommendations (user_id, show_id) VALUES
  (1, 4),
  (2, 1),
  (3, 2);

  -- Email outbox example
  INSERT INTO email_outbox (to_user_id, subject, body)
  VALUES (1, 'Welcome, Alice!', 'Thanks for signing up 🎉');


  -- More users
INSERT INTO users (username, email, password) VALUES
  ('diana',   'diana@example.com',   'hash_diana'),
  ('eduardo', 'eduardo@example.com', 'hash_eduardo'),
  ('filipa',  'filipa@example.com',  'hash_filipa'),
  ('goncalo', 'goncalo@example.com', 'hash_goncalo'),
  ('helena',  'helena@example.com',  'hash_helena'),
  ('ivo',     'ivo@example.com',     'hash_ivo'),
  ('joana',   'joana@example.com',   'hash_joana'),
  ('karim',   'karim@example.com',   'hash_karim')
ON CONFLICT DO NOTHING;

-- Give 'user' role to the new users
INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u CROSS JOIN roles r
WHERE r.name = 'user' AND u.username IN ('diana','eduardo','filipa','goncalo','helena','ivo','joana','karim')
ON CONFLICT DO NOTHING;

-- Tokens for a couple of users
INSERT INTO tokens (user_id, token, expires_at)
SELECT u.user_id, 'tok_' || u.username || '_001', NOW() + INTERVAL '365 days'
FROM users u
WHERE u.username IN ('diana','eduardo')
ON CONFLICT DO NOTHING;

-- Extra TV shows
INSERT INTO tv_shows (title, description, genre, type, release_date, rating) VALUES
  ('Breaking Bad', 'A chemistry teacher turns to making meth after a cancer diagnosis.', 'Crime', 'Series', '2008-01-20', 9.5),
  ('Stranger Things', 'Kids in 1980s Indiana face supernatural forces and secret experiments.', 'Sci-Fi', 'Series', '2016-07-15', 8.8),
  ('The Office (US)', 'Mockumentary about office employees at Dunder Mifflin.', 'Comedy', 'Series', '2005-03-24', 8.9),
  ('Chernobyl', 'Miniseries about the 1986 nuclear disaster.', 'Drama', 'Miniseries', '2019-05-06', 9.4),
  ('The Last of Us', 'A hardened smuggler escorts a teenage girl across a post‑pandemic U.S.', 'Drama', 'Series', '2023-01-15', 8.8),
  ('Severance', 'Employees undergo a procedure to separate work and personal memories.', 'Sci-Fi', 'Series', '2022-02-18', 8.7)
ON CONFLICT DO NOTHING;

-- Episodes for existing shows (use subselects to reference show_id)
INSERT INTO episodes (show_id, title, episode_number, season_number, release_date) VALUES
  ((SELECT show_id FROM tv_shows WHERE title='Game of Thrones'), 'Winter Is Coming', 1, 1, '2011-04-17'),
  ((SELECT show_id FROM tv_shows WHERE title='Game of Thrones'), 'The Kingsroad', 2, 1, '2011-04-24'),
  ((SELECT show_id FROM tv_shows WHERE title='The Crown'), 'Wolferton Splash', 1, 1, '2016-11-04'),
  ((SELECT show_id FROM tv_shows WHERE title='Stranger Things'), 'The Vanishing of Will Byers', 1, 1, '2016-07-15'),
  ((SELECT show_id FROM tv_shows WHERE title='The Office (US)'), 'Pilot', 1, 1, '2005-03-24'),
  ((SELECT show_id FROM tv_shows WHERE title='The Office (US)'), 'Diversity Day', 2, 1, '2005-03-29'),
  ((SELECT show_id FROM tv_shows WHERE title='Chernobyl'), '1:23:45', 1, 1, '2019-05-06'),
  ((SELECT show_id FROM tv_shows WHERE title='The Last of Us'), 'When You''re Lost in the Darkness', 1, 1, '2023-01-15')
ON CONFLICT DO NOTHING;

-- New actors (skip ones that likely already exist in your file)
INSERT INTO actors (name, birth_date, biography) VALUES
  ('Bob Odenkirk', '1962-10-22', 'American actor known for Better Call Saul.'),
  ('Rhea Seehorn', '1972-05-12', 'American actress known for Better Call Saul.'),
  ('Jared Harris', '1961-08-24', 'British actor known for Chernobyl.'),
  ('Paul Mescal', '1996-02-02', 'Irish actor known for Normal People.'),
  ('Pedro Pascal', '1975-04-02', 'Chilean-American actor known for The Mandalorian and The Last of Us.')
ON CONFLICT DO NOTHING;

-- Link actors to shows (via subselects)
INSERT INTO show_actors (show_id, actor_id)
SELECT (SELECT show_id FROM tv_shows WHERE title='Chernobyl'),
       a.actor_id
FROM actors a
WHERE a.name IN ('Jared Harris')
ON CONFLICT DO NOTHING;

INSERT INTO show_actors (show_id, actor_id)
SELECT (SELECT show_id FROM tv_shows WHERE title='The Last of Us'),
       a.actor_id
FROM actors a
WHERE a.name IN ('Pedro Pascal')
ON CONFLICT DO NOTHING;

-- Favorites for the new users
INSERT INTO favorites (user_id, show_id)
SELECT u.user_id, s.show_id
FROM users u
JOIN tv_shows s ON s.title IN ('Game of Thrones','The Office (US)','Stranger Things')
WHERE u.username IN ('diana','eduardo','filipa')
ON CONFLICT DO NOTHING;

-- Recommendations for the new users
INSERT INTO recommendations (user_id, show_id)
SELECT u.user_id, s.show_id
FROM users u
JOIN tv_shows s ON s.title IN ('Chernobyl','Severance')
WHERE u.username IN ('goncalo','helena')
ON CONFLICT DO NOTHING;

-- Email outbox samples
INSERT INTO email_outbox (to_user_id, subject, body, status)
SELECT u.user_id, 'Weekly Picks', 'Here are some shows you might like ✨', 'pending'
FROM users u
WHERE u.username IN ('diana','helena')
ON CONFLICT DO NOTHING;

-- User consents
INSERT INTO user_consents (user_id, policy_version)
SELECT u.user_id, 'v1.0'
FROM users u
WHERE u.username IN ('diana','eduardo','filipa','goncalo','helena','ivo','joana','karim')
ON CONFLICT DO NOTHING;

-- =============================================================

  -- 3) Indexes ------------------------------------------------------------
  -- FK helpers
  CREATE INDEX idx_tokens_user_id           ON tokens(user_id);
  CREATE INDEX idx_episodes_show_id         ON episodes(show_id);
  CREATE INDEX idx_show_actors_actor_id     ON show_actors(actor_id);
  CREATE INDEX idx_favorites_user_id        ON favorites(user_id);
  CREATE INDEX idx_favorites_show_id        ON favorites(show_id);
  CREATE INDEX idx_recommendations_user_id  ON recommendations(user_id);
  CREATE INDEX idx_recommendations_show_id  ON recommendations(show_id);

  -- Token hygiene
  CREATE INDEX idx_tokens_not_expired ON tokens(expires_at) WHERE expires_at > now();
  CREATE INDEX idx_tokens_token       ON tokens(token);

  -- Show / episode convenience
  CREATE INDEX idx_tv_shows_genre ON tv_shows(genre);
  CREATE INDEX idx_tv_shows_type  ON tv_shows(type);
  CREATE INDEX idx_tv_shows_title ON tv_shows(title);
  CREATE INDEX idx_episodes_show_season_ep ON episodes(show_id, season_number, episode_number);

  -- Trigram search
  CREATE INDEX idx_tv_shows_title_trgm ON tv_shows USING gin (title gin_trgm_ops);
  CREATE INDEX idx_episodes_title_trgm ON episodes USING gin (title gin_trgm_ops);

  -- Outbox helper
  CREATE INDEX idx_email_outbox_status_sched ON email_outbox(status, scheduled_at);

  -- 4) Seeds --------------------------------------------------------------


  -- 5) Enable RLS (after seeds) ------------------------------------------
  ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

  CREATE POLICY favorites_owner
    ON favorites FOR ALL
    USING (user_id = current_setting('app.user_id', true)::INT);

  -- =====================================================================
  -- Done
  -- =====================================================================
