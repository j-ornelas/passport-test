const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const secrets = require('../private');

const { JWT_SECRET } = secrets;
const router = express.Router();

router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (authErr, user, info) => {
    if (authErr || !user) {
      return res.status(400).json({
        message: 'Something is not right',
        user
      });
    }
    req.login(user, { session: false }, (loginErr) => {
      if (loginErr) {
        res.send(loginErr);
      }
      // generate a json web token with the contents of user object and return it in the response
      const token = jwt.sign(user, JWT_SECRET);
      return res.json({ user, token });
    });
  })(req, res);
});
