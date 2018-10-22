const cron = require('node-cron');
const fetch = require('node-fetch');
const pushNotificationHelpers = require('../helpers/pushNotifications');
const secrets = require('../private');

const { WP_NEWS_API } = secrets;
const { sendNotifications } = pushNotificationHelpers;

let oldAmount = 0;
const checkUpates = () => {
  cron.schedule('0,30 * * * * *', () => {
    // once every 60 seconds....
    console.log('checking WordPress for new newsletters...');
    fetch(WP_NEWS_API)
      .then(res => res.json())
      .then((data) => {
        const currentAmount = data.length;
        console.log('current amount: ', currentAmount, 'old amount: ', oldAmount);
        if (currentAmount === oldAmount + 1) {
          console.log(`new newsletter found! old amount increased from ${oldAmount} to ${currentAmount}`);
          oldAmount = currentAmount;
          sendNotifications();
        } else if (currentAmount === oldAmount) {
          console.log('no new newsletters found...');
        } else {
          console.log('more than 1 new newsletter found....chances are the server was reset. NOT sending push notification...');
          console.log(`old amount increased from ${oldAmount} to ${currentAmount}`);
          oldAmount = currentAmount;
        }
      })
      .catch(err => console.log('err', err));
  });
};

module.exports.checkUpdates = checkUpates;
