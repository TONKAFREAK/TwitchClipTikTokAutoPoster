const ffmpeg = require('fluent-ffmpeg');
const { DateTime } = require('luxon');
const fs = require('fs');

async function editClip(clipId, channelName) {
    const inputPath = `resources/clips/${clipId}.mp4`;
    const outputPath = `resources/clips/${clipId}_edited.mp4`;

    if (!fs.existsSync(inputPath)) {
        console.error(`[${DateTime.utc().toFormat('HH:mm')}] info: Input file ${clipId}.mp4 does not exist`);
        return;
    }

    console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Processing video ${clipId}.mp4......`);

    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .inputOptions('-loglevel debug')
            .videoFilters([
                {
                    filter: 'crop',
                    options: {
                        out_w: 'iw*0.8',
                        out_h: 'ih*1',
                        x: '(iw - out_w)/2',
                        y: '(ih - out_h)/2'
                    }
                },
                {
                    filter: 'scale',
                    options: {
                        w: 1080,
                        h: 1920,
                        force_original_aspect_ratio: 'decrease'
                    }
                },
                {
                    filter: 'pad',
                    options: {
                        w: 1080,
                        h: 1920,
                        x: '(ow - iw) / 2',
                        y: '(oh - ih) / 2',
                        color: 'black'
                    }
                }
            ])
            .output(outputPath)
            .on('end', () => {
                console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Video processing finished`);
                resolve(true);
            })
            .on('error', (err, stdout, stderr) => {
                console.error(`[${DateTime.utc().toFormat('HH:mm')}] error: Error processing video: ${err.message}`);
                console.error('ffmpeg stdout: ', stdout);
                console.error('ffmpeg stderr: ', stderr);
                reject(err);
            })
            .run();
    });
}

module.exports = editClip;