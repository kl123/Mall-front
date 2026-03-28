package com.example.cat.service.impl;

import com.example.cat.entity.User;
import com.example.cat.mapper.UserMapper;
import com.example.cat.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Override
    public User login(String username, String password) {
        User user = userMapper.findByUsername(username);
        if (user != null && user.getPassword().equals(password)) {
            return user;
        }
        return null;
    }

    @Override
    public boolean register(String username, String password) {
        User existingUser = userMapper.findByUsername(username);
        if (existingUser != null) {
            return false;
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(password);
        return userMapper.insert(user) > 0;
    }
}