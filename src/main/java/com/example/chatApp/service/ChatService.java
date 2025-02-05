package com.example.chatApp.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class ChatService {
    private final SimpMessagingTemplate messagingTemplate;

    public ChatService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendPrivateMessage(String recipientUsername, String message) {
        messagingTemplate.convertAndSendToUser(recipientUsername, "/queue/messages", message);
    }
}
