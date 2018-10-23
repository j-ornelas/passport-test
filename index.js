const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const session = require('express-session');

const db = require('./database/database.js');
const userRoutes = require('./routes/user');
const User = require('./database/models/user');

console.log('USER', User);
// const auth = require('./routes/auth');
const secrets = require('./private');
const checkUpdates = require('./helpers/checkForUpdatedContent');

const { JWT_SECRET } = secrets;
require('./passport');


const app = express();
const port = 3000;

app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 } }));
// remove this later maaybe?

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use('/user', passport.authenticate('jwt', { session: false }), userRoutes);

app.use(passport.initialize());
app.use(passport.session());


app.get('/', (req, res) => {
  res.send('logged in?');
});

app.get('/success', (req, res) => res.json({ message: 'Success' }));
app.get('/failure', (req, res) => res.json({ message: 'There was a failure' }));

app.post('/create', (req, res) => {
  console.log('CREATE req.body', req.body);
  // TODO: validate username, password fields and res.json an errorMessage appropriately.
  // TODO: extract to a function so we don't have to modify it when we add props
  // to a user;
  User.findOne({ username: req.body.username })
    .then((inDB) => {
      if (inDB) {
        console.log('IN DATABASE ALREADY')
        res.json({
          errorMessage: 'This email is already registered. Try logging in instead!',
          loggedIn: false
        });
      } else {
        const newUser = new User({
          username: req.body.username,
          password: req.body.password,
          favorites: {},
          recentSearches: [],
          firstName: '',
          lastName: '',
          newsSubscriber: req.body.newsletter
        });
        newUser.save()
          .then((data) => {
            console.log('DATA', data);
            const token = jwt.sign({ data }, JWT_SECRET);
            const safeUserData = Object.assign(data, {});
            delete safeUserData._doc.password;
            res.json({ token, user: safeUserData._doc });
          });
      }
    });
});

app.post('/local-login', (req, res) => {
  console.log('login req.body', req.body);
  // TODO: validate username, password fields and res.json an errorMessage appropriately.
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

app.get('/google-login', (req, res) => {
  console.log('req.params google', req.params);
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] })(req, res);
});
app.get('/twitter-login', passport.authenticate('twitter', { session: false }));

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', {
    session: false,
    successRedirect: 'https://auth.expo.io/@johnornelas/secrets-unsealed',
    failureRedirect: '/failure'
  }));

app.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/failure' }),
  (req, res) => {
    // console.log('app.js req user', req.user);
    const token = jwt.sign({ user: req.user }, JWT_SECRET);
    res.redirect(`https://auth.expo.io/@johnornelas/secrets-unsealed?token=${token}&user=${JSON.stringify(req.user)}`);
    return;
  });

// Check WP for new newsletters and send push notifications.
checkUpdates();

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
