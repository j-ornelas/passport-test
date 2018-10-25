const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const session = require('express-session');
const userRoutes = require('./routes/user');
// const authRoutes = require('./routes/auth');
// needed for passport redirecting
require('dotenv').config();
require('./database/database.js');
require('./passport');
const checkUpdates = require('./helpers/checkForUpdatedContent');
const { createOrLogin } = require('./database/controllers/user');

const { JWT_SECRET, DEEP_LINK_REDIRECT } = process.env;

const app = express();
const port = 3000;

app.use(session({ secret: JWT_SECRET, cookie: { maxAge: 60000 } }));

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// JTW-protected user routes to update user info
app.use('/user', passport.authenticate('jwt', { session: false }), userRoutes);

app.use(passport.initialize());
app.use(passport.session());

// Cron job to check WP for new newsletters and send push notifications.
checkUpdates();
// for debugging. TODO: remove
app.get('/', (req, res) => { res.send('logged in????!'); });
// needed for social login failure catch
app.get('/failure', (req, res) => res.json({ message: 'There was a failure' }));
// user creates an account
app.post('/create', (req, res) => { createOrLogin(req, res, jwt, JWT_SECRET); });
// passport Routes TODO: refac these to /routes
app.post('/local-login', (req, res) => {
  passport.authenticate('local', { session: false }, (authErr, user) => {
    if (authErr || !user) {
      console.log('authErr', authErr);
      return res.json({
        message: 'Username or password is incorrect',
        user
      });
    }
    req.login(user, { session: false }, (loginErr) => {
      if (loginErr) {
        res.send(loginErr);
      }
      const userObj = { _id: user._id };
      const token = jwt.sign({ userObj }, JWT_SECRET);
      const safeUserData = Object.assign(user, {});
      // send the userObj back without password.
      delete safeUserData._doc.password;
      res.json({ token, user: safeUserData._doc });
    });
  })(req, res);
});
// passport Routes TODO: refac these to /routes
// TODO: sign the token with the _id from the database like local-login
app.get('/google-login', (req, res) => {
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] })(req, res);
});
app.get('/twitter-login', passport.authenticate('twitter', { session: false }));
// passport social login callbacks (for redirecting back to the app)
app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { session: false, failureRedirect: '/failure' }),
  (req, res) => {
    const token = jwt.sign({ user: req.user }, JWT_SECRET);
    res.redirect(`${DEEP_LINK_REDIRECT}?token=${token}&user=${JSON.stringify(req.user)}`);
  });
app.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/failure' }),
  (req, res) => {
    const token = jwt.sign({ user: req.user }, JWT_SECRET);
    res.redirect(`${DEEP_LINK_REDIRECT}?token=${token}&user=${JSON.stringify(req.user)}`);
  });

app.listen(port, () => console.log(`SU node/mongo server listening on port ${port}!`));
