require('dotenv').config();
const axios = require('axios');
const { DateTime } = require('luxon');
const getChannelId = require('./getChannelId');
async function isFollowersChatOnly(channelName) {

  try {

    const response = await axios.get(`https://api.twitch.tv/helix/chat/settings?broadcaster_id=${getChannelId(channelName)}`, {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${process.env.TWITCH_SECRET_KEY}`
      },
    });

    const isFolloversChatOnly = response.data.data[0].follower_mode;
    const followersOnlyChatDuration = response.data.data[0].follower_mode_duration;

        if (isFolloversChatOnly) {
            console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Followers-only chat is enabled with a duration of ${followersOnlyChatDuration} seconds`);
            return true;
        } else {
            console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Followers-only chat is not enabled`);
            return false;
        }
    
  } catch (error) {
    console.error(`[${DateTime.utc().toFormat('HH:mm')}] error: Error fetching channel information:`, error.response ? error.response.data : error.message);
  }
}

module.exports = isFollowersChatOnly;
