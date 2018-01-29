function checkDomain(domain) {
    if(domain === "") {
        return false;
    }
    return true;
}

function saveSettings() {
    var textarea = document.getElementById('blockDomains');
    var dailyButton = document.getElementById('daily');
    var weeklyButton = document.getElementById('weekly');
    var monthlyButton = document.getElementById('monthly');
    var alltimeButton = document.getElementById('alltime');

    var text = textarea.value;
    text = text.split('\n');

    var saved = [];
    var option = "";

    if(dailyButton.checked) {
        option = 'daily';
    } else if(weeklyButton.checked) {
        option = 'weekly';
    } else if(monthlyButton.checked) {
        option = 'monthly';
    } else if(alltimeButton.checked) {
        option = 'alltime';
    } else {
        option = 'daily';
    }

    for(var i = 0; i < text.length; i++) {
        if(checkDomain(text[i])) {
            saved.push(text[i]);
        }
    }

    chrome.storage.sync.set({'savedDomains': saved, 'option': option});

    var saveMessage = document.getElementById('saveMessage').innerHTML = "Successfully Saved!";
        
    for(var i = 0; i < saved.length; i++) {
        console.log(saved[i]);
    }
}

function getSettings() {
    var textarea = document.getElementById('blockDomains');

    chrome.storage.sync.get(['savedDomains', 'option'], function(items) {
        var saved = items.savedDomains;
        var option = items.option;

        if(option == null) {
            option = 'daily';
        } else {
            var radioButton = document.getElementById(option);
            radioButton.checked = true;
        }

        for(var i = 0; i < saved.length; i++) {
            console.log(saved[i]);

            textarea.value += (saved[i] + '\n');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    getSettings();

    var pressButton = document.getElementById('saveButton');
    pressButton.addEventListener('click', function() {
        saveSettings();
    });
});
