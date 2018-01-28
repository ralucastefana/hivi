// searchOptions = {
//     text: '',
//     maxResults: 30
// };

// chrome.history.search(searchOptions, function(data) {
//     data.forEach(function(page) {
//         if ((page.url).startsWith("http")) {
//             console.log(page.url);
//         }
//     });
// });

function getBaseUrl(url) {
    var pathArray = String(url).split('/');

    var protocol = pathArray[0];
    var host = pathArray[2];

    var url = protocol + '//' + host;

    return url;
}

// List of unique urls for the last 24h
uniqueUrls = [];

function buildTodayUrls(arrayOfUrls) {
    searchOptions = {
        text: ''
    };

    chrome.history.search(searchOptions, function(historyItems) {
        historyItems.forEach(function(item) {
            var currentUrl = getBaseUrl(item.url);

            if (arrayOfUrls.indexOf(currentUrl) === -1 && currentUrl.startsWith('http')) {
                arrayOfUrls.push(currentUrl);
            }
        })

        uniqueUrls.forEach(function(item) {
            console.log(item);
        })
    });
}

buildTodayUrls(uniqueUrls);
