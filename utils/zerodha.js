const puppeteer = require('puppeteer');
const axios = require('axios');
var FormData = require('form-data');
const fs = require("fs");
const dotenv = require('dotenv');
dotenv.config();
const fiData = {
    fiURL: 'https://kite.zerodha.com/',
    postingURL: '',
    userID: 'input[id="userid"]',
    password: 'input[id="password"]',
    loginButton: 'button[type="submit"]',
    logoutButton: '', //optional
    userIDVAlue: 'DDH045',
    passwordValue: 'Janki@#456',
    dfp: ''
}

//DO NOT MODIFY BELOW
//puppeteer Config
const browserConfig = {
    headless: false,
    defaultViewport: null,
    devtools: false,
    args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--disable-accelerated-jpeg-decoding",
        "--disable-accelerated-mjpeg-decode",
        "--disable-accelerated-video-decode",
        "--disable-extensions",
        "--disable-logging",
        "--disable-login-animations",
        "--disable-logging-redirect",
        "--disable-popup-blocking",
        "--window-size=1920x1080",
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0"
    ]
}

// Script

async function loginToZerodha(scanner) {
    // console.log('inside login scanner', scanner)
    try {
        const browser = await puppeteer.launch(browserConfig);
        const page = await browser.newPage();

        // await interceptRequests(page);
        await page.goto(fiData.fiURL, { timeout: 60000 }).catch((err) => console.log('error inside page goto', err));
        await page.type(fiData.userID, fiData.userIDVAlue);
        await page.type(fiData.password, fiData.passwordValue);
        await page.click(fiData.loginButton);

        await page.waitForNavigation({ timeout: 60000 }).catch(async (error) => {
            console.log(`Login URL failed for first attempt. Now trying to reload ${error.message}`);
        });
        // // Wait for 3 seconds using setTimeout within page.evaluate
        // await page.evaluate(() => {
        //     return new Promise((resolve) => {
        //         setTimeout(resolve, 3000);
        //     });
        // });
        // await page.click('div.header a[href="/holdings"]');
        // await page.waitForSelector('.page-dashboard');
        // Enable request interception
        await page.setRequestInterception(true);

        // Listen for the request event
        page.on('request', (interceptedRequest) => {
            // Check if the intercepted request matches your API call
            console.log('interceptedRequest', interceptedRequest.url())
            if (interceptedRequest.url().includes('/portfolio/holdings')) {
                // Get the headers of the intercepted request
                const headers = interceptedRequest.headers();
                // console.log('Headers:', headers);
                // Convert the response to a JSON string
                const jsonData = JSON.stringify(headers);

                // Save the response to a file
                fs.writeFile('ZerodhaHeaders.json', jsonData, (err) => {
                    if (err) {
                        console.error('Error saving file:', err);
                        return;
                    }
                    console.log('Response saved to file: ZerodhaHeaders.json');
                });
            }

            // Continue with the intercepted request
            interceptedRequest.continue();
        });
        await page.goto('https://kite.zerodha.com/holdings');
    }
    catch (error) {
        console.log('Lunching puppetter', error)
    }
}


module.exports.loginToZerodha = loginToZerodha;
