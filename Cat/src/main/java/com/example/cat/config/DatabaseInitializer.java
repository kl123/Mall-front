package com.example.cat.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        // 创建数据库（如果不存在）
        jdbcTemplate.execute("CREATE DATABASE IF NOT EXISTS user_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        // 使用数据库
        jdbcTemplate.execute("USE user_db");
        // 创建用户表（如果不存在）
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS user (id INT PRIMARY KEY AUTO_INCREMENT, username VARCHAR(50) NOT NULL UNIQUE, password VARCHAR(50) NOT NULL)");
        // 插入默认测试用户
        jdbcTemplate.execute("INSERT IGNORE INTO user (username, password) VALUES ('test', '123456')");
    }
}