function checkDomain(domain) {
    if(domain === "") {
        return false;
    }
    return true;
}

function saveDomains() {
    var textarea = document.getElementById('blockDomains');

    var text = textarea.value;
    text = text.split('\n');

    var saved = []

    for(var i = 0; i < text.length; i++) {
        if(checkDomain(text[i])) {
            saved.push(text[i]);
        }
    }

    chrome.storage.sync.set({'savedDomains': saved});

    var saveMessage = document.getElementById('saveMessage').innerHTML = "Successfully Saved!";
        
    for(var i = 0; i < saved.length; i++) {
        console.log(saved[i]);
    }
}

function getDomains() {
    var textarea = document.getElementById('blockDomains');

    chrome.storage.sync.get('savedDomains', function(items) {
        var saved = items.savedDomains;

        for(var i = 0; i < saved.length; i++) {
            console.log(saved[i]);

            textarea.value += (saved[i] + '\n');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    getDomains();

    var pressButton = document.getElementById('saveButton');
    pressButton.addEventListener('click', function() {
        saveDomains();
    });
});
