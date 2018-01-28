
searchOptions = {
    text: '',
    maxResults: 30
};

chrome.history.search(searchOptions, function(data) {
    data.forEach(function(page) {
        if ((page.url).startsWith("http")) {
            console.log(page.url);
        }
    });
});
