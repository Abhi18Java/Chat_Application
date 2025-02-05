package com.example.chatApp.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Otp {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private long id;
    @ManyToOne
    @JoinColumn(name = "user_id",nullable = false)
    private User user;
    private Integer otp;
    private LocalDateTime expirationDate;
    private int status;

    public Otp() {
    }

    public Otp(long id, User user, Integer otp, LocalDateTime expirationDate, int status) {
        this.id = id;
        this.user = user;
        this.otp = otp;
        this.expirationDate = expirationDate;
        this.status = status;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Integer getOtp() {
        return otp;
    }

    public void setOtp(Integer otp) {
        this.otp = otp;
    }

    public LocalDateTime getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(LocalDateTime expirationDate) {
        this.expirationDate = expirationDate;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }
}
