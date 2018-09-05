const passport = require('passport');
const passportJWT = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;

const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;
const db = require('./database/database');

passport.use(new LocalStrategy(
  (username, password, done) => (
    db.User.findOne({ username, password })
      .then((user) => {
        if (!user) {
          console.log('password or username is incorrect');
          return done(null, false, { message: 'Incorrect email or password.' });
        }
        return done(null, user, {
          message: 'Logged In Successfully'
        });
      })
      .catch(err => (
        done(err)
      ))
  )
));

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'your_jwt_secret'
},
(jwtPayload, done) => {
  console.log(jwtPayload, 'jwtPayload');
  return (
    db.User.findOneById(jwtPayload.id)
      .then(user => (
        done(null, user)
      ))
      .catch(err => (
        done(err)
      ))
  );
}));
