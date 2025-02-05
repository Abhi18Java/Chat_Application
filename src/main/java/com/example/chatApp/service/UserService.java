package com.example.chatApp.service;

import com.example.chatApp.entity.Status;
import com.example.chatApp.entity.User;
import com.example.chatApp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    private final Map<String, Integer> activeWsUsers = new ConcurrentHashMap<>();

    // Called when user explicitly logs out via HTTP
    public void handleLogout(String username) {
        User user = repository.findByUserName(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Ensure the user is actually offline in WebSocket
        activeWsUsers.remove(username);

        // Check if they still have active sessions
        if (!activeWsUsers.containsKey(username)) {
            user.setStatus(Status.OFFLINE);
            repository.save(user);
        }
    }


    // WebSocket connection established
    public void addWebSocketUser(String username) {
        activeWsUsers.compute(username, (key, count) -> {
            if (count == null) {
                // First connection: Set status to ONLINE
                User user = repository.findByUserName(username)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                user.setStatus(Status.ONLINE);
                repository.save(user);
                return 1;
            } else {
                return count + 1;
            }
        });
    }

    public synchronized void removeWebSocketUser(String username,Status status) {
        activeWsUsers.computeIfPresent(username, (key, count) -> {
            if (count == 1) {
                User user = repository.findByUserName(username)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                user.setStatus(status);
                repository.save(user);
                return null; // Remove entry
            } else {
                return count - 1;
            }
        });
    }

    public List<User> findConnectedUsers() {
        List<String> usernames = List.copyOf(activeWsUsers.keySet());
        return repository.findAllByUserNameIn(usernames);
    }

    public List<User> findAllUsers() {
        return repository.findAll();
    }

}
