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
        maxResults = 2500;
        console.log('MONTHLY!');
    } else if(distOption === 'alltime') {
        startTime = 0;
        maxResults = 5000;
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
                var allVisits = [];

                for(var i = 0, ie = visitItems.length; i < ie; i++) {
                    if(visitItems[i].visitTime > startTime) {
                        hits++;
                    }

                    if(visitItems[i].visitTime > mostRecentVisit) {
                        mostRecentVisit = visitItems[i].visitTime;
                        allVisits.push(visitItems[i].visitTime);
                    }
                }

                if(hits > 0) {
                    var utcMilliseconds = mostRecentVisit;
                    var convertedDate = new Date(0);
                    convertedDate.setUTCMilliseconds(utcMilliseconds);
                    
                    var activity = {
                        'url': item,
                        'hits': hits,
                        'mostRecent': convertedDate,
                        'allVisits': allVisits
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

        console.log(sortedActivity[0].url + " "+ sortedActivity[0].hits);

        for(var i = 0, ie = sortedActivity[0].allVisits.length; i < ie; i++) {
            console.log(sortedActivity[0].allVisits[i]);
        }

        drawPiechart(sortedActivity);
        drawProductivityProcrastination(sortedActivity);
    };
}

function drawPiechart(activityArray) {
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'URL');
        data.addColumn('number', 'Hits');
        data.addRows(10);

        for(var i = 0; i < 10; i++) {
            data.setCell(i, 0, activityArray[i].url);
            data.setCell(i, 1, activityArray[i].hits);
        }

        var options = {
            title: 'Where do you spend most of your time?',
            is3D: true
        };

        var chart = new google.visualization.PieChart(document.getElementById('piechart_3D'));
        chart.draw(data, options);
    }
}

function drawProductivityProcrastination(activityArray) {
    google.charts.load('current', {'packages':['corechart']});
      google.charts.setOnLoadCallback(drawChart);

      function drawChart() {
        var data = new google.visualization.DataTable();
        
          data.addColumn('string','Date');
          data.addColumn('number', 'Productivity');
          data.addColumn('number', 'Procrastination');
          data.addRows(3);
          
          var currentDate = new Date();
          
          var firstDate = new Date(currentDate.getTime() - 79500000);
          var secondDate = new Date(currentDate.getTime() - 67500000);
          var thirdDate = new Date(currentDate.getTime() - 42500000);
          
          console.log(firstDate);
          data.setCell(0, 0, firstDate.toString());
          data.setCell(0, 1, 200);
          data.setCell(0, 2, 300);
          
          data.setCell(1, 0, secondDate.toString());
          data.setCell(1, 1, 748);
          data.setCell(1, 2, 120);
          
          data.setCell(2, 0, thirdDate.toString());
          data.setCell(2, 1, 500);
          data.setCell(2, 2, 987);

        var options = {
          title: 'Eternal Battle for All of Us',
          hAxis: {title: 'Date',  titleTextStyle: {color: '#333'}},
          vAxis: {minValue: 0}
        };

        var chart = new google.visualization.AreaChart(document.getElementById('productivity'));
        chart.draw(data, options);
      }
}
