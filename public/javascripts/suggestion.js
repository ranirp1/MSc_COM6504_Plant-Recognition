const { Toast } = require("bootstrap");

function init() {
    alert("init");
    getSuggestions();
}

function sendSuggestedName() {
    let suggestedName = document.getElementById('plantName').value;

    //get username from indexedDB
    getUsername().then((username) => {
        if (username) {
            name = username;
            console.log("sendSuggestedName");
            // Send the chat message to the server
            socket.emit('suggestions', roomNo, name, suggestedName);
            // Make an HTTP POST request to the server
            fetch(`/plantdetails/${plantID}/suggestions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sender: name,
                    message: suggestedName
                })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to save suggested name');
                    }
                    // Clear the chat input field
                    document.getElementById('plantName').value = '';
                })
                .catch(error => {
                    console.error('Error:', error);
                    // Handle error
                });
        }
    });
}

// function to get suggestions
function getSuggestions() {
    console.log("getSuggestions");
    // Make an HTTP GET request to the server
    fetch(`/plantdetails/${plantID}/suggestions`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch suggestions');
            }
            return response.json();
        })
        .then(suggestions => {
            // Display the suggestions in the UI
            let suggestionsList = document.getElementById('displaySuggestion');
            suggestionsList.innerHTML = '';
            suggestions.forEach(suggestion => {
                let suggestionItem = document.createElement('li');
                suggestionItem.textContent = suggestion.sender + ': ' + suggestion.message;
                suggestionsList.appendChild(suggestionItem);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            // Handle error
        });
}


// function to update the plant name with the suggested name
function updatePlantName(suggestedName) {
    console.log(suggestedName);
    console.log(plantID);
    // Make an HTTP PUT request to the server
    fetch(`/plantdetails/${plantID}/approvesuggestions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            suggestedName: suggestedName
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update plant name');
            }
            // Clear the chat input field
            document.getElementById('plantName').value = '';
            alert("Plant name updated");
        })
        .catch(error => {
            console.error('Error:', error);
            // Handle error
        });
}
