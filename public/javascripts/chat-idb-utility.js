const addNewChatToSync = (syncChatIDB, txt_val) => {
    // Retrieve todo text and add it to the IndexedDB

    if (txt_val !== "") {
        const transaction = syncChatIDB.transaction(["sync-chats"], "readwrite")
        const chatStore = transaction.objectStore("sync-chats")
        const addRequest = chatStore.add({text: txt_val})
        addRequest.addEventListener("success", () => {
            console.log("Added " + "#" + addRequest.result + ": " + txt_val)
            const getRequest = chatStore.get(addRequest.result)
            getRequest.addEventListener("success", () => {
                console.log("Found " + JSON.stringify(getRequest.result))
            
            })
        })
    }
}


// Function to get the todo list from the IndexedDB
const getAllSyncChats = (syncChatIDB) => {
    return new Promise((resolve, reject) => {
        const transaction = syncChatIDB.transaction(["sync-chats"]);
        const chatStore = transaction.objectStore("sync-chats");
        const getAllRequest = chatStore.getAll();

        getAllRequest.addEventListener("success", () => {
            resolve(getAllRequest.result);
        });

        getAllRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

const deleteSyncChatFromIDB = (syncChatIDB, id) => {
    const transaction = syncChatIDB.transaction(["sync-chats"], "readwrite")
    const chatStore = transaction.objectStore("sync-chats")
    const deleteRequest = chatStore.delete(id)
    deleteRequest.addEventListener("success", () => {
        console.log("Deleted " + id)
    })
}

function openSyncChatIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("sync-chats", 1);

        request.onerror = function (event) {
            reject(new Error(`Database error: ${event.target}`));
        };

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            db.createObjectStore('sync-chats', {keyPath: 'id', autoIncrement: true});
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            resolve(db);
        };
    });
}