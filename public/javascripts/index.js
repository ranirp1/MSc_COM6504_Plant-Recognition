document.addEventListener("DOMContentLoaded", function() {

    // Function to display user profile circle with username initials
        const displayUserProfile = (username) => {
            const userProfile = document.getElementById("userProfile");
            if (userProfile) {
                const profileCircle = document.createElement("div");
                profileCircle.classList.add("profile-circle");

                // Displaying first two letters of username as initials
                const initials = username.substring(0, 2).toUpperCase();
                profileCircle.innerText = initials;

                userProfile.appendChild(profileCircle);
            } else {
                console.error("User profile element not found");
            }
        };

    // Function to retrieve username from IndexedDB
        const retrieveUsername = () => {
            const dbName = "plant-recognition";
            const request = indexedDB.open(dbName);

            request.onerror = function(event) {
                console.error("Database error: " + event.target.errorCode);
            };

            request.onsuccess = function(event) {
                const db = event.target.result;
                const transaction = db.transaction(["user"], "readonly"); // Ensure the object store name matches exactly
                const objectStore = transaction.objectStore("user");

                // Open a cursor to iterate through all entries in the object store
                const cursorRequest = objectStore.openCursor();

                cursorRequest.onsuccess = function(event) {
                    const cursor = event.target.result;
                    if (cursor) {
                     const userData = cursor.value;
                        const username = userData.username;
                        displayUserProfile(username);
                        cursor.continue(); // Move to the next entry
                    } else {
                        console.log("Username retrieval complete.");
                    }
                };

                cursorRequest.onerror = function(event) {
                    console.error("Error retrieving usernames from IndexedDB: ", event.target.error);
                };
            };

            request.onupgradeneeded = function(event) {
                console.log("Database upgrade needed.");
            };
         };

        retrieveUsername();


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

    // Function to handle successful login
    const handleLogin = (event) => {
        event.preventDefault(); // Prevent default form submission

        const username = document.getElementById("username").value;

        // Logic to validate username
        if (isValidLogin(username)) {
            // Check if the username already exists in IndexedDB
            checkUsernameExists(username);
        }
    };

    // Function to check if the username already exists in IndexedDB
    const checkUsernameExists = (username) => {
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
                storeUserData(username);
                window.location.href = "/homepage";
            }
        });
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

    // Function to handle plant details submission
    const handlePlantSubmission = (event) => {
        event.preventDefault(); // Prevent default form submission

        // Get form data
        const plantName = document.getElementById("plantName").value;
        const description = document.getElementById("description").value;
        const location = document.getElementById("location").value;

        // Validate form data
        if (isValidPlantSubmission(plantName, description, location)) {
            // Store plant data in IndexedDB
            storePlantData(plantName, description, location);
        }
    };

    // Function to validate plant submission
    const isValidPlantSubmission = (plantName, description, location) => {
        // check if required fields are not empty
        return plantName.trim() !== "" && description.trim() !== "" && location.trim() !== "";
    };

    // Function to store plant data in IndexedDB
    const storePlantData = (plantName, description, location) => {
        const todoIDB = requestIDB.result;
        const transaction = todoIDB.transaction(["plants"], "readwrite");
        const plantStore = transaction.objectStore("plants");

        // Add the new plant details
        const plantData = { plantName: plantName, description: description, location: location };
        const addRequest = plantStore.add(plantData);

        addRequest.addEventListener("success", () => {
            console.log("Plant data added successfully");
            retrieveUserData(); // Retrieve data after storing
        });

        addRequest.addEventListener("error", (event) => {
            console.error("Error storing plant data:", event.target.error);
        });
    };

    // Function to retrieve user and plant data from IndexedDB
    const retrieveUserData = () => {
        const todoIDB = requestIDB.result;
        const transaction = todoIDB.transaction(["user", "plants"]);
        const userStore = transaction.objectStore("user");
        const plantStore = transaction.objectStore("plants");

        const getUserRequest = userStore.getAll();
        const getPlantRequest = plantStore.getAll();

        getUserRequest.addEventListener("success", (event) => {
            const userData = event.target.result;
            const usernames = userData.map(user => user.username);
            console.log("Retrieved user data:", event.target.result);
        });

        getPlantRequest.addEventListener("success", (event) => {
            const plantData = event.target.result;
            console.log("Retrieved plant data:", plantData);
        });
    };

    // Flag to track object store creation
    let objectStoreCreated = false;

    // Function to handle IndexedDB upgrade (if needed)
    const handleUpgrade = (ev) => {
        const db = ev.target.result;
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

    // Attach event listener to plant form submit button
    const plantForm = document.getElementById("plantForm");
    plantForm.addEventListener("submit", handlePlantSubmission);

});