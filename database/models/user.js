const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // TODO: handle unique conflicts
  username: { type: String },
  email: { type: String },
  password: { type: String, select: false },
  googleId: { type: String },
  twitterId: { type: String, unique: false },
  firstName: String,
  lastName: String,
  newsSubscriber: Boolean,
  favorites: Object,
});

userSchema.methods.validPassword = (password, context) => (
  context.password === password
);

module.exports = mongoose.model('User', userSchema);
