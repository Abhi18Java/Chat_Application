package com.example.chatApp.handler;

import com.example.chatApp.entity.User;
import com.example.chatApp.service.JwtService;
import com.example.chatApp.service.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Value("${deploy.env}")
    private String deployEnv;

    private final UserService userService;
    private final JwtService jwtService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {

        OAuth2AuthenticationToken oAuth2AuthenticationToken = (OAuth2AuthenticationToken) authentication;

        DefaultOAuth2User defaultOAuth2User = (DefaultOAuth2User) oAuth2AuthenticationToken.getPrincipal();

        String email = defaultOAuth2User.getAttribute("email");

        /**
         * Check if the user is still present
         * If, user is coming for the first time we will create a new user
         */

        User user = userService.findByEmail(email);

        if (user == null) {  //created new User if not exist
            User createdUser = User.builder()
                    .userName(defaultOAuth2User.getAttribute("name"))
                    .email(email)
                    .build();
            user = userService.save(createdUser);
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure("production".equals(deployEnv));
        response.addCookie(cookie);

        String frontEndUrl = "http://localhost:8085/home.html?token=" + accessToken;

        getRedirectStrategy().sendRedirect(request, response, frontEndUrl);
    }
}
