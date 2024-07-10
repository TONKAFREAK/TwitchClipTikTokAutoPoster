













// -------------------------- NOT FINISHED --------------------------
const { DateTime } = require('luxon');
const puppeteer = require('puppeteer');
const getCookies = require('./getCookies'); // Adjust the path if necessary

async function uploadVideo(username, password, title, tags, filepath) {
    const cookies = getCookies();
    console.log(cookies);

    console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Using Puppeteer to upload video...`);

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
        // Navigate to TikTok home page to set the correct domain
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Navigating to TikTok home page...`);
        await page.goto('https://www.tiktok.com/', { waitUntil: 'networkidle2' });

        // Insert cookies
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Adding cookies...`);
        for (let cookie of cookies) {
            await page.setCookie(cookie);
        }
        // Refresh the page to apply cookies
        await page.reload({ waitUntil: 'networkidle2' });
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Cookies added and page refreshed`);

        // Navigate to TikTok login page
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Navigating to TikTok login page...`);
        await page.goto('https://www.tiktok.com/login/phone-or-email/email', { waitUntil: 'networkidle2' });

        // Input username and password
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Inputting username and password...`);
        await page.type('input[name="username"]', username);
        await page.type('input[name="password"]', password);

        // Click login button
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Clicking login button...`);
        await page.click('button[data-e2e="login-button"]');

        // Wait for CAPTCHA
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Waiting for CAPTCHA...`);
        try {
            await page.waitForSelector('.captcha_verify_container', { timeout: 10000 });
            console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: CAPTCHA detected, Please solve it manually within the next 2 minutes.`);
            await page.waitForSelector('.captcha_verify_container', { hidden: true, timeout: 180000 });
            console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: CAPTCHA solved, continuing...`);
        } catch (error) {
            console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: No CAPTCHA detected.`);
        }

        // Navigate to the upload page
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Navigating to the upload page...`);
        await page.goto('https://www.tiktok.com/tiktokstudio/upload?from=upload&lang=en', { waitUntil: 'networkidle2' });

        // Wait for the file input element
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Waiting for file input element...`);
        const fileInputSelector = 'input[type="file"][accept="video/*"]';
        await page.waitForSelector(fileInputSelector);

        // Upload the video file
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Uploading the video file...`);
        const fileInput = await page.$(fileInputSelector);
        await fileInput.uploadFile(filepath);
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: File selected successfully.`);

        // Wait until the video is uploaded and the rich text editor for the title and tags is available
        const editorSelector = '.notranslate.public-DraftEditor-content';
        await page.waitForSelector(editorSelector);

        // Clear the rich text editor content and input the title and tags
        await page.evaluate(() => {
            const editor = document.querySelector('.notranslate.public-DraftEditor-content');
            const range = document.createRange();
            range.selectNodeContents(editor);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('delete');
        });
        await page.type(editorSelector, `${title} ${tags.join(' ')}`);

        // Click the submit button to upload the video
        const postButtonSelector = 'button.TUXButton--primary';
        await page.waitForSelector(postButtonSelector);
        await page.click(postButtonSelector);

        // Wait for the video URL to be available
        const videoUrlSelector = '.video-url';
        await page.waitForSelector(videoUrlSelector);
        const videoUrl = await page.evaluate(() => document.querySelector('.video-url').href);

        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Video uploaded successfully!`);
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Video URL:`, videoUrl);

    } catch (err) {
        console.error(`[${DateTime.utc().toFormat('HH:mm')}] error: An error occurred:`, err);
        console.error(await page.content());
    } finally {
        await browser.close();
    }
}

module.exports = uploadVideo;
