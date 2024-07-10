const axios = require('axios');
const { DateTime } = require('luxon');
require('dotenv').config();

const getChannelName = require('../util/getChannelName');
const getChannelId = require('../util/getChannelId');
const downloadClips = require('../util/downloadClip');
const editClip = require('../util/editClip');
const sleep = require('../util/sleep');
const uploadVideoSelenium = require('../util/uploadVideoSelenium');
const uploadVideoPuppeteer = require('../util/uploadVideoPuppeteer');

async function createPost(clipLengthSeconds) {
    
    const clipUrl = process.env.TWITCH_CLIP_URL;
    var channelId = process.env.CHANNEL;
    var channelName;

    if (Number.isInteger(channelId) === true){

        channelName = await getChannelName(channelId);

    }

    if (typeof channelId === 'string') {

        channelName = channelId.toLowerCase();
        channelId = await getChannelId(channelName);
    }

    console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Creating clip...`);

    const endTime = DateTime.utc();
    const startTime = endTime.minus({ seconds: clipLengthSeconds });

    const endTimeStr = endTime.toISO();
    const startTimeStr = startTime.toISO();

    const headers = {
        "Client-ID": `${process.env.TWITCH_CLIENT_ID}`,
        "Authorization": `Bearer ${process.env.TWITCH_SECRET_KEY}`,
        "Content-Type": "application/json"
    };

    const params = {
        "broadcaster_id": channelId,
        "has_delay": false,  
        "started_at": startTimeStr,
        "ended_at": endTimeStr
    };

    try {
        const response = await axios.post(clipUrl, null, { headers, params });
        if (response.status === 202) {
            const clipData = response.data;
            const clipId = clipData.data[0].id;
            console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Successfully created clip! Clip ID: ${clipId}`);
            await downloadClips(clipId);
            await sleep(2000);
            const videoEditingFinished = await editClip(clipId, channelName);

            if (videoEditingFinished) {

                const videoTitle = `${channelName} on twitch`;
                const videoTags = ['#valorant','#val','#fyp',`#${channelName}`];
                const pathToVideo = `resources/clips/${clipId}_edited.mp4`;

                await uploadVideoSelenium(process.env.TIKTOK_USERNAME,process.env.TIKTOK_PASSWORD, videoTitle, videoTags, pathToVideo );

                //await uploadVideoPuppeteer(process.env.TIKTOK_USERNAME,process.env.TIKTOK_PASSWORD, videoTitle, videoTags, pathToVideo );

            }

            return `tiktok`;
        } else {
            console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Failed to post clip. Status code: ${response.status}`);
        }
    } catch (error) {
        console.error(`[${DateTime.utc().toFormat('HH:mm')}] error: Error posting clip: ${error}`);
    }
}

module.exports = createPost ;
