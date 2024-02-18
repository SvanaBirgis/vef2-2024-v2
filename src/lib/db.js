import pg from 'pg';
import { readFile } from 'fs/promises';
import { environment } from './environment.js';
import { logger } from './logger.js';

const SCHEMA = './sql/schema.sql';
const DROP = './sql/drop.sql';
const DUMMY_DATA = './sql/dummyData.sql';

const env = environment(process.env, logger);

if (!env?.connectionString) {
  process.exit(-1);
}

const { connectionString } = env;

const pool = new pg.Pool({ connectionString });

pool.on('error', (err) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
  process.exit(-1);
});

export async function query(q, values = []) {
  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    console.error('unable to get client from pool', e);
    return null;
  }

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    console.error('unable to query', e);
    console.info(q, values);
    return null;
  } finally {
    client.release();
  }
}

export async function getGames() {
  const q = `
    SELECT
      date,
      home_team.name AS home_name,
      home_score,
      away_team.name AS away_name,
      away_score
    FROM
      games
    LEFT JOIN
      teams AS home_team ON home_team.id = games.home
    LEFT JOIN
      teams AS away_team ON away_team.id = games.away
  `;
  

  const result = await query(q);

  const games = [];
  if (result && (result.rows?.length ?? 0) > 0) {
    for (const row of result.rows) {
      const game = {
        date: row.date,
        home: {
          name: row.home_name,
          score: row.home_score,
        },
        away: {
          name: row.away_name,
          score: row.away_score,
        },
      };
      games.push(game);
    }

    return games;
  }

  return [];
}

export function insertGame(homeName, homeScore, awayName, awayScore) {
  const q =
    'insert into games (home, away, home_score, away_score) values ($1, $2, $3, $4);';

  const result = query(q, [homeName, homeScore, awayName, awayScore]);
  console.log(result);
}

async function queryFromFile(file) {
  const data = await readFile(file);

  return query(data.toString('utf-8'));
}

export async function createSchema(schema = SCHEMA) {
  return queryFromFile(schema);
}

export async function dropSchema(drop = DROP) {
  return queryFromFile(drop);
}

export async function insertDummyData(dummyData = DUMMY_DATA) {
  return queryFromFile(dummyData);
}

export async function end() {
  await pool.end();
}