const puppeteer = require('puppeteer');
const axios = require('axios');
var FormData = require('form-data');
const fs = require("fs");
const dotenv = require('dotenv');
dotenv.config();
const fiData = {
    fiURL: 'https://groww.in/',
    postingURL: '',
    userID: 'input[id="login_email1"]',
    password: 'input[id="login_password1"]',
    loginButton: 'div.btn51ParentDimension',
    logoutButton: '', //optional
    userIDVAlue: 'dchdeepak@gmail.com',
    passwordValue: 'Saroj@#456',
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

async function loginToGroww(scanner) {
    // console.log('inside login scanner', scanner)
    try {
        const browser = await puppeteer.launch(browserConfig);
        const page = await browser.newPage();

        // await interceptRequests(page);
        await page.goto(fiData.fiURL, { timeout: 60000 }).catch((err) => console.log('error inside page goto', err));
        await page.click('div.btn51ParentDimension');
        // Wait for 3 seconds using setTimeout within page.evaluate
        await page.evaluate(() => {
            return new Promise((resolve) => {
                setTimeout(resolve, 3000);
            });
        });
        await page.type(fiData.userID, fiData.userIDVAlue);
        await page.click(fiData.loginButton);
        // Wait for 3 seconds using setTimeout within page.evaluate
        await page.evaluate(() => {
            return new Promise((resolve) => {
                setTimeout(resolve, 3000);
            });
        });
        await page.type(fiData.password, fiData.passwordValue);
        await page.click(fiData.loginButton);

        await page.waitForNavigation({ timeout: 60000 }).catch(async (error) => {
            console.log(`Login URL failed for first attempt. Now trying to reload ${error.message}`);
        });
        // await page.waitForSelector('.page-dashboard');
        // Enable request interception
        await page.setRequestInterception(true);

        // Listen for the request event
        page.on('request', (interceptedRequest) => {
            // Check if the intercepted request matches your API call
            if (interceptedRequest.url().includes('items_mapping?include_index_fno=true')) {
                // Get the headers of the intercepted request
                const headers = interceptedRequest.headers();
                // console.log('Headers:', headers);
                // Convert the response to a JSON string
                const jsonData = JSON.stringify(headers);

                // Save the response to a file
                fs.writeFile('headers.json', jsonData, (err) => {
                    if (err) {
                        console.error('Error saving file:', err);
                        return;
                    }
                    console.log('Response saved to file: response.json');
                });
            }

            // Continue with the intercepted request
            interceptedRequest.continue();
        });
        // if (page.url().includes('dashboard')) {
        //     // console.log('inside if scanner', scanner)
        //     mainCode(scanner, page);
        // }
        // else {
        //     await page.goto('https://kite.zerodha.com/dashboard');
        //     mainCode(scanner, page)
        // }
        // return 'executed in order';
    }
    catch (error) {
        console.log('Lunching puppetter', error)
    }
}

async function mainCode(dataObject, page) {
    try {
        // console.log('inside try scanner', dataObject.data)
        if (dataObject.recordsTotal < 1) {
            setInterval(function () {
                screener(page);
            }, 60000);
        }
        else {
            const scannerArr = dataObject.data.sort((a, b) => { return b.per_chg - a.per_chg });
            const filteredScannerArr = [];
            // console.log('after sort scannerArr', scannerArr)
            scannerArr.forEach(elem => {
                if (elem.close > 50 && elem.per_chg > 0 && elem.per_chg < 1) {
                    filteredScannerArr.push(elem);
                }
            })
            console.log('Total filteredScannerArr', filteredScannerArr.length)
            for (let i = 0; i < process.env.numberoftrade; i++) {
                placeAnOrder(filteredScannerArr[i], page);
            }
        }

    }
    catch (error) {
        console.log('inside catch', error)
    }
}
async function placeAnOrder(orderBook, page) {
    try {
        await page.evaluate(async (orderBook, process) => {
            const amtCapital = process.CAPITALAMOUNT;
            const quantity = Math.floor(amtCapital / orderBook.close)
            const orderStatus = await fetch("https://kite.zerodha.com/oms/orders/regular", {
                "headers": {
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "en-US,en;q=0.9",
                    "authorization": `enctoken ${document.cookie.match(new RegExp('(^| )' + 'enctoken' + '=([^;]+)'))[2]}`,
                    "content-type": "application/x-www-form-urlencoded",
                    "sec-ch-ua": "\"Google Chrome\";v=\"111\", \"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"111\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-kite-app-uuid": `${JSON.parse(localStorage.getItem('__storejs_kite_app_uuid'))}`,
                    "x-kite-userid": "DDH045",
                    "x-kite-version": "3.0.14"
                },
                "referrer": "https://kite.zerodha.com/chart/web/tvc/NSE/SAKSOFT/3019265",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": `variety=regular&exchange=NSE&tradingsymbol=${orderBook.nsecode}&transaction_type=BUY&order_type=MARKET&quantity=${quantity}&price=${orderBook.close}&product=CNC&validity=DAY&disclosed_quantity=0&trigger_price=0&squareoff=0&stoploss=0&trailing_stoploss=0&user_id=DDH045&gtt_params=[[1,-1],[1,5]]`,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            }).then(res => res.json()).then((data) => { return data }).catch((err) => { console.log(err.message) });
            console.log('our order', orderStatus)
            return orderStatus;
        }, orderBook, process.env)
    } catch (err) {
        console.log('Your token is invalid, Please provide a valid atl_token', err);
    }
}

async function screener(page) {
    console.log('inside screener function');
    try {
        const form_data = new FormData();
        form_data.append('scan_clause', process.env.timeframestr);
        let axiosConfig = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'x-requested-with': 'XMLHttpRequest',
                'x-csrf-token': process.env.x_csrf_token,
                'cookie': process.env.cookie
            }
        };
        axios.post('https://chartink.com/screener/process', form_data, axiosConfig)
            .then((res) => {
                mainCode(res.data, page);
            })
            .catch((err) => {
                console.log("AXIOS ERROR: ", err);
            })
    } catch (err) {
        console.log('catch block of screener', err);
        throw err;
    }
}
module.exports.loginToGroww = loginToGroww;
