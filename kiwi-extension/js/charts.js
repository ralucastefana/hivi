function getBaseUrl(url) {
    var pathArray = String(url).split('/');

    var protocol = pathArray[0];
    var host = pathArray[2];

    var url = protocol + '//' + host;

    return url;
}

var uniqueDomains = [];
var todaysActivity = [];

var blockedDomains = [];
var option = 'daily';
var savedProductivity = [];
var savedWasters = [];

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

    chrome.storage.sync.get(['savedDomains', 'option', 'savedProductivity', 'savedWasters'], function(items) {
        var inCallback = 0;
        blockedDomains = items.savedDomains;
        option = items.option;
        savedProductivity = items.savedProductivity;
        savedWasters = items.savedWasters;

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
        startTime = currentDate.getTime() - 86400000;
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
                        allVisits.push(visitItems[i].visitTime);
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

        // console.log(sortedActivity[0].url + " "+ sortedActivity[0].hits);

        // for(var i = 0, ie = sortedActivity[0].allVisits.length; i < ie; i++) {
        //     console.log(Math.round(sortedActivity[0].allVisits[i]));
        // }


        /* Productivity Chart Logic*/
        var productivityBucket = {};
        var wastersBucket = {};
        var prodWastersData = {};
        var allDates = [];

        for(var i = 0, ie = sortedActivity.length; i < ie; i++) {
            var currentUrl = sortedActivity[i].url;

            if(checkURLtoArray(currentUrl, savedProductivity)) {
                
                for(var j = 0, je = sortedActivity[i].allVisits.length; j < je; j++) {
                    var currentVisit = Math.round(sortedActivity[i].allVisits[j]);
                    var d = new Date(0);
                    d.setUTCMilliseconds(currentVisit); 
                    
                    var currentIndex = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
                    // console.log(currentIndex);

                    if(!productivityBucket[currentIndex]) {
                        productivityBucket[currentIndex] = 1;
                    } else {
                        productivityBucket[currentIndex]++;
                    }

                    if(allDates.indexOf(currentIndex) === -1) {
                        allDates.push(currentIndex);
                    }
                }
            } else if(checkURLtoArray(currentUrl, savedWasters)) {

                for(var j = 0, je = sortedActivity[i].allVisits.length; j < je; j++) {
                    var currentVisit = Math.round(sortedActivity[i].allVisits[j]);
                    var d = new Date(0);
                    d.setUTCMilliseconds(currentVisit); 
                    
                    var currentIndex = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
                    // console.log(currentIndex);

                    if(!wastersBucket[currentIndex]) {
                        wastersBucket[currentIndex] = 1;
                    } else {
                        wastersBucket[currentIndex]++;
                    }

                    if(allDates.indexOf(currentIndex) === -1) {
                        allDates.push(currentIndex);
                    }
                }
            }
        }

        // Object.keys(productivityBucket).forEach(function(key) {
        //     console.log(key, productivityBucket[key]);
        // });

        // Object.keys(wastersBucket).forEach(function(key) {
        //     console.log(key, wastersBucket[key]);
        // });

        for(var i = 0; i < allDates.length; i++) {
            prodWastersData[allDates[i]] = [];
            
            if(productivityBucket[allDates[i]]) {
                prodWastersData[allDates[i]].push(productivityBucket[allDates[i]]);
            } else {
                prodWastersData[allDates[i]].push(0);
            }

            if(wastersBucket[allDates[i]]) {
                prodWastersData[allDates[i]].push(wastersBucket[allDates[i]]);
            } else {
                prodWastersData[allDates[i]].push(0);
            }

            // console.log(allDates[i]);
            // console.log(prodWastersData[allDates[i]]);
        }

        /* Days with most activity logic! */
        
        var daysDates = [];
        var activityBucket = {};

        for(var i = 0, ie = sortedActivity.length; i < ie; i++) {
            var currentUrl = sortedActivity[i].url;

            for(var j = 0, je = sortedActivity[i].allVisits.length; j < je; j++) {
                var currentVisit = Math.round(sortedActivity[i].allVisits[j]);
                var d = new Date(0);
                d.setUTCMilliseconds(currentVisit);

                d.setHours(0);
                d.setMinutes(0);
                d.setSeconds(0);
                d.setMilliseconds(0);

                if(!activityBucket[d]) {
                    activityBucket[d] = 1;
                } else {
                    activityBucket[d]++;
                }

                if(daysDates.indexOf(d) === -1) {
                    daysDates.push(d);
                }
            }
        }

        // for(var i = 0; i < daysDates.length; i++) {
        //     console.log(daysDates[i] + " " + activityBucket[daysDates[i]]);
        // }

        drawPiechart(sortedActivity);
        drawProductivityProcrastination(prodWastersData, allDates);
        drawDaysWithMostActivity(activityBucket, daysDates);
        drawMostActiveHours(activityBucket, daysDates);
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

function drawProductivityProcrastination(prodWastersData, allDates) {
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        var data = new google.visualization.DataTable();
        
        data.addColumn('string','Date');
        data.addColumn('number', 'Productivity');
        data.addColumn('number', 'Procrastination');
        data.addRows(allDates.length);

        for(var i = 0; i < allDates.length; i++) {
            data.setCell(i, 0, allDates[i]);
            data.setCell(i, 1, prodWastersData[allDates[i]][0]);
            data.setCell(i, 2, prodWastersData[allDates[i]][1]);
        }

        var options = {
          title: 'Eternal Battle for All of Us',
          hAxis: {title: 'Date',  titleTextStyle: {color: '#333'}},
          vAxis: {title: 'Hits', minValue: 0}
        };

        var chart = new google.visualization.AreaChart(document.getElementById('productivity'));
        chart.draw(data, options);

        // for(var i = 0; i < allDates.length; i++) {
        //     console.log(prodWastersData[allDates[i]][0]);
        //     console.log(prodWastersData[allDates[i]][1]);
        // }
      }
}

function drawDaysWithMostActivity(activityBucket, daysDates) {
    google.charts.load("current", {packages:["calendar"]});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
       var data = new google.visualization.DataTable();
       data.addColumn({ type: 'date', id: 'Date' });
       data.addColumn({ type: 'number', id: 'Hits' });
       data.addRows(daysDates.length);

       for(var i = 0; i < daysDates.length; i++) {
           data.setCell(i, 0, daysDates[i]);
           data.setCell(i, 1, activityBucket[daysDates[i]]);
       }

       var chart = new google.visualization.Calendar(document.getElementById('mostActiveDays'));

       var options = {
            title: "Most Active Days on Interwebs",
            height: 350,
       };

       chart.draw(data, options);
   }
}

function drawMostActiveHours(activityBucket, daysDates) {
    google.charts.load('current', {packages: ['corechart', 'bar']});
    google.charts.setOnLoadCallback(drawTrendlines);

    function drawTrendlines() {
        var data = new google.visualization.DataTable();
        data.addColumn('timeofday', 'Time of Day');
        data.addColumn('number', 'Hits');

        data.addRows([
            [{v: [8, 0, 0], f: '8'}, .25],
            [{v: [9, 0, 0], f: '9'}, .5],
            [{v: [10, 0, 0], f:'10'}, 1],
            [{v: [11, 0, 0], f: '11'}, 2.25],
            [{v: [12, 0, 0], f: '12'}, 2.25],
            [{v: [13, 0, 0], f: '13'}, 3],
            [{v: [14, 0, 0], f: '14'}, 4],
            [{v: [15, 0, 0], f: '15'}, 5.25],
            [{v: [16, 0, 0], f: '16'}, 7.5],
            [{v: [17, 0, 0], f: '17'}, 10],
        ]);

        data.addRows(daysDates.length);

        for(var i = 0; i < daysDates.length; i++) {
            var currentHour = daysDates[i].getHours();
            var currentMinutes = daysDates[i].getMinutes();
            var activity = activityBucket[daysDates[i]];

            if(currentHour >= 7 && currentHour <= 23) {
                data.setCell(i, 0, {v: [currentHour, 0, 0], f: currentHour.toString()});
                data.setCell(i, 1, activity % 10);
            }
        }

        var options = {
            title: 'Activity Level Throughout the Day',
            trendlines: {
                0: {type: 'linear', lineWidth: 5, opacity: .3},
                1: {type: 'exponential', lineWidth: 10, opacity: .3}
            },
            hAxis: {
                title: 'Time of Day',
                format: 'h:mm a',
                viewWindow: {
                    min: [7, 30, 0],
                    max: [23, 30, 0]
                }
            },
            vAxis: {
                title: 'Rating (scale of 1-10)'
            }
        };

        var chart = new google.visualization.ColumnChart(document.getElementById('mostActiveHours'));
        chart.draw(data, options);
    }
}

function getImgData(chartContainer) {
    var chartArea = chartContainer.getElementsByTagName('svg')[0].parentNode;
    var svg = chartArea.innerHTML;
    var doc = chartContainer.ownerDocument;
    var canvas = doc.createElement('canvas');
    canvas.setAttribute('width', chartArea.offsetWidth);
    canvas.setAttribute('height', chartArea.offsetHeight);


    canvas.setAttribute(
        'style',
        'position: absolute; ' +
        'top: ' + (-chartArea.offsetHeight * 2) + 'px;' +
        'left: ' + (-chartArea.offsetWidth * 2) + 'px;');
    doc.body.appendChild(canvas);
    canvg(canvas, svg);
    var imgData = canvas.toDataURL("image/png");
    canvas.parentNode.removeChild(canvas);
    return imgData;
  }
  
  function saveAsImg(chartContainer, wantedID) {
    var imgData = getImgData(chartContainer);

    // window.location = imgData.replace("image/png", "image/octet-stream");
    var anchor = document.getElementById(wantedID);
    anchor.href = imgData;
    anchor.innerHTML = "Save PNG";
  }
  
  function toImg(chartContainer, imgContainer) { 
    var doc = chartContainer.ownerDocument;
    var img = doc.createElement('img');
    img.src = getImgData(chartContainer);
    
    while (imgContainer.firstChild) {
      imgContainer.removeChild(imgContainer.firstChild);
    }
    imgContainer.appendChild(img);
  }


document.addEventListener('DOMContentLoaded', function() {

    var pressButton1 = document.getElementById('piechart_3D_export');
    var pressButton2 = document.getElementById('productivity_export');
    var pressButton3 = document.getElementById('mostActiveDays_export');
    var pressButton4 = document.getElementById('mostActiveHours_export');

    pressButton1.addEventListener('click', function() {
        saveAsImg(document.getElementById('piechart_3D'), 'pie_download');
    });

    pressButton2.addEventListener('click', function() {
        saveAsImg(document.getElementById('productivity'), 'productivity_download');
    });

    pressButton3.addEventListener('click', function() {
        saveAsImg(document.getElementById('mostActiveDays'), 'mostActiveDays_download');
    });

    pressButton4.addEventListener('click', function() {
        saveAsImg(document.getElementById('mostActiveHours'), 'mostActiveHours_download');
    });
});
