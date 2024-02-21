import express from 'express';
import passport from 'passport';
import { getGames, getTeams, insertGame } from '../lib/db.js';


export const adminRouter = express.Router();

// TODO færa á betri stað
// Hjálpar middleware sem athugar hvort notandi sé innskráður og hleypir okkur
// þá áfram, annars sendir á /login
function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect('/login');
}

async function indexRoute(req, res) {
  return res.render('login', {
    title: 'Innskráning',
  });
}

async function adminRoute(req, res) {
  const user = req.user ?? null;
  const loggedIn = req.isAuthenticated();
  const teams = await getTeams();
  const games = await getGames();

  return res.render('admin', {
    title: 'Admin upplýsingar, mjög leynilegt',
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

// Function to check if a given date is in the future
function isFutureDate(dateString) {
  const currentDate = new Date();
  const inputDate = new Date(dateString);
  return inputDate.getTime() > currentDate.getTime();
}

// Function to check if a given date is more than 2 months old
function isMoreThanTwoMonthsOld(dateString) {
  const currentDate = new Date();
  const inputDate = new Date(dateString);
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(currentDate.getMonth() - 2);
  return inputDate.getTime() < twoMonthsAgo.getTime();
}


async function addGameRoute(req, res) {
  console.log(req.body);
  const { date, homeTeam, homePoints, awayTeam, awayPoints } = req.body;
  // format á date???
  const formattedDate = new Date(date);

  // TODO Ekki sama lið sem home og away
  if (homeTeam === awayTeam) {
    const user = req.user ?? null;
    const loggedIn = req.isAuthenticated();
    const teams = await getTeams();
    // const games = await getGames();
    const error = 'Heimalið og Gestalið getur ekki verið það sama';

    return res.render('admin', {
      title: 'Admin upplýsingar, mjög leynilegt',
      user,
      loggedIn,
      teams,
      // games,
      error
    });
  }

  // TODO VALIDATE date, ekki framtíð og ekki eldri en 2 mán
  if (!isValidDate(date) || isFutureDate(date) || 
  isMoreThanTwoMonthsOld(date)) {
    const user = req.user ?? null;
    const loggedIn = req.isAuthenticated();
    const teams = await getTeams();
    const insert = await insertGame();
    const error = 'Invalid date';

    return res.render('admin', {
      title: 'Admin upplýsingar, mjög leynilegt',
      user,
      loggedIn,
      teams,
      insert,
      error
    });
  }
  try {
    await insertGame({ date: formattedDate, homeTeam, homePoints, awayTeam, awayPoints });
    return res.redirect('/admin');
  } catch (error) {
    console.error('Error inserting game into the database:', error);
    return res.status(500).send('Internal Server Error');
  }
}

adminRouter.get('/login', indexRoute);
adminRouter.get('/admin', ensureLoggedIn, adminRoute);
adminRouter.post(
  '/login',

  // Þetta notar strat að ofan til að skrá notanda inn
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/login',
  }),

  // Ef við komumst hingað var notandi skráður inn, senda á /admin
  (req, res) => {
    res.redirect('/admin');
  },
);
adminRouter.post('/admin/add-game', ensureLoggedIn, addGameRoute);


// 1. form... setja form í admin.ejs. finna út hvernig það virkar út frá fyrirlestrarglósum. það er html element 
// sem þú getur notað til að senda POST request á admin-router.js endapunkt
// 
// 2. í endapunktnum sem formið kallar á... validera gögn og kasta res.status(errorcode, message( held ég?)) ef 
// eitthvað failar t.d. dagsetning röng
// validera líka hvort lið sé til
// ef getTeamByName er ekki null þá til og halda áfram annars villa...
// 
// 3. ef allt validation stenst... insertGame svipað og þú gerðir í setup nema ert bara að inserta einn leik
