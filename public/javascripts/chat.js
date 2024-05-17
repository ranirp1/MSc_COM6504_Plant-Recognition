let name = null;
let roomNo = null;
let socket = io();


/**
 * called by <body onload>
 * it initialises the interface and the expected socket messages
 * plus the associated actions
 */
function init() {
    console.log("plantID",plantID);
    // it sets up the interface so that userId and room are selected
    // document.getElementById('initial_form')
    // document.getElementById('chat_interface').style.display = 'none';

    const chatInterface = document.getElementById('chat_interface');
    const openChatButton = document.getElementById('connect');

openChatButton.addEventListener('click', () => {
  chatInterface.classList.toggle('hidden'); // Toggle hidden class on click
});
  

    // called when someone joins the room. If it is someone else it notifies the joining of the room
    socket.on('joined', function (room, userId) {
        if (userId === name) {
            // it enters the chat
            hideLoginInterface(room, userId);
        } else {
            // notifies that someone has joined the room
           //loop through the chat messages and display the

          writeOnHistory('<b>'+userId+'</b>' + ' joined room ' + room);
        }
    });
    // called when a message is received
    socket.on('chat', function (room, userId, chatText) {
        let who = userId
        if (userId === name) who = 'Me';
        writeOnHistory('<b>' + who + ':</b> ' + chatText);
    });

}
/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via  socket
 */
function sendChatText() {
    let chatText = document.getElementById('chat_input').value;
    if(navigator.onLine){     
    socket.emit('chat', roomNo, name, chatText); 
     // Make an HTTP POST request to the server
     fetch(`/plantdetails/${plantID}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sender: name,
            message: chatText
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save chat message');
        }
        // Clear the chat input field
        document.getElementById('chat_input').value = '';
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle error
    });
    }
    else{
        openSyncChatIDB().then((db) => {
            addNewChatToSync(db, chatText).then(() => {
                console.log("Chat added to IDB")
            })
        });
    }
}

/**
 * used to connect to a room. It gets the user name and room number from the
 * interface
 */
function connectToRoom() {
    getUsername().then((username) => {
        if (username) {
            name = username;
            console.log("connectToRoom");
            roomNo = plantID;
            if (!name) name = 'Unknown-' + Math.random();
            socket.emit('create or join', roomNo, name);        } 
    }
    );

    // console.log("connectToRoom");
    // roomNo = plantID;
    // name = document.getElementById('name').value;
    // if (!name) name = 'Unknown-' + Math.random();
    // socket.emit('create or join', roomNo, name);
}

/**
 * it appends the given html text to the history div
 * @param text: teh text to append
 */
function writeOnHistory(text) {
    let history = document.getElementById('history');
    let paragraph = document.createElement('p');
    paragraph.innerHTML = text;
    history.appendChild(paragraph);
    document.getElementById('chat_input').value = '';
}

/**
 * it hides the initial form and shows the chat
 * @param room the selected room
 * @param userId the user name
 */
function hideLoginInterface(room, userId) {
    document.getElementById('initial_form');
    document.getElementById('chat_interface').style.display = 'block';
    document.getElementById('who_you_are').innerHTML= userId;
    document.getElementById('in_room').innerHTML= ' '+room;
    fetch(`/plantdetails/${plantID}/chat`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to retrieve chat messages');
                    }
                    return response.json();
                })
                .then(chatMessages => {
                    for (const chatMessage of chatMessages) {
                        writeOnHistory('<b>' + chatMessage.sender + ':</b> ' + chatMessage.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    // Handle error
                });
}

window.addEventListener('online', () => {
    alert("You are online. You can now send chat messages.");
    document.getElementById('chat_input').value = '';
    // Send any saved chat messages to mongoDB
    openSyncChatIDB().then((db) => {
        getAllSyncChats(db).then((chats) => {
            for (const chat of chats) {
                fetch(`/plantdetails/${plantID}/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        sender: name,
                        message: chat.text
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to save chat message');
                    }
                    deleteSyncChatFromIDB(db, chat.id);
                })
                .catch(error => {
                    console.error('Error:', error);
                    // Handle error
                });
            }
        });
    });
    console.log('Online');
});

window.addEventListener('offline', () => {
    openSyncChatIDB().then((db) => {
        addNewChatToSync(db, chatText).then(() => {
            console.log("Chat added to IDB")
        })
    });
    alert("You are offline. Your chat messages will be saved and sent when you are back online.");
    console.log('Offline');
});

function closeChat() {
    console.log("close chat button clicked");
    const chatInterface = document.getElementById('chat_interface');
    if (!chatInterface.classList.contains('hidden')) {
        chatInterface.style.display = 'none';
      }
  }

  const getUsername = () => {
    // Open IndexedDB with the name "plant-recognition"
    const requestIDB = indexedDB.open("plant-recognition");
  
    return new Promise((resolve, reject) => {
      requestIDB.addEventListener("success", () => {
        const db = requestIDB.result;
        const transaction = db.transaction(["user"], "readonly");
        const objectStore = transaction.objectStore("user");
        const getRequest = objectStore.getAll();
  
        getRequest.addEventListener("success", (event) => {
          const userData = event.target.result;
          if (userData.length > 0) {
            const username = userData[0].username;
            const userName = document.getElementById('who_you_are');
            if (userName) {
              userName.innerText = username;
            }
            resolve(username);  
          } else {
            resolve(null); 
          }
        });
          getRequest.addEventListener("error", (error) => {
          console.error("Error retrieving username from IndexedDB:", error);
          reject(error);  
        });
      });
  
      requestIDB.addEventListener("error", (error) => {
        console.error("Error opening IndexedDB:", error);
        reject(error);  
      });
    });
  };
