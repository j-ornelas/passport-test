const mongoose = require('mongoose');
// const userSchema = require('./models/user');

mongoose.connect('mongodb://localhost/test');
const db = mongoose.connection;

const init = () => {
  console.log('MONGOOSE IS CONNECTED');
};

// const User = mongoose.model('User', userSchema.userSchema);

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', init);

// module.exports.User = User;
module.exports.db = db;
