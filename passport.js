const passport = require('passport');
const passportJWT = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
// const TwitterStrategy = require('passport-twitter-oauth2').Oauth2Strategy;
// const FacebookStrategy = require('passport-facebook').Strategy;
// const GoogleStrategy = require('passport-google-oauth-jwt').GoogleOauthJWTStrategy;
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const secrets = require('./private.js');
const User = require('./database/models/user');

const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;
const { JWT_SECRET } = secrets;
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = secrets.google;
const { TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, TWITTER_CALLBACK_URL } = secrets.twitter;

passport.use(new LocalStrategy(
  (username, password, done) => (
    User.findOne({ username, password })
      .then((user) => {
        console.log('USER IN PSSJS ', user);
        if (!user) {
          console.log('MADE IT HERE');
          return done(null, false);
        }
        return done(null, user, {
          message: 'Logged In Successfully',
          user
        });
      })
      .catch((err) => {
        console.log('error in passport.js', err);
        return done(err);
      })
  )
));

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromUrlQueryParameter('token'),
  secretOrKey: JWT_SECRET
},
(jwtPayload, done) => {
  ('jwtPayload', jwtPayload);
  const id = mongoose.Types.ObjectId(jwtPayload._id);
  console.log('id in passport.js', id);
  return (
    User.findOne({ _id: jwtPayload.user._id })
      .then((user) => {
        console.log('USER PASSPORT.JS', user);
        return (
          done(null, {
            favorites: user.favorites,
            name: user.username,
            newsSubscriber: user.newsSubscriber
          })
        );
      })
      .catch(err => (
        done(err)
      ))
  );
}));

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: GOOGLE_CALLBACK_URL
},
(req, accessToken, refreshToken, profile, done) => {
  User.findOne({ googleId: profile.id }, (err, user) => {
    // we check our DB to see if a user is there. If not, we create them.
    // TODO: WHY DOES THIS FAIL THE GOOG STRAT IF IT'S A NULL USER?!?!
    console.log('USER PASSPORT.JS', user);
    if (!user) {
      const newUser = new User({
        googleId: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        favorites: {},
      });
      // newUser.save((newUserErr, newUserInfo) => {
      //   if (newUserErr) return console.log('newusererr', newUserErr);
      //   console.log('newUser passport.js', newUserInfo);
      //   return done(newUserErr, user);

      newUser.save()
        .then((data) => {
          console.log('DATA PASSPORTJS', data);
          const token = jwt.sign({ data }, JWT_SECRET);
          console.log('TOKEN PASSPORT>JS', token);
          const safeUserData = { ...data, token };
          delete safeUserData._doc.password;
          // res.json({ token, user: safeUserData._doc });
          return done(err, data);
        });
      // });
    } else {
      return done(err, user);
    }
  });
}));

passport.use(new TwitterStrategy({
  consumerKey: TWITTER_CONSUMER_KEY,
  consumerSecret: TWITTER_CONSUMER_SECRET,
  callbackURL: TWITTER_CALLBACK_URL,
},
(twitterToken, tokenSecret, profile, done) => {
  console.log('TWITTER PROFILE iD', profile.id);
  console.log('TWITTER TOKEN', twitterToken);
  User.findOne({ twitterId: profile.id }, (err, user) => {
    // we check our DB to see if a user is there. If not, we create them.
    // TODO: WHY DOES THIS FAIL THE GOOG STRAT IF IT'S A NULL USER?!?!
    console.log('USER PASSPORT.JS', user);
    if (!user) {
      const newUser = new User({
        twitterId: profile.id,
        firstName: '',
        lastName: '',
        favorites: {},
      });
      // newUser.save((newUserErr, newUserInfo) => {
      //   if (newUserErr) return console.log('newusererr', newUserErr);
      //   console.log('newUser passport.js', newUserInfo);
      //   return done(newUserErr, user);

      newUser.save()
        .then((data) => {
          console.log('DATA PASSPORTJS', data);
          const token = jwt.sign({ data }, JWT_SECRET);
          console.log('TOKEN PASSPORT>JS', token);
          const safeUserData = { ...data };
          delete safeUserData._doc.password;
          // res.json({ token, user: safeUserData._doc });
          return done(err, data);
        });
      // });
    } else {
      return done(err, user);
    }
  });
  // User.findOrCreate(..., function(err, user) {
  //   if (err) { return done(err); }
  //   done(null, user);
  // });
}));
