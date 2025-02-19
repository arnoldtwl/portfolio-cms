-- Authors Table
CREATE TABLE Authors (
    author_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    bio TEXT,
    social_media_links TEXT
);

-- Add unique constraint to Authors.name
ALTER TABLE Authors ADD CONSTRAINT unique_author_name UNIQUE (name);

-- Posts Table
CREATE TABLE Posts (
    post_id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    author_id INTEGER REFERENCES Authors(author_id),
    published_date TIMESTAMP,
    last_updated_date TIMESTAMP,
    summary TEXT,
    content TEXT,
    view_count INTEGER DEFAULT 0,
    format_type VARCHAR(50), -- New column to specify the format (article, video, audio, poetry)
    media_url TEXT,          -- New column to store URL for videos and audios
    media_type VARCHAR(50)   -- New column to specify the media type (video, audio)
);

-- Tags Table
CREATE TABLE Tags (
    tag_id SERIAL PRIMARY KEY,
    tag_name VARCHAR(100)
);

-- PostTags Table for Many-to-Many Relationship between Posts and Tags
CREATE TABLE PostTags (
    post_id INTEGER REFERENCES Posts(post_id),
    tag_id INTEGER REFERENCES Tags(tag_id),
    PRIMARY KEY (post_id, tag_id)
);

-- Comments Table
CREATE TABLE Comments (
    comment_id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES Posts(post_id),
    author_name VARCHAR(255),
    comment TEXT,
    comment_date TIMESTAMP
);

-- Likes Table (Optional for tracking likes per post)
CREATE TABLE Likes (
    like_id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES Posts(post_id),
    like_date TIMESTAMP
);

-- Images Table (Optional, if handling images separately)
CREATE TABLE Images (
    image_id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES Posts(post_id),
    image_url TEXT,
    alt_text VARCHAR(255)
);
