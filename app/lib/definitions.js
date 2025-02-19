// definitions for the different types of data we can store in the database

// app\lib\definitions.js
export const Basics = {
    id: 'SERIAL PRIMARY KEY',
    name: 'TEXT',
    label: 'TEXT',
    email: 'TEXT',
    picture: 'TEXT',
    website: 'TEXT',
    phone: 'TEXT',
    address: 'TEXT',
    city: 'TEXT',
    countryCode: 'TEXT',
    region: 'TEXT',
    summary: 'TEXT'
};

export const Profiles = {
    id: 'SERIAL PRIMARY KEY',
    basics_id: 'INTEGER REFERENCES Basics(id)',
    network: 'TEXT',
    username: 'TEXT',
    url: 'TEXT'
};

export const Work = {
    id: 'SERIAL PRIMARY KEY',
    company: 'TEXT',
    position: 'TEXT',
    startDate: 'DATE',
    endDate: 'DATE',
    summary: 'TEXT'
};

export const Education = {
    id: 'SERIAL PRIMARY KEY',
    institution: 'TEXT',
    area: 'TEXT',
    studyType: 'TEXT',
    endDate: 'DATE'
};

export const Skills = {
    id: 'SERIAL PRIMARY KEY',
    name: 'TEXT'
};

export const Projects = {
    id: 'SERIAL PRIMARY KEY',
    name: 'TEXT',
    description: 'TEXT',
    githubLink: 'TEXT',
    deploymentLink: 'TEXT'
};

export const Activities = {
    id: 'SERIAL PRIMARY KEY',
    type: 'TEXT',
    icon: 'TEXT',
    title: 'TEXT',
    description: 'TEXT',
    timestamp: 'TIMESTAMP'
};