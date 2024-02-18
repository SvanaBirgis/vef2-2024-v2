CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name CHARACTER varying(64) NOT NULL UNIQUE
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name CHARACTER VARYING(64) NOT NULL,
  username CHARACTER varying(64) NOT NULL UNIQUE,
  password CHARACTER varying(256) NOT NULL,
  admin BOOLEAN DEFAULT false
);

CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    date DATE,
    home INTEGER NOT NULL,
    away INTEGER NOT NULL,
    home_score INTEGER,
    away_score INTEGER,
    CONSTRAINT fk_home FOREIGN KEY (home) REFERENCES teams (id),
    CONSTRAINT fk_away FOREIGN KEY (away) REFERENCES teams (id)
);