var uniqueDomains = [];
var todaysActivity = [];

function getBaseUrl(url) {
    var pathArray = String(url).split('/');

    var protocol = pathArray[0];
    var host = pathArray[2];

    var url = protocol + '//' + host;

    return url;
}

var blockedDomains = [];
var option = 'daily';

function checkURL(url, domain) {
    if(url.includes(domain)) {
        return true;
    }
    return false;
}

function checkURLtoArray(url, domainArray) {
    var ok = 1;

    for(var i = 0, ie = domainArray.length; i < ie; i++) {
        if(checkURL(url, domainArray[i])) {
            ok = 0;
        }
    }

    if(ok) {
        return false;
    } else {
        return true;
    }
}

function getSettingsAndFlow() {
    var inCallback = 1;

    chrome.storage.sync.get(['savedDomains', 'option'], function(items) {
        var inCallback = 0;
        blockedDomains = items.savedDomains;
        option = items.option;

        if(!inCallback) {
            getSettingsAndFlowDone();
        }
    });

    var getSettingsAndFlowDone = function() {
        console.log("Here it goes!");
        retrieveActivity(option, blockedDomains);
    }
}

getSettingsAndFlow();


function retrieveActivity(distOption, excludedDomains) {
    var numOfRequests = 0;

    var currentDate = new Date();
    var startTime = 0;
    var maxResults = 1000;

    if(distOption === 'daily') {
        startTime = currentDate.getTime() - 86400000;
        console.log('DAILY!');
    } else if(distOption === 'weekly') {
        startTime = currentDate.getTime() - 604800000;
        console.log('WEEKLY!');
    } else if(distOption === 'monthly') {
        startTime = currentDate.getTime() - 2629743000;
        maxResults = 1000;
        console.log('MONTHLY!');
    } else if(distOption === 'alltime') {
        startTime = 0;
        maxResults = 1000;
        console.log('ALLTIME!');
    } else {
        startTime = currentDate.getTime() - 86400000; // soon to be specific date
    }
    
    var searchOptions = {
        'text': '',
        'startTime': startTime,
        'maxResults': maxResults
    }

    chrome.history.search(searchOptions, function(historyItems) {

        for(var i = 0, ie = historyItems.length; i < ie; i++) {
            var currentUrl = historyItems[i].url;

            var ok = 1;

            if (uniqueDomains.indexOf(currentUrl) === -1 && currentUrl.startsWith('http')) {
                // Check to see if there are matching excluded domains

                if(!checkURLtoArray(currentUrl, excludedDomains)) {
                    uniqueDomains.push(currentUrl);
                }

            }
        }

        uniqueDomains.forEach(function(item) {
            chrome.history.getVisits({url: item}, function(visitItems) {

                // Check to see if the visit was done after startTime
                var hits = 0;
                var mostRecentVisit = 0;

                for(var i = 0, ie = visitItems.length; i < ie; i++) {
                    if(visitItems[i].visitTime > startTime) {
                        hits++;
                    }

                    if(visitItems[i].visitTime > mostRecentVisit) {
                        mostRecentVisit = visitItems[i].visitTime;
                    }
                }

                if(hits > 0) {
                    var utcMilliseconds = mostRecentVisit;
                    var convertedDate = new Date(0);
                    convertedDate.setUTCMilliseconds(utcMilliseconds);
                    
                    var activity = {
                        'url': item,
                        'hits': hits,
                        'mostRecent': convertedDate
                    }
                    todaysActivity.push(activity);
                    hits = 0;
                } 

                numOfRequests--;
                if(!numOfRequests) {
                    onAllVisitsProcessed();
                }
            });
            numOfRequests++;
        });

        if(!numOfRequests) {
            onAllVisitsProcessed();
        }
    });

    var onAllVisitsProcessed = function() {

        function compare(a, b) {
            const hitsA = a.hits;
            const hitsB = b.hits;

            let comparison = 0;
            if(hitsA > hitsB) {
                comparison = 1;
            } else if(hitsA < hitsB) {
                comparison = -1;
            }

            return comparison * -1; // for reverse order
        }

        var sortedActivity = todaysActivity.sort(compare);

        for(i = 0, ie = sortedActivity.length; i < ie; i++) {
            console.log(sortedActivity[i].url + " " + sortedActivity[i].hits + " " + sortedActivity[i].mostRecent);
        }

        drawMainTable(sortedActivity);
    };
}

function drawMainTable(activityArray) {
    google.charts.load('current', {'packages':['table']});
    google.charts.setOnLoadCallback(drawTable);

    function drawTable() {
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'URL');
        data.addColumn('number', 'Hits');
        data.addColumn('date', 'Last Visit');
        data.addRows(activityArray.length);

        for(var i = 0, ie = activityArray.length; i < ie; i++) {
            data.setCell(i, 0, activityArray[i].url);
            data.setCell(i, 1, activityArray[i].hits);
            data.setCell(i, 2, activityArray[i].mostRecent);
        }

        var table = new google.visualization.Table(document.getElementById('overviewTable'));

        var options = {
            showRowNumber: true,
            width: '75%',
            height: '100%',
            alternatingRowStyle: true,
            page: 'enable',
            pageSize: 10
        }
        table.draw(data, options);
    }
}
