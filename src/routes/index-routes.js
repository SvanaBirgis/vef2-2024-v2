import express from 'express';
import { getGames, getStandings} from '../lib/db.js';

export const indexRouter = express.Router();

async function indexRoute(req, res) {
  const loggedIn = req.isAuthenticated();
  const user = req.user ?? null;
  let admin = false;
  if (user?.admin){
    admin = user.admin
  }
  return res.render('index', {
    title: 'Forsíða',
    time: new Date().toISOString(),
    user,
    loggedIn,
    admin,
  });
}

async function leikirRoute(req, res) {
  const games = await getGames();
  const loggedIn = req.isAuthenticated();
  const user = req.user ?? null;
  let admin = false;
  if (user?.admin){
    admin = user.admin
  }
  // console.log('leikirRoute', req.user)
  return res.render('leikir', {
    title: 'Leikir',
    time: new Date().toISOString(),
    games,
    user,
    loggedIn,
    admin,
  });
}

async function stadaRoute(req, res) {
  const standings = await getStandings();
  const loggedIn = req.isAuthenticated();
  const user = req.user ?? null;
  let admin = false;
  if (user?.admin){
    admin = user.admin
  }

  return res.render('stada', {
    title: 'Staðan',
    time: new Date().toISOString(),
    standings,
    user,
    loggedIn,
    admin,
  });
}

indexRouter.get('/', indexRoute);
indexRouter.get('/leikir', leikirRoute);
indexRouter.get('/stada', stadaRoute);
