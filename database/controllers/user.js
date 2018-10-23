const User = require('../models/user');

// TODO: validate username, password fields and res.json an errorMessage appropriately.
const createOrLogin = (req, res, jwt, JWT_SECRET) => {
  User.findOne({ username: req.body.username })
    .then((inDB) => {
      if (inDB) {
        res.json({
          alreadyCreated: true,
          errorMessage: 'This email is already registered. Try logging in instead!',
          loggedIn: false
        });
      } else {
        const newUser = new User({
          username: req.body.username,
          password: req.body.password,
          newsSubscriber: req.body.newsletter
        });
        newUser.save()
          .then((data) => {
            const token = jwt.sign({ data }, JWT_SECRET);
            const safeUserData = Object.assign(data, {});
            delete safeUserData._doc.password;
            res.json({ token, user: safeUserData._doc });
          });
      }
    })
    .catch(err => console.log(err));
};

const testUser = 'string';

module.exports = { createOrLogin, testUser };
