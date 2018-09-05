const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  favorites: Array,
});
userSchema.methods.validPassword = (password, context) => (
  context.password === password
);

module.exports.userSchema = userSchema;
