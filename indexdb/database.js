// database.js

const DB_NAME = 'msc11-plant-recognition';
const DB_VERSION = 1;

let db;

function initDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = function(event) {
            reject('Database error: ' + event.target.error);
        };

        request.onsuccess = function(event) {
            db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = function(event) {
            db = event.target.result;
            db.createObjectStore('plants', { keyPath: 'id', autoIncrement: true });
            db.createObjectStore('chatmessages', { keyPath: 'id', autoIncrement: true });
        };
    });
}

export { initDatabase, db };
