const express = require('express');
const User = require('../database/models/user');
const { getUserInfo } = require('../database/controllers/user');

const router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('this is the user.js "/" route');
});

/* GET user profile. */
router.get('/profile', (req, res, next) => {
  res.send(req.user);
});

router.post('/update-name', async (req, res, next) => {
  const { _id } = req.user;
  const oldData = await getUserInfo(_id);
  const firstName = req.query.firstName || oldData.firstName || '';
  const lastName = req.query.lastName || oldData.lastName || '';
  User.updateOne({ _id }, { firstName, lastName })
    .then((dbResponse) => {
    // tell the front end if save was successful.
      if (dbResponse.nModified === 0) {
        res.json({ saved: false });
      } else {
        res.json({ saved: true });
      }
    })
    .catch(err => res.json({ saved: false, err }));
});

router.post('/add-favorite', (req, res, next) => {
  const { _id } = req.user;
  User.updateOne({ _id }, { $set: { favorites: req.body } }, )
    .then((dbResponse) => {
      console.log('dbResponse', dbResponse);
      // User.updateOne({ _id }, { favorites })
      //   .then((dbResponse) => {
      //   // tell the front end if save was successful.
      //     if (dbResponse.nModified === 0) {
      //       res.json({ saved: false });
      //     } else {
      //       res.json({ saved: true });
      //     }
      //   })
      //   .catch(err => res.json({ saved: false, err }));
    });
});

module.exports = router;
