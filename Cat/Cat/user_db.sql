-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS cs_2025_56 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE cs_2025_56;

-- 创建用户表（如果不存在）
CREATE TABLE IF NOT EXISTS user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL
);

-- 插入默认测试用户
INSERT IGNORE INTO user (username, password) VALUES ('test', '123456');

-- 查看创建的表结构
DESCRIBE user;

-- 查看插入的数据
SELECT * FROM user;