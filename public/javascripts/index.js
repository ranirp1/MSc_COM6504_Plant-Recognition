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


    // Function to retrieve user data from IndexedDB
    const retrieveUserData = () => {
        const todoIDB = requestIDB.result;
        const transaction = todoIDB.transaction(["user"]);
        const userStore = transaction.objectStore("user");
        const getRequest = userStore.getAll();

        getRequest.addEventListener("success", (event) => {
            const userData = event.target.result;
            const usernames = userData.map(user => user.username);
            console.log("Retrieved user data:", event.target.result);
        });
    };

    // Function to handle plant form submission
    const handlePlantSubmission = (event) => {
        event.preventDefault(); // Prevent default form submission

        // Get form data
        const userName = document.getElementById("userName").value;
        const plantName = document.getElementById("plantName").value;
        const dateTime = document.getElementById("dateTime").value;
        const description = document.getElementById("description").value;
        const location = document.getElementById("location").value;
        const plantHeight = document.getElementById("plantHeight").value;
        const plantWidth = document.getElementById("plantWidth").value;
        const plantSize = `${plantHeight} x ${plantWidth}`;
        const plantColor = document.getElementById("plantColor").value;

        // Validate form data
        if (isValidPlantSubmission(userName, plantName, dateTime, description, location, plantSize, plantColor)) {
            storePlantData(userName, plantName, dateTime, description, location, plantSize, plantColor); // Store plant data in IndexedDB
        }
    };

    // Function to validate plant submission
    const isValidPlantSubmission = (userName, plantName, dateTime, description, location, plantSize, plantColor) => {
        // check if required fields are not empty
        return userName.trim() !== "" && plantName.trim() !== "" && dateTime.trim() !== "" && description.trim() !== "" && location.trim() !== "" && plantSize.trim() !== "" && plantColor.trim() !== "";
    };

    // Function to store plant data in IndexedDB
    const storePlantData = (userName, plantName, dateTime, description, location, plantSize, plantColor) => {
        const todoIDB = requestIDB.result;
        const transaction = todoIDB.transaction(["plants"], "readwrite");
        const plantStore = transaction.objectStore("plants");
        const plantData = { userName, plantName, dateTime, description, location, plantSize, plantColor };
        const addRequest = plantStore.add(plantData);

        addRequest.addEventListener("success", () => {
            console.log("Plant data added successfully");
        });

        addRequest.addEventListener("error", (event) => {
            console.error("Error storing plant data:", event.target.error);
        });
    };

    // Flag to track object store creation
    let objectStoreCreated = false;

    // Function to handle IndexedDB upgrade (if needed)
    const handleUpgrade = (ev) => {
        const db = ev.target.result;
        // Create object store for user data (with auto-incrementing key)
        db.createObjectStore("user", {keyPath: "id", autoIncrement: true});
        // Create object store for plant data
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