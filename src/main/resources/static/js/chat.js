let stompClient = null;
let username = null;
let reconnectAttempts = 0;
let friendList = JSON.parse(localStorage.getItem('friendList')) || [];
let selectedUserId = null;

// Elements
const messageForm = document.querySelector('#messageForm');
const chatMessages = document.querySelector('#chatMessages');
const connectedUsers = document.getElementById('connectedUsers');
const allUsersList = document.getElementById('allUsersList');

document.addEventListener("DOMContentLoaded", () => {
    displayUsername();
    connect();
    updateMainChatList();
});

// ✅ Fix: Open Add Friend Modal and Fetch Users
function openAddFriendModal() {
    document.getElementById('addFriendModal').style.display = 'flex';
    fetchUsers();
}

function closeAddFriendModal() {
    document.getElementById('addFriendModal').style.display = 'none';
}

// ✅ Fix: Fetch Users (Only Add Unique Users)
function fetchUsers() {
    fetch('http://localhost:8080/fetch/AllUser')
        .then(response => response.json())
        .then(users => {
            allUsersList.innerHTML = ''; // Clear list before adding new users

            users.forEach(user => {
                if (user.userName !== username && !friendList.some(friend => friend.userId === user.id)) {
                    const listItem = document.createElement('li');
                    listItem.classList.add('user-item');
                    listItem.dataset.id = user.id;
                    listItem.innerHTML = `
                        <div class="user-info">
                            <img src="img/user_icon.png" alt="${user.userName}" class="user-avatar">
                            <span>${user.userName}</span>
                            <span class="status-circle ${user.online ? 'online' : 'offline'}"></span>
                        </div>
                        <button class="add-btn" onclick="toggleFriendStatus('${user.id}', '${user.userName}', this)">+</button>
                    `;
                    allUsersList.appendChild(listItem);
                }
            });
        })
        .catch(error => console.error('Error fetching users:', error));
}

// ✅ Fix: Add/Remove Friend
function toggleFriendStatus(userId, userName, button) {
    const userIndex = friendList.findIndex(user => user.userId === userId);

    if (userIndex === -1) {
        // Add user to friend list
        friendList.push({ userId, username: userName });
        button.textContent = '-';
    } else {
        // Remove user from friend list
        friendList.splice(userIndex, 1);
        button.textContent = '+';
    }

    updateMainChatList();
    saveFriendList();
}

// ✅ Fix: Update Friends List UI
function updateMainChatList() {
    connectedUsers.innerHTML = '';

    friendList.forEach(user => {
        const listItem = document.createElement('li');
        listItem.classList.add('friend-item');
        listItem.dataset.id = user.userId;
        listItem.innerHTML = `
            <div class="friend-info">
                <img src="img/user_icon.png" alt="${user.username}" class="friend-avatar">
                <span>${user.username}</span>
                <span class="status-circle online"></span>
            </div>
        `;
        listItem.addEventListener('click', () => startChatWithUser(user.userId, user.username));
        connectedUsers.appendChild(listItem);
    });
}

// ✅ Fix: Save Friends to Local Storage
function saveFriendList() {
    localStorage.setItem('friendList', JSON.stringify(friendList));
}

// ✅ Fix: Start Chat When Clicking a Friend
function startChatWithUser(userId, userName) {
    selectedUserId = userId;
    messageForm.classList.remove('hidden');
    document.getElementById('messageInput').placeholder = `Message ${userName}...`;
    fetchMessagesForUser(userId);
}

// ✅ Fix: Send Message
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();

    if (message && stompClient && stompClient.connected) {
        stompClient.send(`/app/chat/${selectedUserId}`, {}, JSON.stringify({
            senderId: username,
            receiverId: selectedUserId,
            content: message
        }));

        displayMessage(username, message);
        messageInput.value = '';
    }
}

// ✅ Fix: Display Messages in Chat
function displayMessage(sender, content) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message', sender === username ? 'sender' : 'receiver');

    const message = document.createElement('p');
    message.textContent = content;
    messageContainer.appendChild(message);

    chatMessages.appendChild(messageContainer);
}

// ✅ Fix: Handle Received Messages
function onMessageReceived(payload) {
    const message = JSON.parse(payload.body);
    if (selectedUserId === message.senderId) {
        displayMessage(message.senderId, message.content);
    }
}

// ✅ Fix: Display Online Status (Simulated)
setInterval(() => {
    document.querySelectorAll('.status-circle').forEach(circle => {
        circle.classList.toggle('online', Math.random() > 0.5); // Simulated online status
    });
}, 5000);
