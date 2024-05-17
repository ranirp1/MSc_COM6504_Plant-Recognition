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

