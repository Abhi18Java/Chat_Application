package com.example.chatApp.service;

import com.example.chatApp.entity.ChatMessage;
import com.example.chatApp.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.MessagingException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ChatMessageService {
    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private ChatRoomService chatRoomService;

    public ChatMessage save(ChatMessage chatMessage) {
        var chatId = chatRoomService.getChatRoomId
                        (chatMessage.getSenderId(), chatMessage.getRecipientId(), true)
                .orElseThrow(() -> new MessagingException("No message found"));
        chatMessage.setChatId(chatId);
        chatMessageRepository.save(chatMessage);
        return chatMessage;
    }

    public List<ChatMessage> findChatMessages(String senderId, String recipientId) {
        var chatId = chatRoomService.getChatRoomId(senderId, recipientId, true);
        return chatId.map(chatMessageRepository::findByChatId).orElse(new ArrayList<>());
    }
}
