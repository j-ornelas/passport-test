const mongoose = require('mongoose');


mongoose.connect('mongodb://mongo:27017/test');
const db = mongoose.connection;

const init = () => {
  console.log('MONGOOSE IS CONNECTED');
};


db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', init);

module.exports.db = db;
