
CREATE TABLE IF NOT EXISTS users (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS friends (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_friends_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends (user_id);

CREATE TABLE IF NOT EXISTS chatrooms (
  chat_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sender_id INT NOT NULL,
  reciever_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chatrooms_sender
    FOREIGN KEY (sender_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_chatrooms_reciever
    FOREIGN KEY (reciever_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_chatrooms_sender_id ON chatrooms (sender_id);
CREATE INDEX IF NOT EXISTS idx_chatrooms_reciever_id ON chatrooms (reciever_id);
CREATE INDEX IF NOT EXISTS idx_chatrooms_pair ON chatrooms (sender_id, reciever_id);

CREATE TABLE IF NOT EXISTS messages (
  message_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chat_id INT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_messages_chatroom
    FOREIGN KEY (chat_id) REFERENCES chatrooms(chat_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages (chat_id);

CREATE TABLE IF NOT EXISTS stories (
  story_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) DEFAULT NULL,
  body TEXT DEFAULT NULL,
  media_url VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_stories_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories (user_id);

CREATE TABLE IF NOT EXISTS likes (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  story_id INT NOT NULL,
  liker_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_likes_story_liker UNIQUE (story_id, liker_id),
  CONSTRAINT fk_likes_story
    FOREIGN KEY (story_id) REFERENCES stories(story_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_likes_liker
    FOREIGN KEY (liker_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_likes_story_id ON likes (story_id);
CREATE INDEX IF NOT EXISTS idx_likes_liker_id ON likes (liker_id);

CREATE TABLE IF NOT EXISTS comments (
  comment_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id INT NOT NULL,
  commenter_id INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comments_story
    FOREIGN KEY (post_id) REFERENCES stories(story_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_comments_commenter
    FOREIGN KEY (commenter_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments (post_id);
CREATE INDEX IF NOT EXISTS idx_comments_commenter_id ON comments (commenter_id);