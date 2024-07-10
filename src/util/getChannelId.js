const { DateTime } = require('luxon');
const axios = require('axios');
require('dotenv').config();

async function getChannelId(username) {
  console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Fetching channel ID for ${username}...`);
    try {
      const response = await axios.get(process.env.TWITCH_USERS_URL, {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${process.env.TWITCH_SECRET_KEY}`
        },
        params: {
          login: username
        }
      });
  
      if (response.data.data.length > 0) {
        const user = response.data.data[0];
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Successfully fetched channel ID for ${username}`);
        return user.id;
      } else {
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: No user found with the username ${username}`);
        return null;
      }
    } catch (error) {
      console.error(`[${DateTime.utc().toFormat('HH:mm')}] error: Error fetching user data from Twitch API:`, error);
    }
  }
  
 module.exports = getChannelId;