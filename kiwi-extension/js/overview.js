chrome.history.search({text: '', maxResults: 25}, function(data) {
    data.forEach(function(page) {
        console.log(page.url);
    });
});
