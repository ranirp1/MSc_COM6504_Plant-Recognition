function sendSuggestedName() {
    let suggestedName = document.getElementById('plantName').value;
  
    socket.emit('suggestion', roomNo, name, suggestedName); 
     // Make an HTTP POST request to the server
     fetch(`/plantdetails/${plantID}/suggestion`, {
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

