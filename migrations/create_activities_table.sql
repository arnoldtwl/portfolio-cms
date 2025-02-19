-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    icon VARCHAR(10),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
