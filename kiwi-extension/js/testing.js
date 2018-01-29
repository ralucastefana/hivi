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
// function buildTodaysActivity() {
//     var uniqueUrls = [];
//     var todaysActivity = [];

//     searchOptions = {
//         text: ''
//     };

//     chrome.history.search(searchOptions, function(historyItems) {
//         historyItems.forEach(function(item) {
//             var currentUrl = getBaseUrl(item.url);

//             if (uniqueUrls.indexOf(currentUrl) === -1 && currentUrl.startsWith('http')) {
//                 uniqueUrls.push(currentUrl);
//             }
//         })

//         uniqueUrls.forEach(function(item) {
//             chrome.history.getVisits({url: item}, function(visitItems) {
//                 var activity = {
//                     'url': item,
//                     'hits': visitItems.length + 1
//                 }
    
//                 todaysActivity.push(activity);
//                 console.log(activity.url + " " + activity.hits);
//             });
//         })
//     });
// }

// buildTodaysActivity();

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

// Code for building a piechart
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
