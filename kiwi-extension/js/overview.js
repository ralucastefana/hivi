function getBaseUrl(url) {
    var pathArray = String(url).split('/');

    var protocol = pathArray[0];
    var host = pathArray[2];

    var url = protocol + '//' + host;

    return url;
}

function buildTodaysActivity() {
    var inCallBack = 0;

    var searchOptions = {
        'text': ''
    }

    var domains = [];

    chrome.history.search(searchOptions, function(historyItems) {
        inCallBack = 1;

        for(var i = 0, ie = historyItems.length; i < ie; i++) {
            var currentUrl = getBaseUrl(historyItems[i].url);

            if (domains.indexOf(currentUrl) === -1 && currentUrl.startsWith('http')) {
                domains.push(currentUrl);
            }

            inCallBack = 0;
        }

        if(!inCallBack) {
            onAllVisitsProcessed();
        }
    });

    var onAllVisitsProcessed = function() {
        for(i = 0, ie = domains.length; i < ie; i++) {
            console.log(domains[i]);
        }
    };
}

buildTodaysActivity();
