-- Mật khẩu: demo1234 (BCrypt hash gen sẵn). KHÔNG dùng cho production.
INSERT INTO users (username, email, password, full_name)
VALUES ('demo', 'demo@studyhub.local',
        '$2a$10$Dm6mP3jHkS1J0e3w0w8m8u3y2j2yQqv3sH0a3o0gT4mC4l9rT2qHO',
        N'Demo Student');
