var deferredPrompt;
var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if (!window.Promise) {
    window.Promise = Promise;
}

// check if the browser even supports service-workers
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(function () {
            console.log('Service worker registered!');
        })
        .catch(function (err) {
            console.log(err);
        });
}


window.addEventListener('beforeinstallprompt', function (even) {
    console.log("beforeinstallprompt fired");
    event.preventDefault();
    deferredPrompt = event;
    return false;
});

function displayConfirmNotification() {
    var options = {
        body: 'You successfully subscribed to our Notification Service'
    };
    new Notification('Successfully subscribed', options);
}

function askForNotificationPermission() {
    Notification.requestPermission(function(result) {
        if (result !== 'granted') {
            console.log('No notification permission granted');
        } else {
            console.log('Notification permission granted');
            displayConfirmNotification();
        }
    });
}

if ('Notification' in window) {
    for (var i = 0; i < enableNotificationsButtons.length; i++) {
        enableNotificationsButtons[i].style.display = 'inline-block';
        enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
    }
}