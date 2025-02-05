let stompClient = null;
let username = null;
let reconnectAttempts = 0; // Added to prevent undefined variable

document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    displayUsername();  // Display username based on JWT token
    connect(); // Automatically connect to WebSocket when the chat page loads
});

function setupEventListeners() {
debugger;
    let loginButton = document.querySelector("#loginButton");
    if (loginButton) {
        loginButton.addEventListener("click", connect);
    }

    let logoutButton = document.querySelector("#logout-btn");
    if (logoutButton) {
        logoutButton.addEventListener("click", onLogout);
    }
}
function connect() {
    debugger;

    // Retrieve username from localStorage
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
        console.error("Username is empty or not found in localStorage.");
        window.location.href = "login.html"; // Redirect to login if not found
        return;
    }
    username = storedUsername;

    // Update UI with username
    const usernameDisplay = document.querySelector('#username');
    if (usernameDisplay) {
        usernameDisplay.textContent = username;
    }

    // Ensure SockJS and Stomp are loaded
    if (typeof SockJS === 'undefined' || typeof Stomp === 'undefined') {
        console.error("SockJS or Stomp is not loaded.");
        return;
    }

    // Prevent duplicate connections
    if (stompClient && stompClient.connected) {
        console.warn("Already connected to WebSocket.");
        return;
    }

    // Establish WebSocket Connection
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, onConnected, onError);
}
//
//function onConnected() {
//debugger;
//    console.log("Connected to WebSocket!");
//
//    if (!stompClient) {
//        console.error("stompClient is null");
//        return;
//    }
//
//    // Send user connection event
//    stompClient.send("/user/addUser", {}, JSON.stringify({ username: username }));
//
//    // Subscribe to private messages
//    stompClient.subscribe(`/user/queue/messages`, onMessageReceived);
//
//    // Subscribe to public chat messages
//    stompClient.subscribe(`/topic/public`, onMessageReceived);
//
//  stompClient.subscribe(`/topic/onlineUsers`, (response) => {
//        const users = JSON.parse(response.body);
//        updateOnlineUsers(users);
//    });
//     stompClient.send("/app/requestOnlineUsers", {});
//}


async function onMessageReceived(payload) {
debugger;
    await findAndDisplayConnectedUsers();
    console.log('Message received', payload);
    const message = JSON.parse(payload.body);
    if (selectedUserId && selectedUserId === message.senderId) {
        displayMessage(message.senderId, message.content);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    if (selectedUserId) {
        document.querySelector(`#${selectedUserId}`).classList.add('active');
    } else {
        messageForm.classList.add('hidden');
    }

    const notifiedUser = document.querySelector(`#${message.senderId}`);
    if (notifiedUser && !notifiedUser.classList.contains('active')) {
        const nbrMsg = notifiedUser.querySelector('.nbr-msg');
        nbrMsg.classList.remove('hidden');
        nbrMsg.textContent = '';
    }
}

//



// Function to fetch online users
function onConnected() {
    console.log("Connected to WebSocket!");

    if (!stompClient) {
        console.error("stompClient is null");
        return;
    }

    stompClient.subscribe(`/topic/public`, onMessageReceived);

    stompClient.subscribe(`/user/queue/messages`, onMessageReceived);

    stompClient.subscribe(`/topic/onlineUsers`, (response) => {
        const users = JSON.parse(response.body);
        updateOnlineUsers(users);
    });

    // Request online users update from the server
    stompClient.send("/app/requestOnlineUsers", {});
}


// Function to update online users list dynamically
function updateOnlineUsers(users) {
    const userList = document.getElementById("connectedUsers");
    userList.innerHTML = ""; // Clear existing list

    users.forEach(user => {
        const li = document.createElement("li");
        li.innerHTML = `<img src="img/user_icon.png" class="user-avatar"> ${user.username}`;
        userList.appendChild(li);
    });
}



//function onConnected() {
//    stompClient.subscribe(`/user/${nickname}/queue/messages`, onMessageReceived);
//    stompClient.subscribe(`/user/public`, onMessageReceived);
//
//    // register the connected user
//    stompClient.send("/user.addUser",
//        {},
//        JSON.stringify({nickName: nickname, fullName: fullname, status: 'ONLINE'})
//    );
//    document.querySelector('#connected-user-fullname').textContent = fullname;
//    findAndDisplayConnectedUsers().then();
//}


function disconnect() {
    if (stompClient !== null) {
        stompClient.disconnect(() => {
            console.log("Disconnected from WebSocket");
        }, {});
    }
    toggleChatVisibility(false);
    username = null;
}
//
function onError(error) {
    console.error("WebSocket Error: ", error);
//    reconnectAttempts++;
//    let retryTime = Math.min(5000 * reconnectAttempts, 30000); // Exponential backoff with max 30s
//    console.warn(`Reconnecting in ${retryTime / 1000} seconds...`);

    setTimeout(() => {
        connect();
    }, retryTime);
}
//
//function updateOnlineUsers(users) {
//    debugger;
//    let userList = document.querySelector('#connectedUsers');
//    if (!userList) {
//        console.error("Connected users list not found");
//        return;
//    }
//
//    userList.innerHTML = '';
//
//    users.forEach(user => {
//        let li = document.createElement('li');
//        li.textContent = user.userName;
//        userList.appendChild(li);
//    });
//
//    if (users.length === 0) {
//        userList.innerHTML = '<li>No users online</li>';
//    }
//}

function displayUsername() {
    let token = getCookie("token");
    if (token) {
        try {
            let payload = JSON.parse(atob(token.split(".")[1]));
            username = payload.sub;
            let usernameElement = document.getElementById("username");
            if (usernameElement) {
                usernameElement.textContent = username;
            }
        } catch (error) {
            console.error("Error decoding token:", error);
        }
    } else {
        console.warn("No token found in cookies.");
    }
}

function onLogout() {
    fetch('/login/logout', {
        method: 'POST',
        credentials: 'include' // Ensures cookies are sent with the request
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text || 'Logout failed') });
        }
        return response.text();
    })
    .then(() => {
        // Clear JWT token from cookies
        document.cookie = "token=; Path=/; Max-Age=0;";

        // Clear username from localStorage
        localStorage.removeItem('username');

        // Redirect to login page
        window.location.href = 'index.html';
    })
    .catch(error => {
        // Handle errors
        alert(error.message || 'An error occurred during logout');
    });
}

function getCookie(name) {
    let matches = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}
//
//function fetchOnlineUsers() {
//    if (!stompClient || !stompClient.connected) {
//        console.error("WebSocket is not connected");
//        return;
//    }
//
//    stompClient.send("/app/requestOnlineUsers", {});
//}

function toggleChatVisibility(show) {
    document.querySelector('#usernamePage')?.classList.toggle('hidden', show);
    document.querySelector('#chatPage')?.classList.toggle('hidden', !show);
}



///////////////////////////////////////////////////////
//
//
//'use strict';
//
//const usernamePage = document.querySelector('#username-page');
//const chatPage = document.querySelector('#chat-page');
//const usernameForm = document.querySelector('#usernameForm');
//const messageForm = document.querySelector('#messageForm');
//const messageInput = document.querySelector('#message');
//const connectingElement = document.querySelector('.connecting');
//const chatArea = document.querySelector('#chat-messages');
//const logout = document.querySelector('#logout');
//
//let stompClient = null;
//let nickname = null;
//let fullname = null;
//let selectedUserId = null;
//
//function connect(event) {
//    nickname = document.querySelector('#nickname').value.trim();
//    fullname = document.querySelector('#fullname').value.trim();
//
//    if (nickname && fullname) {
//        usernamePage.classList.add('hidden');
//        chatPage.classList.remove('hidden');
//
//        const socket = new SockJS('/ws');
//        stompClient = Stomp.over(socket);
//
//        stompClient.connect({}, onConnected, onError);
//    }
//    event.preventDefault();
//}
//
//
//function onConnected() {
//    stompClient.subscribe(`/user/${nickname}/queue/messages`, onMessageReceived);
//    stompClient.subscribe(`/user/public`, onMessageReceived);
//
//    // register the connected user
//    stompClient.send("/user.addUser",
//        {},
//        JSON.stringify({nickName: nickname, fullName: fullname, status: 'ONLINE'})
//    );
//    document.querySelector('#connected-user-fullname').textContent = fullname;
//    findAndDisplayConnectedUsers().then();
//}
//
//async function findAndDisplayConnectedUsers() {
//    const connectedUsersResponse = await fetch('/users');
//    let connectedUsers = await connectedUsersResponse.json();
//    connectedUsers = connectedUsers.filter(user => user.nickName !== nickname);
//    const connectedUsersList = document.getElementById('connectedUsers');
//    connectedUsersList.innerHTML = '';
//
//    connectedUsers.forEach(user => {
//        appendUserElement(user, connectedUsersList);
//        if (connectedUsers.indexOf(user) < connectedUsers.length - 1) {
//            const separator = document.createElement('li');
//            separator.classList.add('separator');
//            connectedUsersList.appendChild(separator);
//        }
//    });
//}
//
//function appendUserElement(user, connectedUsersList) {
//    const listItem = document.createElement('li');
//    listItem.classList.add('user-item');
//    listItem.id = user.nickName;
//
//    const userImage = document.createElement('img');
//    userImage.src = '../img/user_icon.png';
//    userImage.alt = user.fullName;
//
//    const usernameSpan = document.createElement('span');
//    usernameSpan.textContent = user.fullName;
//
//    const receivedMsgs = document.createElement('span');
//    receivedMsgs.textContent = '0';
//    receivedMsgs.classList.add('nbr-msg', 'hidden');
//
//    listItem.appendChild(userImage);
//    listItem.appendChild(usernameSpan);
//    listItem.appendChild(receivedMsgs);
//
//    listItem.addEventListener('click', userItemClick);
//
//    connectedUsersList.appendChild(listItem);
//}
//
//function userItemClick(event) {
//    document.querySelectorAll('.user-item').forEach(item => {
//        item.classList.remove('active');
//    });
//    messageForm.classList.remove('hidden');
//
//    const clickedUser = event.currentTarget;
//    clickedUser.classList.add('active');
//
//    selectedUserId = clickedUser.getAttribute('id');
//    fetchAndDisplayUserChat().then();
//
//    const nbrMsg = clickedUser.querySelector('.nbr-msg');
//    nbrMsg.classList.add('hidden');
//    nbrMsg.textContent = '0';
//
//}
//
//function displayMessage(senderId, content) {
//    const messageContainer = document.createElement('div');
//    messageContainer.classList.add('message');
//    if (senderId === nickname) {
//        messageContainer.classList.add('sender');
//    } else {
//        messageContainer.classList.add('receiver');
//    }
//    const message = document.createElement('p');
//    message.textContent = content;
//    messageContainer.appendChild(message);
//    chatArea.appendChild(messageContainer);
//}
//
//async function fetchAndDisplayUserChat() {
//    const userChatResponse = await fetch(`/messages/${nickname}/${selectedUserId}`);
//    const userChat = await userChatResponse.json();
//    chatArea.innerHTML = '';
//    userChat.forEach(chat => {
//        displayMessage(chat.senderId, chat.content);
//    });
//    chatArea.scrollTop = chatArea.scrollHeight;
//}
//
//
//function onError() {
//    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
//    connectingElement.style.color = 'red';
//}
//
//
//function sendMessage(event) {
//    const messageContent = messageInput.value.trim();
//    if (messageContent && stompClient) {
//        const chatMessage = {
//            senderId: nickname,
//            recipientId: selectedUserId,
//            content: messageInput.value.trim(),
//            timestamp: new Date()
//        };
//        stompClient.send("/chat", {}, JSON.stringify(chatMessage));
//        displayMessage(nickname, messageInput.value.trim());
//        messageInput.value = '';
//    }
//    chatArea.scrollTop = chatArea.scrollHeight;
//    event.preventDefault();
//}
//
//
//async function onMessageReceived(payload) {
//
//    await findAndDisplayConnectedUsers();
//    console.log('Message received', payload);
//    const message = JSON.parse(payload.body);
//    if (selectedUserId && selectedUserId === message.senderId) {
//        displayMessage(message.senderId, message.content);
//        chatArea.scrollTop = chatArea.scrollHeight;
//    }
//
//    if (selectedUserId) {
//        document.querySelector(`#${selectedUserId}`).classList.add('active');
//    } else {
//        messageForm.classList.add('hidden');
//    }
//
//    const notifiedUser = document.querySelector(`#${message.senderId}`);
//    if (notifiedUser && !notifiedUser.classList.contains('active')) {
//        const nbrMsg = notifiedUser.querySelector('.nbr-msg');
//        nbrMsg.classList.remove('hidden');
//        nbrMsg.textContent = '';
//    }
//}
//
//usernameForm.addEventListener('submit', connect, true); // step 1
//messageForm.addEventListener('submit', sendMessage, true);
//logout.addEventListener('click', onLogout, true);
//window.onbeforeunload = () => onLogout();
