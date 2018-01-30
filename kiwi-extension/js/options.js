function checkDomain(domain) {
    if(domain === "") {
        return false;
    }
    return true;
}

function saveSettings() {
    var textarea = document.getElementById('blockDomains');
    var productivityUrls = document.getElementById('productivityUrls');
    var timeWasters = document.getElementById('timeWasters');

    var dailyButton = document.getElementById('daily');
    var weeklyButton = document.getElementById('weekly');
    var monthlyButton = document.getElementById('monthly');
    var alltimeButton = document.getElementById('alltime');

    var text = textarea.value;
    var productivity = productivityUrls.value;
    var wasters = timeWasters.value;
    
    text = text.split('\n');
    productivity = productivity.split('\n');
    wasters = wasters.split('\n');

    var saved = [];
    var savedProductivity = [];
    var savedWasters = [];

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

    for(var i = 0; i < productivity.length; i++) {
        if(checkDomain(productivity[i])) {
            savedProductivity.push(productivity[i]);
        }
    }

    for(var i = 0; i < wasters.length; i++) {
        if(checkDomain(wasters[i])) {
            savedWasters.push(wasters[i]);
        }
    }

    chrome.storage.sync.set({
        'savedDomains': saved, 
        'option': option, 
        'savedProductivity': savedProductivity, 
        'savedWasters': savedWasters
    });

    var saveMessage = document.getElementById('saveMessage').innerHTML = "Successfully Saved!";
        
    for(var i = 0; i < saved.length; i++) {
        console.log(saved[i]);
    }

    for(var i = 0; i < savedProductivity.length; i++) {
        console.log("prod: " + savedProductivity[i]);
    }

    for(var i = 0; i < savedWasters.length; i++) {
        console.log("wasters: " + savedWasters[i]);
    }
}

function getSettings() {
    var textarea = document.getElementById('blockDomains');
    var productivityUrls = document.getElementById('productivityUrls');
    var timeWasters = document.getElementById('timeWasters');

    chrome.storage.sync.get(['savedDomains', 'option', 'savedProductivity', 'savedWasters'], function(items) {
        var saved = items.savedDomains;
        var option = items.option;
        var savedProductivity = items.savedProductivity;
        var savedWasters = items.savedWasters;

        if(option == null) {
            option = 'daily';
        } else {
            var radioButton = document.getElementById(option);
            radioButton.checked = true;
        }

        for(var i = 0; i < saved.length; i++) {
            textarea.value += (saved[i] + '\n');
        }

        for(var i = 0; i < savedProductivity.length; i++) {
            productivityUrls.value += (savedProductivity[i] + '\n');
        }

        for(var i = 0; i < savedWasters.length; i++) {
            timeWasters.value += (savedWasters[i] + '\n');
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

// var date = new Date();
// var current_hours = date.getHours();
// var current_minutes = date.getMinutes();

// console.log(current_hours.toString() + " " + current_minutes.toString());
