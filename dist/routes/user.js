const express = require('express');

const router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('this is the user.js "/" route');
});

/* GET user profile. */
router.get('/profile', (req, res, next) => {
  res.send(req.user);
});

module.exports = router;