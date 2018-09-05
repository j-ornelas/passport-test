const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const db = require('./database/database.js');
// const auth = require('./routes/auth');
require('./passport');


const app = express();
const port = 3000;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(passport.initialize());
app.use(passport.session());
// app.use('/auth', auth);

app.get('/', (req, res) => res.send('try logging in!'));

app.get('/success', (req, res) => res.send('Success'));
app.get('/failure', (req, res) => res.send('Failure'));

app.post('/create', (req, res) => {
  console.log(req.body.password);
  const newUser = new db.User({
    username: req.body.username,
    password: req.body.password
  });
  newUser.save()
    .then((data) => {
      console.log('DATA', data);
    });
  res.json(req.body);
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/success',
  failureRedirect: '/failure',
  failureFlash: false,
  // TODO: use JWT here
  session: false
}));

app.post('/locallogin', (req, res) => {
  console.log('req.body', req.body);
  passport.authenticate('local', { session: false }, (authErr, user, info) => {
    console.log('user', user);
    console.log('info', info);
    if (authErr || !user) {
      return res.status(400).json({
        message: 'Something is not right',
        user
      });
    }
    req.login(user, { session: false }, (loginErr) => {
      console.log('made it here pt2');
      console.log('loginErr', loginErr);
      if (loginErr) {
        res.send(loginErr);
      }
      // generate a json web token with the contents of user object and return it in the response
      console.log('user2', user);
      console.log('req.body', req.body);
      const token = jwt.sign(user, 'your_jwt_secret');
      console.log('token', token);
      return res.json({ user });
    });
  })(req, res);
  console.log('eh?')
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
