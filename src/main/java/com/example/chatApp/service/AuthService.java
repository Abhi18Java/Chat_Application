package com.example.chatApp.service;

import com.example.chatApp.dto.LoginDto;
import com.example.chatApp.dto.SignUpDto;
import com.example.chatApp.dto.UserDto;
import com.example.chatApp.entity.Status;
import com.example.chatApp.entity.User;
import com.example.chatApp.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository repository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository repository, ModelMapper modelMapper, PasswordEncoder passwordEncoder, @Lazy AuthenticationManager authenticationManager, JwtService jwtService) {
        this.repository = repository;
        this.modelMapper = modelMapper;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public ResponseEntity<?> signUp(SignUpDto signUpDto) {
        Optional<User> user = repository.findByUserName(signUpDto.getUserName().trim());
        if (user.isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        User toSave = modelMapper.map(signUpDto, User.class);
        toSave.setPassword(passwordEncoder.encode(signUpDto.getPassword()));
        toSave.setStatus(Status.OFFLINE);

        User savedUser = repository.save(toSave);
        return ResponseEntity.ok(modelMapper.map(savedUser, UserDto.class));
    }

    public String login(LoginDto loginDto) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDto.getUserName(), loginDto.getPassword())
            );
        } catch (BadCredentialsException badCredentialsException) {
            return null;
        }
        User user = (User) authentication.getPrincipal();
        return jwtService.generateToken(user);
    }
}
