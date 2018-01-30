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

// Code for productivity chart
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

// Code for drawing days with most activity
    google.charts.load("current", {packages:["calendar"]});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
       var dataTable = new google.visualization.DataTable();
       dataTable.addColumn({ type: 'date', id: 'Date' });
       dataTable.addColumn({ type: 'number', id: 'Won/Loss' });
       dataTable.addRows([
            [ new Date(2012, 3, 13), 37032 ],
            [ new Date(2012, 3, 14), 38024 ],
            [ new Date(2012, 3, 15), 38024 ],
            [ new Date(2012, 3, 16), 38108 ],
            [ new Date(2012, 3, 17), 38229 ],
            // Many rows omitted for brevity.
            [ new Date(2013, 9, 4), 38177 ],
            [ new Date(2013, 9, 5), 38705 ],
            [ new Date(2013, 9, 12), 38210 ],
            [ new Date(2013, 9, 13), 38029 ],
            [ new Date(2013, 9, 19), 38823 ],
            [ new Date(2013, 9, 23), 38345 ],
            [ new Date(2013, 9, 24), 38436 ],
            [ new Date(2013, 9, 30), 38447 ]
        ]);

       var chart = new google.visualization.Calendar(document.getElementById('calendar_basic'));

       var options = {
            title: "Red Sox Attendance",
            height: 350,
       };

       chart.draw(dataTable, options);
   }
