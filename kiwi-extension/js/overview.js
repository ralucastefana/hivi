function getBaseUrl(url) {
    var pathArray = String(url).split('/');

    var protocol = pathArray[0];
    var host = pathArray[2];

    var url = protocol + '//' + host;

    return url;
}

var uniqueDomains = [];
var todaysActivity = [];

function buildTodaysActivity() {
    var numOfRequests = 0;

    var searchOptions = {
        'text': ''
    }

    chrome.history.search(searchOptions, function(historyItems) {

        for(var i = 0, ie = historyItems.length; i < ie; i++) {
            var currentUrl = getBaseUrl(historyItems[i].url);

            if (uniqueDomains.indexOf(currentUrl) === -1 && currentUrl.startsWith('http')) {
                uniqueDomains.push(currentUrl);
            }
        }

        uniqueDomains.forEach(function(item) {
            chrome.history.getVisits({url: item}, function(visitItems) {
                var activity = {
                    'url': item,
                    'hits': visitItems.length + 1
                }

                todaysActivity.push(activity);

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
            console.log(sortedActivity[i].url + " " + sortedActivity[i].hits);
        }

        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawChart);

        function drawChart() {
            var data = new google.visualization.DataTable();
            data.addColumn('string', 'URL');
            data.addColumn('number', 'Hits');
            data.addRows(10);

            for(var i = 0; i < 10; i++) {
                data.setCell(i, 0, sortedActivity[i].url);
                data.setCell(i, 1, sortedActivity[i].hits);
            }

            var options = {
                'title': 'Top 10 Today\'s Internet Usage'
            };

            var chart = new google.visualization.PieChart(document.getElementById('piechart'));
            chart.draw(data, options);
        }
    };
}

buildTodaysActivity();
