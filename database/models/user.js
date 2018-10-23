const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // TODO: handle unique conflicts
  username: { type: String },
  email: { type: String },
  password: String,
  googleId: { type: String },
  twitterId: { type: String, unique: false },
  firstName: String,
  lastName: String,
  newsSubscriber: Boolean,
});

userSchema.methods.validPassword = (password, context) => (
  context.password === password
);

const User = mongoose.model('User', userSchema);
module.exports.User = User;
