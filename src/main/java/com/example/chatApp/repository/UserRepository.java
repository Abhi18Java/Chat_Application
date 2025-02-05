package com.example.chatApp.repository;

import com.example.chatApp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    @Query("SELECT u FROM User u WHERE u.userName IN :usernames")
    List<User> findAllByUserNameIn(@Param("usernames") List<String> usernames);
    Optional<User> findByUserName(String userName);
    Optional<User> findByEmail(String email);
}
