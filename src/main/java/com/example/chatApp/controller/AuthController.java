package com.example.chatApp.controller;

import com.example.chatApp.dto.LoginDto;
import com.example.chatApp.dto.LoginResponseDto;
import com.example.chatApp.dto.SignUpDto;
import com.example.chatApp.service.AuthService;
import com.example.chatApp.service.JwtService;
import com.example.chatApp.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(AuthService authService, UserService userService, JwtService jwtService) {
        this.authService = authService;
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/signUp")
    public ResponseEntity<?> signUp(@RequestBody SignUpDto signUpDto) {
        return authService.signUp(signUpDto);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginDto loginDto,
                                                  HttpServletResponse response) {
        LoginResponseDto loginResponseDto = authService.login(loginDto);

        userService.addWebSocketUser(loginDto.getUserName());

        Cookie cookie = new Cookie("token", loginResponseDto.getRefreshToken());
        cookie.setHttpOnly(false);
        cookie.setPath("/");
        cookie.setMaxAge(2 * 24 * 60 * 60);
        response.addCookie(cookie);

        return ResponseEntity.ok(loginResponseDto);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDto> refresh(HttpServletRequest request) {
        String refreshToken = Arrays.stream(request.getCookies())
                .filter(cookie -> "refreshToken".equals(cookie.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElseThrow(()-> new RuntimeException("No refresh token found in the cookie"));

        LoginResponseDto loginResponseDto = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(loginResponseDto);
    }

    @PostMapping("/login/logout")
    public ResponseEntity<String> logout(@CookieValue(name = "token", required = false) String token) {
        if (token != null) {
            String username = jwtService.extractUsername(token);
            userService.handleLogout(username);
        }
        return ResponseEntity.ok("Logged out");
    }

    @PostMapping("/forgetPassword/sendOtp")
    public ResponseEntity<?> forgetPassword(@RequestParam String email) {
        return authService.forgetPassword(email);
    }

    @PostMapping("/verifyOtp")
    public ResponseEntity<String> verifyOtp(@RequestParam Integer Otp) {
        boolean verified = authService.verifyOtp(Otp);
        if (!verified) {
            return ResponseEntity.badRequest().body("Invalid otp");
        }
        return ResponseEntity.ok().body("Otp Verified");
    }

    @PostMapping("/resetPassword")
    public ResponseEntity<String> resetPassword(@RequestParam Integer otp, String newPassword, String confirmPassword) {
        return authService.resetPassword(otp, newPassword, confirmPassword);
    }
}
