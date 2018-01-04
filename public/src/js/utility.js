var dbPromise = idb.open('posts-store', 1, function(db) {
    if (!db.objectStoreNames.contains('posts')){
        db.createObjectStore('posts', {keyPath: 'id'});
    }
});

function writeDate(store, data) {
    return dbPromise.then(function(db) {
        var tx = db.transaction(store, 'readwrite');
        var store = tx.objectStore(store);
        store.put(data);
        return tx.complete;
    });
}