
-- Basics Table
CREATE TABLE Basics (
    id SERIAL PRIMARY KEY,
    name TEXT,
    label TEXT,
    email TEXT,
    picture TEXT,
    website TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    countryCode TEXT,
    region TEXT,
    summary TEXT
);

-- Profiles Table
CREATE TABLE Profiles (
    id SERIAL PRIMARY KEY,
    basics_id INTEGER REFERENCES Basics(id),
    network TEXT,
    username TEXT,
    url TEXT
);

-- Work Table
CREATE TABLE Work (
    id SERIAL PRIMARY KEY,
    company TEXT,
    position TEXT,
    startDate DATE,
    endDate DATE,
    summary TEXT
);

-- Education Table
CREATE TABLE Education (
    id SERIAL PRIMARY KEY,
    institution TEXT,
    area TEXT,
    studyType TEXT,
    endDate DATE
);

-- Skills Table
CREATE TABLE Skills (
    id SERIAL PRIMARY KEY,
    name TEXT
);

-- Projects Table
CREATE TABLE Projects (
    id SERIAL PRIMARY KEY,
    name TEXT,
    description TEXT,
    githubLink TEXT,
    deploymentLink TEXT
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    icon VARCHAR(10),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
