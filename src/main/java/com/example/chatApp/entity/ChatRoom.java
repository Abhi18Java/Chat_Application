package com.example.chatApp.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String chatId;
    private String senderId;
    private String recipientId;

    public ChatRoom() {
    }

    public ChatRoom(ChatRoomBuilder chatRoomBuilder) {
        this.id=chatRoomBuilder.id;
        this.chatId=chatRoomBuilder.chatId;
        this.senderId=chatRoomBuilder.senderId;
        this.recipientId=chatRoomBuilder.recipientId;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getChatId() {
        return chatId;
    }

    public void setChatId(String chatId) {
        this.chatId = chatId;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(String recipientId) {
        this.recipientId = recipientId;
    }

    public static class ChatRoomBuilder {
        private Integer id;
        private String chatId;
        private String senderId;
        private String recipientId;

        public ChatRoomBuilder setId(Integer id) {
            this.id = id;
            return this;
        }

        public ChatRoomBuilder setChatId(String chatId) {
            this.chatId = chatId;
            return this;
        }

        public ChatRoomBuilder setSenderId(String senderId) {
            this.senderId = senderId;
            return this;
        }

        public ChatRoomBuilder setRecipientId(String recipientId) {
            this.recipientId = recipientId;
            return this;
        }

        public ChatRoom build() {
            return new ChatRoom(this);
        }

    }

}
