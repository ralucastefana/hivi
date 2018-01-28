urlsToDisplay = [];

function onAnchorClick(event) {
    chrome.tabs.create({
        selected: true,
        url: event.srcElement.href
    });

    return false;
}

function buildPopupDom(divName, data) {
    var popupDiv = document.getElementById(divName);

    var recentTitle = document.createElement('h2');
    recentTitle.appendChild(document.createTextNode("Recent Top 10 Links"));
    popupDiv.appendChild(recentTitle);

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

function buildTypedUrlList(divName) {

    searchOptions = {
        'text': '',
        'maxResults': 50
    };

    chrome.history.search(searchOptions, function(historyItems) {
        numberOfPushedItems = 0;

        for(var i = 0; (numberOfPushedItems < 10) && (i < historyItems.length); i++) {
            if ((historyItems[i].url).startsWith("http")) {
                urlsToDisplay.push(historyItems[i].url);
                numberOfPushedItems++;
            }
        }

        buildPopupDom(divName, urlsToDisplay);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    buildTypedUrlList("recentBehaviour");
  });
