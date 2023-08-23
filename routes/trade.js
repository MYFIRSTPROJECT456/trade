var express = require('express');
var router = express.Router();
const axios = require('axios');
const trade = require('../utils/trade');
const groww = require('../utils/groww');
const scanner = require('../utils/scanner');
const zerodha = require('../utils/zerodha');
var FormData = require('form-data');
const fs = require("fs");
const dotenv = require('dotenv');
const headers = require('../headers.json');
const scanner_headers = require('../scanner_headers.json');
const zerodha_headers = require('../ZerodhaHeaders.json');

dotenv.config();
router.get('/create', function (req, res, next) {
    res.render('trade');
})

// router.get('/iframepage', function (req, res, next) {
//     // console.log('req.query', req.query.id)
//     res.render('iframe', { id : req.query.id });
// })

// router.get('/tradingviews', function (req, res, next) {
//     console.log('req.query tid', req.query.tid)
//     axios
//         .get(`https://groww.in/charts/stocks/${req.query.tid}?exchange=NSE&chartType=TradingView`)
//         .then(function (response) {
//             console.log('here is the traidng resp', response.data)
//             res.send(response.data);
//         }).catch(error => {
//             res.send(error.message);
//         })
// })
router.get('/', function (req, res, next) {
    res.render('dashboard');
})


router.post('/trade', function (req, res, next) {
    // Axios GET Default
    const str = req.body.inputVal;
    const replaced = str.replace(/ /g, '+');
    axios
        .get(`https://www.screener.in/api/company/search/?q=${replaced}&v=3&fts=1`)
        .then(function (response) {
            res.send(response.data);
        }).catch(error => {
            res.send(error.message);
        })
})

router.get('/trade', function (req, res, next) {
    const form_data = new FormData();
    form_data.append('scan_clause', process.env.timeframestr);
    let axiosConfig = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'x-requested-with': 'XMLHttpRequest',
            'x-csrf-token': scanner_headers['x-csrf-token'],
            'cookie': scanner_headers.cookie
        }
    };
    // {
    //     "data":[],"draw": 0,"recordsFiltered": 0,"recordsTotal": 0
    // }
    axios.post('https://chartink.com/screener/process', form_data, axiosConfig)
        .then((res) => {
            console.log("RESPONSE RECEIVED: ", res.data.recordsTotal);
            const tradeExecuted = new Promise((resolve, reject) => {
                trade
                    .loginToZerodha(res.data)
                    .then(data => {
                        resolve(data)
                    })
                    .catch(err => reject('Login scrape failed'))
            })
        })
        .catch((err) => {
            console.log("AXIOS ERROR: ", err);
        })

});

router.get('/groww', function (req, res, next) {
    groww
        .loginToGroww(res.data)
        .then(data => {
            res.redirect('/');
        })
        .catch(err => console.log('Login scrape failed'))

});

router.get('/scanner', function (req, res, next) {
    scanner
        .loginToScanner(res.data)
        .then(data => {
            console.log('now inside then')
            res.redirect('/');
        })
        .catch(err => console.log('Login scrape failed', err))

});

router.get('/zerodha', function (req, res, next) {
    zerodha
        .loginToZerodha(res.data)
        .then(data => {
            res.redirect('/');
        })
        .catch(err => console.log('Login scrape failed'))

});
router.post('/clear-watchlist', function (req, res, next) {
    // console.log(headers['x-user-campaign']);
    // console.log(req.body.data['clear-watch-list']);
    var result = [];
    const axiosConfig = {
        headers: {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "authorization": headers.authorization,
            "sec-ch-ua": "\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-app-id": "growwWeb",
            "x-device-id": "d5ec5587-83e1-5d57-9b0c-b39de5dbcd4a",
            "x-device-type": "charts",
            "x-platform": "web",
            "x-request-checksum": "NGRuM3BtIyMjcm0xdnExS3M5cjVjZzJDNGxZOHhHVjlCOXlUVTFpSFN5VXRlRGNqU0Y1UzBvclU0bjdma1RjZTBhUmQ2UklJNHpYRjhTZWxldEQ5TERHbkgxMGFpSFc4UVdHdVQwRG1FYmhPU3p5endoM009",
            "x-request-id": "47260661-ebea-4abb-9d61-8ddab7f4db67",
            "x-user-campaign": headers['x-user-campaign']
        }
    };
    axios
        .get(`https://groww.in/v1/api/selection/v2/watchlist/all/items_mapping?include_index_fno=true`, axiosConfig)
        .then(function (response) {
            const watchlist = response.data.watchlistIdItemsMapping;
            watchlistId = watchlist[req.body.data['clear-watch-list']]
            // console.log(watchlistId)
            watchlistId.itemList.forEach(element => {
                const payload = {
                    itemId: element,
                    addToWatchlists: [],
                    removeFromWatchlists: [watchlistId.watchlistId]
                };
                const config = {
                    headers: {
                        "accept": "application/json, text/plain, */*",
                        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                        "authorization": headers.authorization,
                        "content-type": "application/json",
                        "sec-ch-ua": "\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": "\"macOS\"",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-app-id": "growwWeb",
                        "x-device-id": "d5ec5587-83e1-5d57-9b0c-b39de5dbcd4a",
                        "x-device-type": "charts",
                        "x-platform": "web",
                        "x-request-checksum": "bzF6cjg1IyMjZjkzcWYzTEtzU0lvUXNDSUVrQ1I0Z0xad3NoNWppSjBXaEZFRnlJRGxmYXpjdUJhU2p1RGQ5REtjcDMxcHM5end5anhEMjV4YW95L3FsVDZKb1F3MFFXTjFJM2tCNGh3a0hJUC9EdG9IWlk9",
                        "x-request-id": "da73e0bf-9f0d-4ad8-ac93-4c45eef1e761",
                        "x-user-campaign": headers['x-user-campaign']
                    }
                }
                axios.put(`https://groww.in/v1/api/selection/v2/watchlist/item`, payload, config)
                    .then((response) => {
                        console.log('response ', response.data);
                        result.push(response.data);

                    })
                    .catch((err) => {
                        res.send(err);
                    })
            })
        }).catch(error => {
            res.send(error);
        })
})

router.post('/update-watchlist', function (req, res, next) {
    // fetching the list of stocks
    const form_data = new FormData();
    if (req.body.data['update-watch-list'] == 'GWL_1680544119489') {
        form_data.append('scan_clause', process.env.supertrend);
    }
    else if (req.body.data['update-watch-list'] == 'GWL_1680520499557') {
        form_data.append('scan_clause', process.env.intraday);
    }
    else if (req.body.data['update-watch-list'] == 'GWL_1680541977696') {
        form_data.append('scan_clause', process.env.rsiStrategy);
    }
    // else if (req.body.data['update-watch-list'] == 'GWL_1642449627222') {
    //     form_data.append('scan_clause', process.env.rsiStrategy);
    // }
    let scannerConfig = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'x-requested-with': 'XMLHttpRequest',
            'x-csrf-token': scanner_headers['x-csrf-token'],
            'cookie': scanner_headers.cookie
        }
    };
    // {
    //     "data":[],"draw": 0,"recordsFiltered": 0,"recordsTotal": 0
    // }
    axios.post('https://chartink.com/screener/process', form_data, scannerConfig)
        .then((response) => {
            // console.log("RESPONSE RECEIVED: ", response.data.data);
            addRecordInWatchlist(response.data.data, req.body.data)

        })
        .catch((err) => {
            console.log("AXIOS ERROR: ", err);
        })

    function addRecordInWatchlist(listOfData, dropdownPayload) {
        listOfData.forEach(element => {
            let axiosConfig = {
                headers: {
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                    "sec-ch-ua": "\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"macOS\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-app-id": "growwWeb",
                    "x-device-id": "d5ec5587-83e1-5d57-9b0c-b39de5dbcd4a",
                    "x-device-type": "charts",
                    "x-platform": "web",
                    "x-request-checksum": "MzVuajkjIyNBdEQ1MWx4cEpEclZxNjhpcll5NWVsaTh2MVhCS2VPWEtpdXBHZkpDREVSY3p3WTdhSWVZcHMwTlE4KzNBRzhteDlwL1pRdS9WNDM5TGdJU3ZTM2NQL2dFcG1zK29lNWxoTi9ZbjFvZzM3MD0=",
                    "x-request-id": "52de80d3-b72d-492f-af77-ef764970e8bf"
                }
            };
            axios
                .get(`https://groww.in/v1/api/search/v1/watchlist?app=false&entity_type=STOCKS_WATCHLIST&page=0&q=${element.nsecode}&size=6`, axiosConfig)
                .then(function (response) {
                    // console.log(response.data.content)
                    const payload = {
                        itemId: response.data.content[0].groww_contract_id,
                        addToWatchlists: [dropdownPayload['update-watch-list']],
                        removeFromWatchlists: []
                    };
                    const config = {
                        headers: {
                            "accept": "application/json, text/plain, */*",
                            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                            "authorization": headers.authorization,
                            "content-type": "application/json",
                            "sec-ch-ua": "\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
                            "sec-ch-ua-mobile": "?0",
                            "sec-ch-ua-platform": "\"macOS\"",
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-origin",
                            "x-app-id": "growwWeb",
                            "x-device-id": "d5ec5587-83e1-5d57-9b0c-b39de5dbcd4a",
                            "x-device-type": "charts",
                            "x-platform": "web",
                            "x-request-checksum": "NWxpcXhwIyMjeDNERW42MkZ5UkpWSWxzQ2V2OHEreXg1L2ZteWdCK3lpSjRGUTJYV3RtRU1ETGNXZXNoMjhLbkhRMEZCeUppSEZCdUlxaGZSUURPNzBIK3RSMmtBcWNhUk5ENWo4dzhuVkVxeStJOXVGRkE9",
                            "x-request-id": "30d33726-e5ed-4dc8-9b46-a80c88653dad",
                            "x-user-campaign": headers['x-user-campaign']
                        }
                    }
                    axios.put(`https://groww.in/v1/api/selection/v2/watchlist/item`, payload, config)
                        .then((response) => {
                            console.log(response.data)

                        })
                        .catch((err) => {
                            res.send(err);
                        })
                }).catch(error => {
                    res.send(error);
                })
        });

    }
});


router.post('/open-watchlist', function (req, res, next) {
    // fetching the list of stocks
    const form_data = new FormData();
    if (req.body.data['open-watch-list'] == 'GWL_1680544119489') {
        form_data.append('scan_clause', process.env.supertrend);
    }
    else if (req.body.data['open-watch-list'] == 'GWL_1680520499557') {
        form_data.append('scan_clause', process.env.intraday);
    }
    else if (req.body.data['open-watch-list'] == 'GWL_1680541977696') {
        form_data.append('scan_clause', process.env.rsiStrategy);
    }
    else if (req.body.data['open-watch-list'] == 'D_EMA') {
        form_data.append('scan_clause', process.env.D_EMA);
    }
    else if (req.body.data['open-watch-list'] == 'FMIN_EMA') {
        form_data.append('scan_clause', process.env.FMIN_EMA);
    }
    else if (req.body.data['open-watch-list'] == 'Stochastics') {
        form_data.append('scan_clause', process.env.Stochastics);
    }
    else if (req.body.data['open-watch-list'] == 'WEEKHIGH') {
        form_data.append('scan_clause', process.env.WEEKHIGH);
    }
    else if (req.body.data['open-watch-list'] == 'MYEMASTRATEGY') {
        form_data.append('scan_clause', process.env.MYEMASTRATEGY);
    }
    else if (req.body.data['open-watch-list'] == 'MYREDEMASTRATEGY') {
        form_data.append('scan_clause', process.env.MYREDEMASTRATEGY);
    }
    else if (req.body.data['open-watch-list'] == 'TWENTYEMASTRATEGY') {
        form_data.append('scan_clause', process.env.TWENTYEMASTRATEGY);
    }
    else if (req.body.data['open-watch-list'] == 'Zerodha') {
        callZerodhaHoldingApi().then((holdings) => {
            res.send({
                name: 'zerodha',
                data: JSON.stringify(holdings.data.data)
            });
        }).catch((err) => {
            res.send(err.message);
        })
    }
    else if (req.body.data['open-watch-list'] == 'EMA_CROSSOVER') {
        form_data.append('scan_clause', process.env.EMA_CROSSOVER);
    }
    let scannerConfig = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'x-requested-with': 'XMLHttpRequest',
            'x-csrf-token': scanner_headers['x-csrf-token'],
            'cookie': scanner_headers.cookie
        }
    };

    axios.post('https://chartink.com/screener/process', form_data, scannerConfig)
        .then((response) => {
            // console.log("RESPONSE RECEIVED: ", response.data.data.length);
            res.send({
                name: 'scanner',
                data: response.data.data
            });

        })
        .catch((err) => {
            console.log("AXIOS ERROR: ", err);
        })

});

function callZerodhaHoldingApi() {
    let customPromise = new Promise((resolve, reject) => {
        let axiosConfig = {
            headers: {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                "authorization": zerodha_headers['authorization'],
                "if-none-match": "W/\"F3o1pABVyP0XcliW\"",
                "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Google Chrome\";v=\"114\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-kite-app-uuid": zerodha_headers['x-kite-app-uuid'],
                "x-kite-userid": "DDH045",
                "x-kite-version": "3.0.14"
            },
            "referrer": "https://kite.zerodha.com/holdings",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        };
        axios
            .get(`https://kite.zerodha.com/oms/portfolio/holdings`, axiosConfig)
            .then(function (response) {
                resolve(response);
            }).catch(error => {
                reject(error);
            })
    });

    return customPromise;
}

router.post('/getopen-url', function (req, res, next) {
    // fetching the list of stocks
    // console.log('inside getopen', req.body.data)
    let axiosConfig = {
        headers: {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "sec-ch-ua": "\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-app-id": "growwWeb",
            "x-device-id": "d5ec5587-83e1-5d57-9b0c-b39de5dbcd4a",
            "x-device-type": "charts",
            "x-platform": "web",
            "x-request-checksum": "MzVuajkjIyNBdEQ1MWx4cEpEclZxNjhpcll5NWVsaTh2MVhCS2VPWEtpdXBHZkpDREVSY3p3WTdhSWVZcHMwTlE4KzNBRzhteDlwL1pRdS9WNDM5TGdJU3ZTM2NQL2dFcG1zK29lNWxoTi9ZbjFvZzM3MD0=",
            "x-request-id": "52de80d3-b72d-492f-af77-ef764970e8bf"
        }
    };
    axios
        .get(`https://groww.in/v1/api/search/v1/watchlist?app=false&entity_type=STOCKS_WATCHLIST&page=0&q=${req.body.data.nsecode}&size=6`, axiosConfig)
        .then(function (response) {
            console.log('respo', response.data.content)
            res.send(response.data.content[0]);
        })
        .catch((err) => {
            res.send(err);
        })



});

router.get('/redlist', function (req, res) {
    let axiosConfig = {
        headers: {
            "accept": "*/*",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "sec-ch-ua": "\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-language": "in",
            "x-requested-with": "XMLHttpRequest",
            "cookie": "cookiePrivacyPreferenceBannerProduction=notApplicable; cookiesSettings={\"analytics\":true,\"advertising\":true}; will_start_trial=1; device_t=aFdBWkF3OjA.EXx7bNnme4QeVJB8piPGMwxt5qPagU03MlZTcGX_ECM; sessionid=u5t22h06omyfazmpigohxys7879mlj96; sessionid_sign=v1:MV+QyBaQyDOJTK5F64BJHQ5r9ygP/0s5ONurGwmxfcw=; png=b0af23a2-710e-4c84-944b-adcf89744567; etg=b0af23a2-710e-4c84-944b-adcf89744567; cachec=b0af23a2-710e-4c84-944b-adcf89744567; tv_ecuid=b0af23a2-710e-4c84-944b-adcf89744567; __gads=ID=220e73c1b8212133:T=1685388213:RT=1685418629:S=ALNI_MZNegsY2Ymu88AK60aLJnjU8n068A; __gpi=UID=00000c0cdfb858f7:T=1685388213:RT=1685418629:S=ALNI_MY8TckHqUtjU7IIZY6qWcGhudgzQQ; _gid=GA1.2.1726827084.1685695614; _sp_ses.cf1a=*; _ga=GA1.1.1251364347.1685388137; _sp_id.cf1a=3573551c-29d4-4866-9f15-4d5758330b4c.1685388136.14.1685735379.1685702900.2e747cfb-0c4f-4c8a-be5b-95d66f09db9c; _gat_gtag_UA_24278967_1=1; _ga_YVVRYGL0E0=GS1.1.1685725171.392.1.1685736163.60.0.0",
            "Referer": "https://in.tradingview.com/chart/Vv69KBVx/",
            "Referrer-Policy": "origin-when-cross-origin"
        },
        "referrer": "https://in.tradingview.com/chart/Vv69KBVx/",
        "referrerPolicy": "origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    };
    axios
        .get(`https://in.tradingview.com/api/v1/symbols_list/colored/red`, axiosConfig)
        .then(function (response) {
            console.log('response', response.data);
        }).catch(error => {
            res.send(error);
        })

})
module.exports = router;
