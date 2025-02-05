package com.example.chatApp.controller;

import com.example.chatApp.entity.Status;
import com.example.chatApp.entity.User;
import com.example.chatApp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping("/fetch/AllUser")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.findAllUsers());
    }

    @MessageMapping("/user.addUser")
    public String addUser(String username) {
        userService.addWebSocketUser(username);
        return username;
    }

    @MessageMapping("/user.disconnectUser")
    public String disconnectUser(
            String username, Status status
    ) {
        userService.removeWebSocketUser(username,status);
        return username;
    }
}
