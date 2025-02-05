package com.example.chatApp.interceptors;

import jakarta.websocket.*;
import jakarta.websocket.server.ServerEndpoint;
import org.springframework.boot.actuate.web.exchanges.HttpExchange;

@ServerEndpoint("/ws")
public class WebSocketServer {

    @OnOpen
    public void onOpen(HttpExchange.Session session) {
        System.out.println("New connection: " + session.getId());
    }

    @OnMessage
    public String onMessage(String message, HttpExchange.Session session) {
        System.out.println("Message from client: " + message);
        // Respond with a message to the client
        return "Hello, Client! You said: " + message;
    }

    @OnClose
    public void onClose(Session session) {
        System.out.println("Closed connection: " + session.getId());
    }

    @OnError
    public void onError(Throwable error) {
        System.out.println("Error occurred: " + error.getMessage());
    }

}
