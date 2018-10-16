const mongoose = require('mongoose');
const schemas = require('./schemas');

const options = {
    reconnectTries: 30, // Retry up to 30 times
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0
  }

mongoose.connect('mongodb://mongo:27017/test', options);
const db = mongoose.connection;

// const connectWithRetry = () => {
//   console.log('MongoDB connection with retry')
//   mongoose.connect("mongodb://mongo:27017/test", options).then(()=>{
//     console.log('MongoDB is connected')
//   }).catch(err=>{
//     console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
//     setTimeout(connectWithRetry, 5000)
//   })
// }
//
// connectWithRetry();
// const db = mongoose.connection;

const init = () => {
  console.log('MONGOOSE IS CONNECTED');
};

const User = db.model('User', schemas.userSchema);

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', init);

module.exports.User = User;
module.exports.db = db;
