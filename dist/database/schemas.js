const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // handle unique conflicts
  username: { type: String },
  email: { type: String },
  password: String,
  googleId: { type: String },
  twitterId: { type: String, unique: false },
  firstName: String,
  lastName: String,
  newsSubscriber: Boolean
});

userSchema.methods.validPassword = (password, context) => context.password === password;

userSchema.statics.findOrCreate = whatever => {
  console.log('whatever', whatever);
  return true;
};

module.exports.userSchema = userSchema;