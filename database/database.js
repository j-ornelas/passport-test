const mongoose = require('mongoose');
const schemas = require('./schemas');

mongoose.connect('mongodb://localhost/test');
const db = mongoose.connection;

const init = () => {
  console.log('MONGOOSE IS CONNECTED');
};

const User = db.model('User', schemas.userSchema);

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', init);

module.exports.User = User;
module.exports.db = db;
