import express from 'express';
import { getGames, getStandings} from '../lib/db.js';

export const indexRouter = express.Router();

async function indexRoute(req, res) {
  return res.render('index', {
    title: 'Forsíða',
    time: new Date().toISOString(),
  });
}

async function leikirRoute(req, res) {
  const games = await getGames();
  // console.log('leikirRoute', games)
  return res.render('leikir', {
    title: 'Leikir',
    time: new Date().toISOString(),
    games
  });
}

async function stadaRoute(req, res) {
  const standings = await getStandings();
  return res.render('stada', {
    title: 'Staðan',
    time: new Date().toISOString(),
    standings
  });
}

indexRouter.get('/', indexRoute);
indexRouter.get('/leikir', leikirRoute);
indexRouter.get('/stada', stadaRoute);
