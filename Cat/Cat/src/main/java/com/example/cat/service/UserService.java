package com.example.cat.service;

import com.example.cat.entity.User;

public interface UserService {
    User login(String username, String password);
    boolean register(String username, String password);
}