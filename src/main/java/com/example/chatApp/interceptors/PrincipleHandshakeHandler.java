package com.example.chatApp.interceptors;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

@Component
public class PrincipleHandshakeHandler extends DefaultHandshakeHandler {

    @Override
    protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler, Map<String, Object> attributes) {
        // Get username from handshake attributes (set in JwtHandshakeInterceptor)
        String username = (String) attributes.get("user");

        if (username != null) {
            return () -> username; // Simple Principal implementation
        }

        return null; // Will reject connection if no principal
    }

}
