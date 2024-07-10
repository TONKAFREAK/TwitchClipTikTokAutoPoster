const axios = require('axios');
require('dotenv').config();
const { DateTime } = require('luxon');

async function getChannelName(channelId) {
    try {
        const response = await axios.get(process.env.TWITCH_USERS_URL, {
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${process.env.TWITCH_SECRET_KEY}`
            },
            params: {
                id: channelId
            }
        });

        const userData = response.data.data[0];
        if (userData) {
            console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Channel Name: ${userData.display_name}`);
            return userData.display_name;
        } else {
            console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Channel not found`);
        }
    } catch (error) {
        console.error(`[${DateTime.utc().toFormat('HH:mm')}] error: Error fetching channel name:`, error);
    }
}

module.exports = getChannelName;
