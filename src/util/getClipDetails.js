require('dotenv').config();

const axios = require('axios');
const { DateTime } = require('luxon');

async function getClipDetails(clipId) {

    console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Fetching clip details: ${clipId}`);

    try {

        const clipDetailsResponse = await axios.get(`https://api.twitch.tv/helix/clips?id=${clipId}`, {
            headers: {
            'Authorization': `Bearer ${process.env.TWITCH_SECRET_KEY}`,
            'Client-Id': process.env.TWITCH_CLIENT_ID
            }
        })

        if (clipDetailsResponse.status !== 200) {
            console.error(`[${DateTime.utc().toFormat('HH:mm')}] error: Error fetching clip details: ${clipId}`);
            return;
        }

        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Successfully fetched clip details`);
        return clipDetailsResponse.data.data[0];

    } catch (error) {

        console.error(`[${DateTime.utc().toFormat('HH:mm')}] error: Error fetching clip details: ${clipId}`, error.message);
    }


}

module.exports = getClipDetails;