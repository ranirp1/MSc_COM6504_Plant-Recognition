let db;
const openOrCreateDB = window.indexedDB.open('plant-recognition', 1);

openOrCreateDB.addEventListener('error', () => console.error('Error opening DB'));

openOrCreateDB.addEventListener('success', () => {
    console.log('Successfully opened DB');
    db = openOrCreateDB.result;
});

openOrCreateDB.addEventListener('upgradeneeded', init => {
    db = init.target.result;

    db.onerror = () => {
        console.error('Error loading database.');
    };

    const table = db.createObjectStore('plant-recognition', { keyPath: 'id', autoIncrement:true });

    table.createIndex('addplant', 'addplant', { unique: true });
    table.createIndex('plantdetails', 'plantdetails', { unique: true });
});


