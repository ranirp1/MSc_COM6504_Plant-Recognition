const DB_NAME = 'plant recognition';

// Function to open the IndexedDB database
function openDatabase()
{
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1); // Version number can be incremented for schema changes

        request.onerror = (event) => {
            console.error('Error opening database:', event.error);
            reject(event.error);
        };

        request.onsuccess = (event) => {
            console.log('Database opened successfully!');
            resolve(event.target.result);
        };
    });
}

async function addUser(name) {
    try {
        const db = await openDatabase();
        const transaction = db.transaction('users', 'readwrite'); // Specify object store and access mode
        const objectStore = transaction.objectStore('users');

        // Check for existing user
        const existingUserRequest = objectStore.get(1); // Assuming ID 1 for the user
        existingUserRequest.onsuccess = (event) => {
            const existingUser = event.target.result;
            if (existingUser) {
                console.log('User already exists:', existingUser);
            }
        };

        // Generate a unique user ID (consider using a stronger method)
        let userID;
        do {
            userID = Math.floor(Math.random() * 1000000); // Replace with a more robust ID generation
        } while (await checkUserIDExists(userID, objectStore)); // Ensure unique ID

        const addUserRequest = objectStore.add({ id: 1, name: name, userID });
        addUserRequest.onsuccess = (event) => {
            console.log('Username and User ID added:', name, userID);
            // Store session details using the generated userID (covered later)
        };

        addUserRequest.onerror = (event) => {
            console.error('Error adding user:', event.error);
            // Handle errors during data addition
        };

        await transaction.complete;
        console.log('Transaction completed successfully');
    } catch (error) {
        console.error('Error:', error);
    }
}




module.exports = openDatabase;

