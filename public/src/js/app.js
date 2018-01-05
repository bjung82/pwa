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
    if ('serviceWorker' in navigator){
        var options = {
            body: 'You successfully subscribed to our Notification Service',
            icon: '/src/images/icons/app-icon-96x96.png',
            image: '/src/images/sf-boat.jpg',
            dir: 'ltr',
            lang: 'en-US', // BCP 47
            vibrate: [100,50,200], // Vibration 100ms, Pause 50 ms, Vibration 200ms
            badge: '/src/images/icons/app-icon-96x96.png',
            tag: 'confirm-notification', // stacks notifications of the same tag to prevent flooding the user,
            renotify: true, // vibrate again even if stacked because of same tag
            actions: [
                { action: 'confirm', title: 'Okay', icon: '/src/images/icons/app-icon-96x96.png'},
                { action: 'cancel', title: 'Cancel', icon: '/src/images/icons/app-icon-96x96.png'},
            ]
        };
        navigator.serviceWorker.ready.then(function(swreg){
            swreg.showNotification('Successfully subscribed (from SW)', options);
        });
    }
}

function configurePushSub() {
    if (!('serviceWorker' in navigator)){
        return;
    }

    navigator.serviceWorker.ready
        .then(function(swreg){
            return swreg.pushManager.getSubscription();
        })
        .then(function(sub){
            if (sub === null) {
                // create new subscription
            } else {
                // We have a subscription
            }
        });
}

function askForNotificationPermission() {
    Notification.requestPermission(function(result) {
        if (result !== 'granted') {
            console.log('No notification permission granted');
        } else {
            console.log('Notification permission granted');
            configurePushSub();
            //displayConfirmNotification();
        }
    });
}

if ('Notification' in window && 'serviceWorker' in navigator) {
    for (var i = 0; i < enableNotificationsButtons.length; i++) {
        enableNotificationsButtons[i].style.display = 'inline-block';
        enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
    }
}