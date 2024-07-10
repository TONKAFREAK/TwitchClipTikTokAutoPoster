const axios = require('axios');
const { DateTime } = require('luxon');
require('dotenv').config();

async function rank(user){

    const headers = {
        'accept': 'application/json',
	    'Authorization': process.env.VAL_API_KEY
    };

    try {

        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Requesting rank for ${process.env.VAL_USERNAME}#${process.env.VAL_TAGLINE}`);
        //console.log('sending request to API');
        const response = await axios.get(`https://api.henrikdev.xyz/valorant/v2/mmr/${process.env.VAL_REGION}/${process.env.VAL_USERNAME}/${process.env.VAL_TAGLINE}`, { headers });
        //console.log('sent request to API');
        if (response.status == 200) {

            const rank = response.data.data.current_data.currenttierpatched;
            const rr = response.data.data.current_data.ranking_in_tier;
            const highest_rank = response.data.data.highest_rank.patched_tier;

            return ` @${user} Current Rank: (${rank} RR: ${rr}) | Highest Rank: ${highest_rank}`;
        }

    } catch (error) {
        
        console.error(`[${DateTime.utc().toFormat('HH:mm')}] error: error getting the response from API: `+ error.message);
        return `@${user} woof`;
    }

}

module.exports = rank;