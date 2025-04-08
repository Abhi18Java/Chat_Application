package com.example.chatApp.service;

import com.example.chatApp.dto.LoginDto;
import com.example.chatApp.dto.SignUpDto;
import com.example.chatApp.dto.UserDto;
import com.example.chatApp.entity.Otp;
import com.example.chatApp.entity.Status;
import com.example.chatApp.entity.User;
import com.example.chatApp.repository.OtpRepository;
import com.example.chatApp.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository repository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final OtpRepository otpRepository;

    public AuthService(UserRepository repository, ModelMapper modelMapper, PasswordEncoder passwordEncoder, @Lazy AuthenticationManager authenticationManager, JwtService jwtService, EmailService emailService, OtpRepository otpRepository) {
        this.repository = repository;
        this.modelMapper = modelMapper;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.otpRepository = otpRepository;
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

    public ResponseEntity<String> forgetPassword(String email) {
        Optional<User> savedEmail = repository.findByEmail(email);
        if (!savedEmail.isPresent()) {
            return ResponseEntity.badRequest().body("Email Not Found");
        }
        int otp = otpGenerator();
        emailService.sendEmail(email, "Forget Password Otp", otp);
        saveOtp(email, otp);

        return ResponseEntity.status(HttpStatus.OK).body("Otp send on email");
    }

    public void saveOtp(String email, Integer otp) {
        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("USER_NOT_FOUND"));

        Otp saveOtp = new Otp();
        saveOtp.setUser(user);
        saveOtp.setOtp(otp);
        saveOtp.setExpirationDate(LocalDateTime.now().plusMinutes(1000 * 60 * 5)); // 5 min
        saveOtp.setStatus(0);
        otpRepository.save(saveOtp);
    }

    public boolean verifyOtp(Integer otp) {
        Optional<Otp> dbOtp = otpRepository.findByOtp(otp);
        if (!dbOtp.isPresent()) {
            throw new RuntimeException("Invalid Otp");
        }
        Otp userEnteredOtp = dbOtp.get();
        userEnteredOtp.setStatus(1);
        otpRepository.save(userEnteredOtp);
        return true;
    }

    public ResponseEntity<String> resetPassword(Integer otp, String newPassword, String confirmPassword) {
        if (!newPassword.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body("Password not matched");
        }
        Otp retrievedOtp = otpRepository.findByOtp(otp)
                .orElseThrow(() -> new RuntimeException("Invalid otp, Please try again"));

        if (retrievedOtp.getExpirationDate().isBefore(LocalDateTime.now())) {
            otpRepository.delete(retrievedOtp); // Cleanup expired OTP
            return ResponseEntity.badRequest().body("Otp Expired");
        }
        User user = retrievedOtp.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        repository.save(user);
        otpRepository.delete(retrievedOtp);

        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body("Password reset successfully");
    }

    public int otpGenerator() {
        Random random = new Random();
        return random.nextInt(900000) + 100000;
    }

}
