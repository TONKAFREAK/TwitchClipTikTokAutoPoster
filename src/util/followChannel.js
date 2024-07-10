




//---------------- DOES NOT WORK!! ------------------

require('dotenv').config();
const axios = require('axios');

const getChannelId = require('./getChannelId');
const { DateTime } = require('luxon');

async function followChannel(targetChannel) {

  const username = process.env.BOT_USERNAME;

  try {
  
    await axios.post(`https://api.twitch.tv/helix/users/follows`, null, {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${process.env.TWITCH_SECRET_KEY}`
      },
      params: {
        from_id: getChannelId(username),
        to_id: getChannelId(targetChannel)
      }
    });

    console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Successfully followed ${targetChannel}`);
  } catch (error) {
    console.error(`[${DateTime.utc().toFormat('HH:mm')}] error: Error following channel:`, error);
  }
}

module.exports = followChannel;
