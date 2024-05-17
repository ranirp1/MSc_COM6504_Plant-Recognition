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

    // Function to handle plant details submission
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
        const plantSize = `${plantHeight} x ${plantWidth}`; // Concatenate height and width

        // Validate form data
        if (isValidPlantSubmission(userName, plantName, dateTime, description, location, plantHeight, plantWidth)) {
            // Store plant data in IndexedDB
            storePlantData(userName, plantName, dateTime, description, location, plantSize);
        } else {
            // Display validation error message to the user
            addMessage("Please fill in all required fields.", true);
        }
    };

    // Function to validate plant submission
    const isValidPlantSubmission = (userName, plantName, dateTime, description, location, plantHeight, plantWidth) => {
        // check if required fields are not empty
        return (
            userName.trim() !== "" &&
            plantName.trim() !== "" &&
            dateTime.trim() !== "" &&
            description.trim() !== "" &&
            location.trim() !== "" &&
            plantHeight.trim() !== "" &&
            plantWidth.trim() !== ""
        );
    };

    // Function to store plant data in IndexedDB
    const storePlantData = (userName, plantName, dateTime, description, location, plantSize) => {
        const todoIDB = requestIDB.result;
        const transaction = todoIDB.transaction(["plants"], "readwrite");
        const plantStore = transaction.objectStore("plants");

        // Generate a unique ID for the plant data
        const id = Date.now(); // You can use a timestamp as an example, but ensure uniqueness

        // Create an object to store plant data with the unique ID
        const plantData = {
            id: id,
            userName: userName,
            plantName: plantName,
            dateTime: dateTime,
            description: description,
            location: location,
            plantSize: plantSize
        };

        // Add the plant data to the object store
        const addRequest = plantStore.add(plantData);

        // Handle the success and error events
        addRequest.addEventListener("success", () => {
            console.log("Plant data added successfully");
            // No need to retrieve data here, as it will be triggered by the transaction's "complete" event
        });

        addRequest.addEventListener("error", (event) => {
            console.error("Error storing plant data:", event.target.error);
        });

        // Commit the transaction
        transaction.addEventListener("complete", () => {
            console.log("Transaction completed");
            // Retrieve plant data after the transaction is complete
            retrievePlantData();
        });

        transaction.addEventListener("error", (event) => {
            console.error("Transaction error:", event.target.error);
        });
    };

    const retrievePlantData = () => {
        const todoIDB = requestIDB.result;
        const transaction = todoIDB.transaction(["plants"]);
        const plantStore = transaction.objectStore("plants");
        const getRequest = plantStore.getAll();

        getRequest.onsuccess = function (event) {
            const plantData = event.target.result;
            // Display the plant data on the webpage
            displayPlantData(plantData);
        };

        getRequest.onerror = function (event) {
            console.error("Error retrieving plant data:", event.target.error);
        };
    };

    const displayPlantData = (plantData) => {
        // Assuming there's an element with the id "plantData" to display the data
        const plantDataElement = document.getElementById("plantData");
        if (plantDataElement) {
            // Clear previous data
            plantDataElement.innerHTML = "";
            // Display each plant entry
            plantData.forEach((plant) => {
                const plantEntry = document.createElement("div");
                plantEntry.textContent = `Plant: ${plant.plantName}, Location: ${plant.location}`;
                plantDataElement.appendChild(plantEntry);
            });
        } else {
            console.error("Element to display plant data not found");
        }
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

    // Attach event listener to plant form submit button
    const plantForm = document.getElementById("plantForm");
    plantForm.addEventListener("submit", handlePlantSubmission);



});