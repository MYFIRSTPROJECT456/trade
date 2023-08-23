const csrf = 'v6jcJEmnJY3GzfT6NM7FZD5l6rNlZDfCZXXGE3R0';

await fetch("https://chartink.com/screener/process", {
  "headers": {
    "accept": "application/json, text/javascript, */*; q=0.01",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "sec-ch-ua": "\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-csrf-token": `${csrf}`,
    "x-requested-with": "XMLHttpRequest"
  },
  "referrer": "https://chartink.com/screener/rsi-45-to-50-3",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": "scan_clause=(+%7Bcash%7D+(+latest+rsi(+14+)+%3E+45+and+1+day+ago++rsi(+14+)+%3C%3D+45+and+latest+volume+%3E+500000+and+latest+close+%3E+50+)+)+",
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
}).then(res => res.json()).then(response => { 
    //console.log(response.data) 
    let listData = response.data.sort((a, b) => { return b.per_chg - a.per_chg });
    let filterArrData;
    listData.forEach(element => {
        filterArrData +=`NSE:${element.nsecode},`;
    });
    test(filterArrData);                    

                                            })

function test (data){
    console.log('result => ' + data);
    // navigator.clipboard.writeText(data);
}                                            