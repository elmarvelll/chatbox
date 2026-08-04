-- MySQL schema inferred from the app's queries in index.js
-- Database: chatbox

CREATE DATABASE IF NOT EXISTS chatbox
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE chatbox;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS friends (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_friends_user_id (user_id),
  CONSTRAINT fk_friends_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS chatrooms (
  chat_id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  reciever_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_chatrooms_sender_id (sender_id),
  KEY idx_chatrooms_reciever_id (reciever_id),
  KEY idx_chatrooms_pair (sender_id, reciever_id),
  CONSTRAINT fk_chatrooms_sender
    FOREIGN KEY (sender_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_chatrooms_reciever
    FOREIGN KEY (reciever_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS messages (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  chat_id INT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_messages_chat_id (chat_id),
  CONSTRAINT fk_messages_chatroom
    FOREIGN KEY (chat_id) REFERENCES chatrooms(chat_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS stories (
  story_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) DEFAULT NULL,
  body TEXT DEFAULT NULL,
  media_url VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_stories_user_id (user_id),
  CONSTRAINT fk_stories_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  story_id INT NOT NULL,
  liker_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_likes_story_id (story_id),
  KEY idx_likes_liker_id (liker_id),
  UNIQUE KEY uq_likes_story_liker (story_id, liker_id),
  CONSTRAINT fk_likes_story
    FOREIGN KEY (story_id) REFERENCES stories(story_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_likes_liker
    FOREIGN KEY (liker_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS comments (
  comment_id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  commenter_id INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_comments_post_id (post_id),
  KEY idx_comments_commenter_id (commenter_id),
  CONSTRAINT fk_comments_story
    FOREIGN KEY (post_id) REFERENCES stories(story_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_comments_commenter
    FOREIGN KEY (commenter_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;