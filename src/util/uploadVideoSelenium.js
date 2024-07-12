const { DateTime } = require('luxon');
const { Builder, By, until, Key } = require('selenium-webdriver');
const getCookies = require('./getCookies');
const path = require('path');
const sleep = require('./sleep');
require('dotenv').config();

async function uploadVideo(username, password, title, tags, filepath) {

    const cookies = getCookies();

    console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Using Selenium to upload video...`);
    let driver = await new Builder().forBrowser('chrome').build();
    driver.manage().setTimeouts({ implicit: 50000 });


    try {
        
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Navigating to TikTok home page...`);
        await driver.get(process.env.TIKTOK_MAINPAGE_URL);

        if (cookies && cookies.length > 0){

            console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Adding cookies...`);
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

            const sessionCookie = extractCookieData('sessionid');
            await driver.manage().addCookie(sessionCookie);
            
            await driver.navigate().refresh();
            console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Cookies added and page refreshed`);
        
        }

        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Navigating to TikTok login page...`);
        await driver.get(process.env.TIKTOK_LOGIN_URL);


        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Looking for username and password input fields...`);
        await driver.wait(until.elementLocated(By.name('username')), 10000);
        let usernameInput = await driver.findElement(By.name('username'));
        await usernameInput.sendKeys(username);
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Inputted username: ${username}`);

        const passwordSelector = 'input.tiktok-wv3bkt-InputContainer.etcs7ny1';
        await driver.wait(until.elementLocated(By.css(passwordSelector)), 10000);
        let passwordInput = await driver.findElement(By.css(passwordSelector));
        await passwordInput.sendKeys(password);
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Inputted password`);


        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Looking for login button...`);
        const loginButoonSelector = 'button[data-e2e="login-button"]';
        await driver.wait(until.elementLocated(By.css(loginButoonSelector)), 10000);
        let loginButton = await driver.findElement(By.css(loginButoonSelector));
        await loginButton.click();
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Clicked login button`);


        const captchaContainerSelector = '.captcha_verify_container';
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Waiting for CAPTCHA`);
        await driver.wait(until.elementLocated(By.css(captchaContainerSelector)), 10000);
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: CAPTCHA detected, Please solve it manually within the next 2 minutes.`);
        await driver.wait(until.stalenessOf(await driver.findElement(By.css(captchaContainerSelector))), 180000);
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: CAPTCHA solved, continuing...`);

    
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Navigating to the upload page...`);
        await driver.get(process.env.TIKTOK_UPLOAD_URL);  

        
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Looking for IFrame...`);
        let iframe = await driver.wait(until.elementLocated(By.tagName('iframe')), 20000);
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: IFrame found`);
        

        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Switching to IFrame...`);
        await driver.switchTo().frame(iframe);
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Switched to IFrame`);


        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Looking for file input...`);
        let fileInput = await driver.wait(until.elementLocated(By.xpath("//input[@type='file' and @accept='video/*']")), 20000);
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: File input found`);


        await fileInput.sendKeys(path.resolve(filepath));
        

        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Video upload started...`);
        let uploadCompleteIndicator = await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'info-status-item') and .//span[text()='Uploaded']]")), 300000);
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Upload complete`);


        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Serching for editor...`);
        const editorSelector = '.notranslate.public-DraftEditor-content';
        await driver.wait(until.elementLocated(By.css(editorSelector)), 10000);
        let editor = await driver.findElement(By.css(editorSelector));
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Editor found`);
        

        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Clearing the editor content...`);
        await editor.sendKeys(Key.CONTROL, 'a');
        await editor.sendKeys(Key.DELETE);
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Editor content cleared`);


        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Inputting the video title and tags...`);
        await editor.sendKeys(`${title} ${tags.join(' ')}`);
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Title and tags inputted`);


        await sleep(5000);


        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Clicking the post button to post the video...`);
        let discardButton = await driver.wait(until.elementLocated(By.xpath("//button[.//div[contains(text(), 'Post')]]")), 20000);
        await discardButton.click();
        console.log(`[${DateTime.utc().toFormat('HH:mm')}] info: Video Posted`);


        await sleep(2000);

    } catch (err) {
        console.error(`[${DateTime.utc().toFormat('HH:mm')}] error: An error occurred:`, err);
    } finally {
        await driver.quit();
        return 'url_placeholder';
    }
}

module.exports = uploadVideo;
