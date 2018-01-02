var deferredPrompt;

// check if the browser even supports service-workers
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
    .then(function() {
        console.log('Service worker registered!');
    });
}

window.addEventListener('beforeinstallprompt', function(even) {
    console.log("beforeinstallprompt fired");
    event.preventDefault();
    deferredPrompt = event;
    return false;
});