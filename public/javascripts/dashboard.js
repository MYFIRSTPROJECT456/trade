
//fill watch list form

const updateForm = document.querySelector("#updatewatchlist");
updateForm.addEventListener("submit", updateHandelSubmit);

function updateHandelSubmit(event) {
    event.preventDefault();
    const formData = new FormData(updateForm);
    const data = Object.fromEntries(formData);

    fetch('http://localhost:3000/update-watchlist', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: data })
    }).then(res => res.json())
        .then(result => {
            console.log('result', result)
            document.querySelector('#updateoutput').textContent = result.message;
        })
        .catch(error => console.log(error));
    updateForm.reset();
}


//clear watch list form

const clearForm = document.querySelector("#clarwatchlist");
clearForm.addEventListener("submit", clearHandelSubmit);

function clearHandelSubmit(event) {
    event.preventDefault();
    const formData = new FormData(clearForm);
    const data = Object.fromEntries(formData);

    fetch('http://localhost:3000/clear-watchlist', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: data })
    }).then(res => res.json())
        .then(result => {
            console.log('result', result)
            document.querySelector('#claroutput').textContent = result.message;
        })
        .catch(error => console.log(error));
    clearForm.reset();
}
//open watch list form in multiple tabs

const openFrom = document.querySelector("#openWatchList");
openFrom.addEventListener("submit", openHandelSubmit);
var totalRecord = [];
function openHandelSubmit(event) {
    event.preventDefault();
    const formData = new FormData(openFrom);
    const data = Object.fromEntries(formData);
    // console.log('data', data);

    fetch('http://localhost:3000/open-watchlist', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: data })
    }).then(res => res.json())
        .then(result => {
            if (result.name === 'zerodha') {
                JSON.parse(result.data).forEach(element => {
                    fetch('http://localhost:3000/getopen-url', {
                        method: 'post',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ data: { nsecode : element.tradingsymbol } })
                    }).then(res => res.json())
                        .then(result => {
                            const url = `https://groww.in/charts/stocks/${result.id}?exchange=NSE&chartType=TradingView`;
                            window.open(url);
                        })
                        .catch(error => console.log(error));
                });
            }
            else {
                result.data.sort((a, b) => { return b.per_chg - a.per_chg });
                console.log('result', result.data)
                if (result.data.length > 50) {
                    var wrapper = document.getElementById("myHTMLWrapper");
                    var myHTML = '';
                    for (var i = 0; i < result.data.length / 50; i++) {
                        myHTML += `<button class="btn btn-success" style="margin-right:5px;" onclick="getInfo(${result.data.length}, ${i + 1})">` + (i + 1) + '</button>';
                    }
                    wrapper.innerHTML = myHTML;
                    totalRecord = result.data;
                }
                else {
                    result.data.forEach(element => {
                        fetch('http://localhost:3000/getopen-url', {
                            method: 'post',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ data: element })
                        }).then(res => res.json())
                            .then(result => {
                                // const url = `http://localhost:3000/iframepage?id=${result.id}`;
                                const url = `https://groww.in/charts/stocks/${result.id}?exchange=NSE&chartType=TradingView`;
                                window.open(url);
                            })
                            .catch(error => console.log(error));
                    });
                    // document.querySelector('#openoutput').textContent = result.message;
                }
            }

        })
        .catch(error => console.log(error));
    openFrom.reset();
}

function getInfo(totalPage, page) {
    // get pager object from service
    const pager = getPager(totalRecord.length, page);
    // console.log('pager', pager)
    const pagedItems = totalRecord.slice(pager.startIndex, pager.endIndex + 1);
    // console.log('pagedItems', pagedItems);
    pagedItems.forEach(element => {
        fetch('http://localhost:3000/getopen-url', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: element })
        }).then(res => res.json())
            .then(result => {
                const url = `https://groww.in/charts/stocks/${result.id}?exchange=NSE&chartType=TradingView`;
                window.open(url);
            })
            .catch(error => console.log(error));
    });

}
function getPager(totalItems, currentPage = 1, pageSize = 50) {
    // calculate total pages
    let totalPages = Math.ceil(totalItems / pageSize);

    // ensure current page isn't out of range
    if (currentPage < 1) {
        currentPage = 1;
    } else if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    let startPage, endPage;
    if (totalPages <= 10) {
        // less than 10 total pages so show all
        startPage = 1;
        endPage = totalPages;
    } else {
        // more than 10 total pages so calculate start and end pages
        if (currentPage <= 6) {
            startPage = 1;
            endPage = 10;
        } else if (currentPage + 4 >= totalPages) {
            startPage = totalPages - 9;
            endPage = totalPages;
        } else {
            startPage = currentPage - 5;
            endPage = currentPage + 4;
        }
    }

    // calculate start and end item indexes
    let startIndex = (currentPage - 1) * pageSize;
    let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    // create an array of pages to ng-repeat in the pager control
    let pages = Array.from(Array((endPage + 1) - startPage).keys()).map(i => startPage + i);

    // return object with all pager properties required by the view
    return {
        totalItems: totalItems,
        currentPage: currentPage,
        pageSize: pageSize,
        totalPages: totalPages,
        startPage: startPage,
        endPage: endPage,
        startIndex: startIndex,
        endIndex: endIndex,
        pages: pages
    };
}


