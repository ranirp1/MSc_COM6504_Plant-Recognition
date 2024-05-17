document.addEventListener("DOMContentLoaded", function() {

    // Function to display a welcome message
    const displayWelcomeMessage = (username) => {
        const welcomeElement = document.getElementById("welcome-message");
        if (welcomeElement) {
            welcomeElement.innerText = `Welcome back, ${username}`;
        } else {
            console.error("Welcome message element not found");
        }
    };

    const addMessage = (txt, clear = false, visible = true) => {
        let message = document.getElementById("message");
        let oldTxt = "";
        if (!clear) {
            oldTxt = message.innerHTML + "\n";
        }
        message.innerHTML = oldTxt + txt;
        message.style.display = visible ? 'block' : 'none';
    };

    // Function to check if the username already exists in IndexedDB
    const checkUsernameExists = (username, requestIDB) => {
        const todoIDB = requestIDB.result;
        const transaction = todoIDB.transaction(["user"]);
        const userStore = transaction.objectStore("user");
        const getRequest = userStore.getAll();

        getRequest.addEventListener("success", (event) => {
            const userData = event.target.result;
            const usernames = userData.map(user => user.username);

            // If the username exists, display a welcome message and redirect to the homepage
            if (usernames.includes(username)) {
                displayWelcomeMessage(username);
                setTimeout(() => {
                    window.location.href = "/homepage";
                }, 1000); // Redirect after 1 second
            } else {
                // If the username doesn't exist, store it in IndexedDB and redirect to the homepage
                storeUserData(username, requestIDB);
                window.location.href = "/homepage";
            }
        });
    };

    // Function to handle successful login
    const handleLogin = (event) => {
        event.preventDefault(); // Prevent default form submission

        const username = document.getElementById("username").value;

        // Logic to validate username
        if (isValidLogin(username)) {
            // Check if the username already exists in IndexedDB
            checkUsernameExists(username, requestIDB);
        }
    };

    // Function to validate the username
    const isValidLogin = (username) => {
        return username.trim() !== "";
    };

    // Function to store user data in IndexedDB
    const storeUserData = (username) => {
        const todoIDB = requestIDB.result;
        const transaction = todoIDB.transaction(["user"], "readwrite");
        const userStore = transaction.objectStore("user");

        // Clear existing user data
        const clearRequest = userStore.clear();

        clearRequest.addEventListener("success", () => {
            console.log("User data cleared successfully");

            // Add the new username
            const userData = { username: username };
            const addRequest = userStore.add(userData);

            addRequest.addEventListener("success", () => {
                console.log("User data added successfully");
                retrieveUserData(); // Retrieve data after storing
            });

            addRequest.addEventListener("error", (event) => {
                console.error("Error storing user data:", event.target.error);
            });
        });

        clearRequest.addEventListener("error", (event) => {
            console.error("Error clearing user data:", event.target.error);
        });
    };


    // Function to retrieve user and plant data from IndexedDB
    const retrieveUserData = () => {
        const todoIDB = requestIDB.result;
        const transaction = todoIDB.transaction(["user", "plants"]);
        const userStore = transaction.objectStore("user");
        const getUserRequest = userStore.getAll();

        getUserRequest.addEventListener("success", (event) => {
            const userData = event.target.result;
            const usernames = userData.map(user => user.username);
            console.log("Retrieved user data:", event.target.result);
        });

    };

    // Flag to track object store creation
    let objectStoreCreated = false;

    // Function to handle IndexedDB upgrade (if needed)
    const handleUpgrade = (ev) => {
        const db = ev.target.result;

        // Check if the old version exists and delete it if it does
        if (ev.oldVersion > 0) {
            db.deleteObjectStore("user");
            db.deleteObjectStore("plants");
            addMessage("Deleted previous version of object stores...", false, false);
        }

        // Create object store for user data (with auto-incrementing key)
        db.createObjectStore("user", {keyPath: "id", autoIncrement: true});
        db.createObjectStore("plants", {keyPath: "id", autoIncrement: true});
        objectStoreCreated = true;
        addMessage("Upgraded object store (if necessary)...", false, false);
    };

    // Function to handle success during IndexedDB initialization
    const handleSuccess = () => {
        if (objectStoreCreated) {
            retrieveUserData();
        }
    };

    // Open IndexedDB with the name "plant-recognition"
    const requestIDB = indexedDB.open("plant-recognition");
    requestIDB.addEventListener("upgradeneeded", handleUpgrade);
    requestIDB.addEventListener("success", handleSuccess);
    requestIDB.addEventListener("error", (err) => {
        addMessage("ERROR: " + JSON.stringify(err));
    });

    // Attach event listener to login form submit button
    const loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", handleLogin);

});