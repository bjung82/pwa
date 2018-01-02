// check if the browser even supports service-workers
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
    .then(function() {
        console.log('Service worker registered!');
    });
}
