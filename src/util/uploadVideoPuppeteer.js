const { DateTime } = require('luxon');
const puppeteer = require('puppeteer');
const getCookies = require('./getCookies'); 
const fs = require('fs');
const path = require('path');
const sleep = require('./sleep');

// -------------------------- LOGIN FUNCTION --------------------------

async function login() {

    console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Checking if login is necessary...`);

    var cookies = getCookies();

    if (cookies && cookies !== "{}") {
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Unnecessary login, session already exists`);
        return cookies;
    }

    console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Login necessary, starting browser...`);

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(process.env.TIKTOK_LOGIN_URL);
    console.log(`[${DateTime.utc().toFormat('HH:mm')}] IMPORTANT: Please input login and password and press enter`);

    const captchaContainerSelector = '.captcha_verify_container';
    console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Waiting for CAPTCHA`);

    try {
        await page.waitForSelector(captchaContainerSelector, { timeout: 180000 });
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: CAPTCHA detected.`);
        await page.waitForFunction(
            selector => !document.querySelector(selector),
            { timeout: 180000 },
            captchaContainerSelector
        );
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: CAPTCHA solved.`);
    } catch (e) {
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] error: CAPTCHA not solved within the time limit.`);
    }

    const suspiciousContainerSelector = '.twv-web-modal-mask';
    const loggedInSelector = '.css-1t4vwes-DivMainContainer';

    try {
        if (await page.waitForSelector(suspiciousContainerSelector, { timeout: 5000 })) {
            console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Additional verification required.`);
            await page.waitForFunction(
                selector => !document.querySelector(selector),
                { timeout: 180000 },
                suspiciousContainerSelector
            );
            console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Verified`);
        }
    } catch (e) {
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: No additional verification required.`);
    }

    try {
        await page.waitForSelector(loggedInSelector, { timeout: 180000 });
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Login successful`);

        cookies = await page.cookies();
        fs.writeFileSync('resources/cookies.json', JSON.stringify(cookies));
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Cookies saved`);
    } catch (e) {
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] error: Login failed`);
    }

    await browser.close();

    cookies = getCookies();
    return cookies;
}

// -------------------------- UPLOAD FUNCTION --------------------------

async function uploadVideo(title, tags, filepath, page, browser) {

    try {

        await page.goto(process.env.TIKTOK_UPLOAD_URL);

        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Looking for IFrame...`);
        const iframeElement = await page.waitForSelector('iframe', { timeout: 20000 });
        const iframe = await iframeElement.contentFrame();
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: IFrame found`);

        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Looking for file input...`);
        const fileInput = await iframe.waitForSelector('input[type="file"][accept="video/*"]', { timeout: 20000 });
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: File input found`);

        await fileInput.uploadFile(path.resolve(filepath));
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Video upload started...`);

        await iframe.waitForFunction(
            () => document.evaluate(
                "//div[contains(@class, 'info-status-item') and .//span[text()='Uploaded']]",
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            ).singleNodeValue,
            { timeout: 300000 }
        );
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Upload complete`);

        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Searching for editor...`);
        const editorSelector = '.notranslate.public-DraftEditor-content';
        await iframe.waitForSelector(editorSelector, { timeout: 10000 });
        const editor = await iframe.$(editorSelector);
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Editor found`);

        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Clearing the editor content...`);
        await editor.click({ clickCount: 3 });
        await editor.press('Backspace');
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Editor content cleared`);

        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Inputting the video title and tags...`);
        await editor.type(`${title} ${tags.join(' ')}`);
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Title and tags inputted`);

        await sleep(5000);

        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Clicking the post button to post the video...`);
        
        await iframe.waitForSelector('.TUXButton.TUXButton--default.TUXButton--large.TUXButton--primary');

        await iframe.click('.TUXButton.TUXButton--default.TUXButton--large.TUXButton--primary');

        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Video posted`);

        await sleep(2000);
        
    }  catch (err) {
        console.error(`[${DateTime.utc().toFormat('HH:mm')}] error: An error occurred:`, err);
    } finally {
        await browser.close();
        return 'url_placeholder';
    }
}

async function tiktokUpload(title, tags, filepath){
    
    const cookies = await login();

    const extractCookieData = (cookieName) => {
        const cookie = cookies.find(cookie => cookie.name === cookieName);
      
        if (cookie) {
          return {
            name: cookie.name,
            value: cookie.value,
            domain: cookie.domain,
            path: cookie.path,
            expiry: new Date(cookie.expires * 1000).getTime() / 1000, 
            size: cookie.size.toString(), 
            httpOnly: cookie.httpOnly,
            secure: cookie.secure
          };
        }
        return null;
    };

    console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Extracting cookies...`);

    const sessionCookie = extractCookieData('sessionid');
    const ttTargetIdcCookie = extractCookieData('tt-target-idc');

    const browser = await puppeteer.launch({ headless: true });

    const page = await browser.newPage();   
    console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Navigating to TikTok home page...`);
    await page.goto(process.env.TIKTOK_MAINPAGE_URL);
    console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Inserting cookies...`);
    await page.setCookie(sessionCookie);
    await page.setCookie(ttTargetIdcCookie);
    console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Cookies inserted`);
    const url = await uploadVideo(title, tags, filepath, page, browser); 
    return url;

}

module.exports = tiktokUpload;
