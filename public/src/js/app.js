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
    if (!('serviceWorker' in navigator)) {
      return;
    }
  
    var reg;
    navigator.serviceWorker.ready
      .then(function(swreg) {
        reg = swreg;
        return swreg.pushManager.getSubscription();
      })
      .then(function(sub) {
        if (sub === null) {
          // Create a new subscription
          var vapidPublicKey = 'BANt59DToCSRB31NjuOUzJRTPLMtVuSUTnj7sNmGIPRGRgBFTgYUuKU2q41fLWnh8FHrh4HpNAeyMgTCszqJ7wk';
          var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
          return reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidPublicKey
          });
        } else {
          // We have a subscription
        }
      })
      .then(function(newSub) {
        return fetch('https://pwagram-b105c.firebaseio.com/subscriptions.json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(newSub)
        })
      })
      .then(function(res) {
        if (res.ok) {
          displayConfirmNotification();
        }
      })
      .catch(function(err) {
        console.log(err);
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