import express from 'express';
import passport from 'passport';
import { updateGame, getGames, getTeams, insertGame, getGameById } from '../lib/db.js';


export const adminRouter = express.Router();

// TODO færa á betri stað
// Hjálpar middleware sem athugar hvort notandi sé innskráður og hleypir okkur
// þá áfram, annars sendir á /login
function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated() ) {
    return next();
  }
  return res.redirect('/login');
}

async function indexRoute(req, res) {
  return res.render('login', {
    title: 'Innskráning',
    time: new Date().toISOString(),
  });
}

function isAdmin(req, res, next) {
  if (req.user.admin) {
      return next();
  }
  return res.redirect('/');
}

async function adminRoute(req, res) {
  const user = req.user ?? null;
  const loggedIn = req.isAuthenticated();
  const teams = await getTeams();
  const games = await getGames();
  // console.log(games)

  
  return res.render('admin', {
    title: 'Admin upplýsingar, mjög leynilegt',
    time: new Date().toISOString(),
    user,
    loggedIn,
    teams,
    games,
    error: req.query.error, 
    admin: true
  });
}

function isValidDate(dateString) {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  return dateString.match(regEx) !== null;
}

// Function til að tékka hvort date sé ekki í framtíðinni
function isFutureDate(dateString) {
  const currentDate = new Date();
  const inputDate = new Date(dateString);
  return inputDate.getTime() > currentDate.getTime();
}

// Function til að tékka hvort date sé ekki eldri en 2 mán
function isMoreThanTwoMonthsOld(dateString) {
  const currentDate = new Date();
  const inputDate = new Date(dateString);
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(currentDate.getMonth() - 2);
  return inputDate.getTime() < twoMonthsAgo.getTime();
}


async function addGameRoute(req, res) {
  // console.log(req.body);
  const { date, homeTeam, homePoints, awayTeam, awayPoints } = req.body;
  // format á date???
  const formattedDate = new Date(date);

  // TODO Ekki sama lið sem home og away
  if (homeTeam === awayTeam) {
    const user = req.user ?? null;
    const loggedIn = req.isAuthenticated();
    const teams = await getTeams();
    const games = await getGames();
    const error = 'Heimalið og Gestalið getur ekki verið það sama';

    return res.render('admin', {
      title: 'Admin upplýsingar, mjög leynilegt',
      time: new Date().toISOString(),
      user,
      loggedIn,
      teams,
      games,
      error
    });
  }

  // TODO VALIDATE date, ekki framtíð og ekki eldri en 2 mán
  if (!isValidDate(date) || isFutureDate(date) || 
  isMoreThanTwoMonthsOld(date)) {
    const user = req.user ?? null;
    const loggedIn = req.isAuthenticated();
    const teams = await getTeams();
    const games = await getGames();
    const error = 'Invalid date';

    return res.render('admin', {
      title: 'Admin upplýsingar, mjög leynilegt',
      time: new Date().toISOString(),
      user,
      loggedIn,
      teams,
      games,
      error
    });
  }
  try {
    await insertGame(formattedDate, homeTeam, homePoints, awayTeam, awayPoints);
    return res.redirect('/admin');
  } catch (error) {
    console.error('Error inserting game into the database:', error);
    return res.status(500).send('Internal Server Error');
  }
}

async function updateRoute(req, res) {
  const { date, homeId, homeScore, awayId, awayScore } = req.body;
  const { gameId } = req.params;
  // console.log('allt', date, homeId, homeScore, awayId, awayScore)
  // console.log('gameId', gameId)
  // console.log(req.body)

    // console.log(req.body)
    // format á date???
  
    // TODO Ekki sama lið sem home og away
    if (homeId === awayId) {
      const user = req.user ?? null;
      const loggedIn = req.isAuthenticated();
      const teams = await getTeams();
      const games = await getGames();
      const error = 'Heimalið og Gestalið getur ekki verið það sama';
  
      return res.render('admin', {
        title: 'Admin upplýsingar, mjög leynilegt',
        time: new Date().toISOString(),
        user,
        loggedIn,
        teams,
        games,
        error
      });
    }

    // TODO VALIDATE date, ekki framtíð og ekki eldri en 2 mán
  if (!isValidDate(date) || isFutureDate(date) || 
  isMoreThanTwoMonthsOld(date)) {
    const user = req.user ?? null;
    const loggedIn = req.isAuthenticated();
    const teams = await getTeams();
    const games = await getGames();
    const error = 'Invalid date';

    return res.render('admin', {
      title: 'Admin upplýsingar, mjög leynilegt',
      time: new Date().toISOString(),
      user,
      loggedIn,
      teams,
      games,
      error
    });
  }

  try {
    const updatedGame = await updateGame(gameId, 
      { date, homeId, homeScore, awayId, awayScore});

    if (updatedGame) {
      return res.redirect('/admin');
    } 
      return res.render('error');
    
  } catch (error) {
    console.error('Error updating game:', error);
    return res.status(500).send('Internal Server Error');
  }
}

adminRouter.get('/login', indexRoute);
adminRouter.get('/admin', ensureLoggedIn, isAdmin, adminRoute);
adminRouter.get('/logout', async (req, res, next) => {
  // logout hendir session cookie og session
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    return res.redirect('/');
  });
});

adminRouter.get('/admin-update/:gameId', ensureLoggedIn, isAdmin, async(req, res) => {
  const { gameId } = req.params;
  const teams = await getTeams();
  const game = await getGameById(gameId);
  const loggedIn = req.isAuthenticated();
  const user = req.user ?? null;

  // console.log('game',game)
  // console.log('Jónas', gameId);
  return res.render('admin-update', {
    title: 'Update Game',
    time: new Date().toISOString(),
    user,
    loggedIn,
    gameId,
    teams,
    game
  });
});

adminRouter.post(
  '/login',

  // Þetta notar strat að ofan til að skrá notanda inn
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/login',
  }),

  // Ef við komumst hingað var notandi skráður inn, senda á /admin
  (req, res) => {
    // console.log(req.body);

    res.redirect('/admin');
  },
);

adminRouter.post('/admin/add-game', ensureLoggedIn, addGameRoute);
adminRouter.post('/admin-update/:gameId', ensureLoggedIn, isAdmin, updateRoute);

