package com.example.chatApp.service;

import com.example.chatApp.entity.ChatRoom;
import com.example.chatApp.repository.ChatRoomRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;

    public ChatRoomService(ChatRoomRepository repository) {
        this.chatRoomRepository = repository;
    }

    public Optional<String> getChatRoomId(String senderId, String recipientId, boolean createNewRoomIfNotExist) {
        return chatRoomRepository.findBySenderIdAndRecipientId(senderId, recipientId).map(ChatRoom::getChatId)
                .or(()-> {
                    if (createNewRoomIfNotExist) {
                        var chatId = createChatId(senderId, recipientId);
                        return Optional.of(chatId);
                    }
                    return Optional.empty();
                });
    }

    public String createChatId(String senderId, String recipientId) {
        var chatId = String.format("%s_%s", senderId, recipientId);

        ChatRoom senderRecipient = new ChatRoom.ChatRoomBuilder()
                .setChatId(chatId)
                .setSenderId(senderId)
                .setRecipientId(recipientId)
                .build();

        ChatRoom recipientSender = new ChatRoom.ChatRoomBuilder()
                .setChatId(chatId)
                .setRecipientId(senderId)
                .setSenderId(recipientId)
                .build();

        chatRoomRepository.save(senderRecipient);
        chatRoomRepository.save(recipientSender);
        return chatId;
    }

}
