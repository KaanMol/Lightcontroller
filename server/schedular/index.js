const CronJob = require('cron').CronJob;

const dht22 = new CronJob('*/1 * * * *', require("./dht22"), null, true, 'Europe/Amsterdam');

module.exports = {
    dht22
}
