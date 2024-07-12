const axios = require('axios');
const { DateTime } = require('luxon');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const sleep = require('./sleep');
const getClipDetails = require('./getClipDetails');

async function downloadClips(clipId) {
    try {

        await sleep(20000);
        
        const directory = 'resources/clips';
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }

        const clipDetails = await getClipDetails(clipId);

        const clipUrl = clipDetails.thumbnail_url.replace('-preview-480x272.jpg', '.mp4');

        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Downloading clip: ${clipId}`);

        const response = await axios({
            url: clipUrl,
            method: 'GET',
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(path.join(directory, `${clipId}.mp4`));

        return new Promise((resolve, reject) => {
            response.data.pipe(writer);
            writer.on('finish', () => {
                console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Successfully downloaded clip: ${clipId}`);
                resolve(true);
            });
            writer.on('error', (error) => {
                console.error(`[${DateTime.utc().toFormat('HH:mm')}] error: Error writing clip: ${clipId}`, error);
                reject(error);
            });
        });

    } catch (error) {
        console.error(`[${DateTime.utc().toFormat('HH:mm')}] error: Error downloading clip: ${clipId}`, error);
        return false; 
    }
}

module.exports = downloadClips;
