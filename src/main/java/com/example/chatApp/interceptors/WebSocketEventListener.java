package com.example.chatApp.interceptors;

import com.example.chatApp.entity.User;
import com.example.chatApp.service.UserService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.AbstractSubProtocolEvent;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.List;

@Component
public class WebSocketEventListener {
    private final SimpMessagingTemplate messagingTemplate;
    private final UserService userService; // Your service with add/remove methods

    public WebSocketEventListener(SimpMessagingTemplate messagingTemplate,
                                  UserService userService) {
        this.messagingTemplate = messagingTemplate;
        this.userService = userService;
    }

    @EventListener
    public void handleWebSocketConnect(SessionConnectedEvent event) {
        String userId = extractUsernameFromEvent(event); // Implement user extraction
        userService.addWebSocketUser(userId);
        broadcastOnlineUsers();
    }

    @EventListener
    public void handleWebSocketDisconnect(SessionDisconnectEvent event) {
        String userId = extractUsernameFromEvent(event);
        userService.handleLogout(userId);
        broadcastOnlineUsers();
    }

    @MessageMapping("/app/requestOnlineUsers")
    private void broadcastOnlineUsers() {
        List<User> connectedUsers = userService.findConnectedUsers();
        messagingTemplate.convertAndSend("/topic/onlineUsers", connectedUsers); // Send updated user list to WebSocket clients
    }


    private String extractUsernameFromEvent(AbstractSubProtocolEvent event) {
        // Extract user ID from authentication principal
        Principal principal = event.getUser();
        return principal != null ? principal.getName() : null;
    }

}
