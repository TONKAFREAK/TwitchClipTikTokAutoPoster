const { DateTime } = require('luxon');

async function sleep(ms) {
    console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Waiting ${ms/1000} seconds....`);
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = sleep;