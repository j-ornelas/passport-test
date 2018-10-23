const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const session = require('express-session');
const userRoutes = require('./routes/user');
// const authRoutes = require('./routes/auth');
// needed for passport redirecting
require('./database/database.js');
require('./passport');
const secrets = require('./private');
const checkUpdates = require('./helpers/checkForUpdatedContent');
const { createOrLogin } = require('./database/controllers/user');

const { JWT_SECRET } = secrets;

const app = express();
const port = 3000;

app.use(session({ secret: JWT_SECRET, cookie: { maxAge: 60000 } }));

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use('/user', passport.authenticate('jwt', { session: false }), userRoutes);

app.use(passport.initialize());
app.use(passport.session());

// Cron job to check WP for new newsletters and send push notifications.
checkUpdates();
// for debugging. TODO: remove
app.get('/', (req, res) => { res.send('logged in?'); });
// needed for social login failure catch
app.get('/failure', (req, res) => res.json({ message: 'There was a failure' }));
// user creates an account
app.post('/create', (req, res) => { createOrLogin(req, res, jwt, JWT_SECRET); });
// passport Routes TODO: refac these to /routes
app.post('/local-login', (req, res) => {
  console.log('login req.body', req.body);
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
      const token = jwt.sign({ user }, JWT_SECRET);
      const safeUserData = Object.assign(user, {});
      delete safeUserData._doc.password;
      res.json({ token, user: safeUserData._doc });
    });
  })(req, res);
});
// passport Routes TODO: refac these to /routes
app.get('/google-login', (req, res) => {
  console.log('req.params google', req.params);
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] })(req, res);
});
app.get('/twitter-login', passport.authenticate('twitter', { session: false }));
// passport social login callbacks (for redirecting back to the app)
app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { session: false, failureRedirect: '/failure' }),
  (req, res) => {
    const token = jwt.sign({ user: req.user }, JWT_SECRET);
    res.redirect(`https://auth.expo.io/@johnornelas/secrets-unsealed?token=${token}&user=${JSON.stringify(req.user)}`);
  });
app.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/failure' }),
  (req, res) => {
    const token = jwt.sign({ user: req.user }, JWT_SECRET);
    res.redirect(`https://auth.expo.io/@johnornelas/secrets-unsealed?token=${token}&user=${JSON.stringify(req.user)}`);
  });
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
