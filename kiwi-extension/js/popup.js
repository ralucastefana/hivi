// Sends you to the specified URL in the popup
function onAnchorClick(event) {
    chrome.tabs.create({
        selected: true,
        url: event.srcElement.href
    });

    return false;
}

function buildPopupDom(divName, data) {
    var popupDiv = document.getElementById(divName);

    var ul = document.createElement('ul');
    popupDiv.appendChild(ul);

    var ie = data.length;

    for (var i = 0; i < ie; i++) {
        var a = document.createElement('a');
        a.href = data[i];
        a.appendChild(document.createTextNode(data[i]));
        a.addEventListener('click', onAnchorClick);

        var li = document.createElement('li');
        li.appendChild(a);

        ul.appendChild(li);
    }
}

var urlToDisplay = [];

function buildTypedUrlList(divName) {

    chrome.history.search({
        'text': '',
        'maxResults': 20
    },
    function(historyItems) {
        for (var i = 0; i < historyItems.length; i++) {
            var url = historyItems[i].url;

            urlToDisplay.push(url);
        }
    });
}
