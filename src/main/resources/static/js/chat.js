let stompClient = null;
let username = null;
let reconnectAttempts = 0;
let friendList = JSON.parse(localStorage.getItem('friendList')) || [];
let selectedUserId = null;

const messageForm = document.querySelector('#messageForm');  // Define message form
const chatMessages = document.querySelector('#chatMessages'); // The chat messages container

document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    displayUsername();
    connect();
});

function setupEventListeners() {
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

    if (typeof SockJS === 'undefined' || typeof Stomp === 'undefined') {
        console.error("SockJS or Stomp is not loaded.");
        return;
    }

    if (stompClient && stompClient.connected) {
        console.warn("Already connected to WebSocket.");
        return;
    }

    const socket = new SockJS('/ws'); // Establish WebSocket connection
    stompClient = Stomp.over(socket);

    // Establish connection and set up WebSocket event listeners
    stompClient.connect({}, onConnected, onError);
}

function onConnected() {
    console.log("Connected to WebSocket successfully.");

    // Subscribe to a topic after connecting (e.g., a user-specific topic)
    stompClient.subscribe(`/topic/messages/${username}`, onMessageReceived);

    // Send a welcome message or some initial data to the server
    stompClient.send("/app/hello", {}, JSON.stringify({ message: `Hello ${username}` }));

    // Enable UI for messaging once connected
    messageForm.classList.remove('hidden');
}

function onError(error) {
    console.error("WebSocket Error: ", error);
    reconnectAttempts++;

    // Retry connection after a delay (based on retry count)
    setTimeout(() => {
        if (reconnectAttempts < 5) {
            connect(); // Try reconnecting after a short delay
        } else {
            alert("Failed to reconnect after multiple attempts.");
        }
    }, reconnectAttempts * 1000); // Exponential backoff
}

function openAddFriendModal() {
    document.getElementById('addFriendModal').style.display = 'flex';
    fetchUsers(); // Fetch users when the modal is opened
}

function closeAddFriendModal() {
    document.getElementById('addFriendModal').style.display = 'none';
}

function fetchUsers() {
    fetch('http://localhost:8080/fetch/AllUser')
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data)) {
                const usersList = document.getElementById('allUsersList');
                usersList.innerHTML = ''; // Clear existing users

                const filteredUsers = data.filter(user => user.userName !== username);

                filteredUsers.forEach(user => {
                    const listItem = document.createElement('li');
                    listItem.classList.add('user-item');
                    listItem.dataset.id = user.id; // Store user ID for actions
                    listItem.innerHTML = `
                        <div class="user-info">
                            <img src="img/user_icon.png" alt="${user.userName}" class="user-avatar">
                            <span>${user.userName}</span>
                        </div>
                        <button class="add-btn" onclick="toggleFriendStatus('${user.id}', this)">+</button>
                    `;
                    listItem.addEventListener('click', userItemClick);
                    usersList.appendChild(listItem);
                });
            } else {
                console.error('User data is not in the expected format:', data);
            }
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });
}

function toggleFriendStatus(userId, button) {
    const isAlreadyAdded = button.textContent === '-';
    const username = button.parentElement.querySelector('span').textContent;
    const avatarUrl = button.parentElement.querySelector('.user-avatar').src;

    if (isAlreadyAdded) {
        // If the button is '-' (user is added), change it back to '+'
        button.textContent = '+';
        removeUserFromFriendList(userId);
    } else {
        // If the button is '+' (user is not added), change it to '-'
        button.textContent = '-';
        addUserToFriendList(userId, username, avatarUrl);
    }
}

function addUserToFriendList(userId, username, avatarUrl) {
    const newUser = { userId, username, avatarUrl };
    friendList.push(newUser);
    updateMainChatList();
    saveFriendList();
}

function removeUserFromFriendList(userId) {
    friendList = friendList.filter(user => user.userId !== userId);
    updateMainChatList();
    saveFriendList();
}

function updateMainChatList() {
    const connectedUsers = document.getElementById('connectedUsers');
    connectedUsers.innerHTML = ''; // Clear the current chat list

    // Loop through each added friend and display them on the main chat page
    friendList.forEach(user => {
        const listItem = document.createElement('li');
        listItem.classList.add('friend-item');
        listItem.dataset.id = user.userId;
        listItem.innerHTML = `
            <div class="friend-info">
                <img src="${user.avatarUrl}" alt="${user.username}" class="friend-avatar">
                <span class="friend-avtar-username">${user.username}</span>
            </div>
        `;
        listItem.addEventListener('click', userItemClick); // Add click listener to activate user
        connectedUsers.appendChild(listItem);
    });
}

function saveFriendList() {
    localStorage.setItem('friendList', JSON.stringify(friendList));
}

// When a user is clicked to start chatting
function userItemClick(event) {
    if (!messageForm) {
        console.error("messageForm is not defined!");
        return;
    }

    // Deactivate all users
    document.querySelectorAll('.friend-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show the message form and activate the clicked user
    messageForm.classList.remove('hidden');
    const clickedUser = event.currentTarget;
    clickedUser.classList.add('active');

    selectedUserId = clickedUser.dataset.id; // Get the selected user's ID
    fetchMessagesForUser(selectedUserId); // Fetch messages for the selected user

    // Hide any unread message notifications
    const nbrMsg = clickedUser.querySelector('.nbr-msg');
    if (nbrMsg) {
        nbrMsg.classList.add('hidden');
        nbrMsg.textContent = '0';
    }
}

// Fetch messages for a specific user (you should implement the actual message retrieval)
function fetchMessagesForUser(userId) {
    // You need to implement the logic for fetching messages from the server or WebSocket for the user
    console.log("Fetching messages for user with ID:", userId);
}

function displayMessage(senderId, content) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message');
    if (senderId === username) {
        messageContainer.classList.add('sender');
    } else {
        messageContainer.classList.add('receiver');
    }

    const message = document.createElement('p');
    message.textContent = content;
    messageContainer.appendChild(message);
    chatMessages.appendChild(messageContainer);
}

// WebSocket message handling
function onMessageReceived(payload) {
    const message = JSON.parse(payload.body);

    // Check if the message is for the selected user
    if (selectedUserId && selectedUserId === message.senderId) {
        displayMessage(message.senderId, message.content);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the latest message
    }

    // If the message is for another user, update the unread message count
    if (selectedUserId) {
        const notifiedUser = document.querySelector(`#${selectedUserId}`);
        if (notifiedUser && !notifiedUser.classList.contains('active')) {
            const nbrMsg = notifiedUser.querySelector('.nbr-msg');
            if (nbrMsg) {
                nbrMsg.classList.remove('hidden');
                nbrMsg.textContent = ''; // Update unread message count (you can add logic to count the messages)
            }
        }
    }
}

function onError(error) {
    console.error("WebSocket Error: ", error);
    setTimeout(() => {
        connect(); // Try reconnecting after a short delay
    }, reconnectAttempts * 1000);
}

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
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text || 'Logout failed') });
        }
        return response.text();
    })
    .then(() => {
        document.cookie = "token=; Path=/; Max-Age=0;"; // Clear token
        alert('Logged out successfully!');
        localStorage.removeItem('username');
        window.location.href = 'index.html'; // Redirect after logout
    })
    .catch(error => {
        alert(error.message || 'An error occurred during logout');
    });
}

function getCookie(name) {
    let matches = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}
