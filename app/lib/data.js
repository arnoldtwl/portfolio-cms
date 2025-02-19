// lib/data.js
import "server-only";
import { sql } from "@vercel/postgres";
import { convertDate } from "./utils";

export async function getBasics() {
  try {
    const data = await sql`SELECT * FROM basics;`;
    return data.rows[0];
  } catch (error) {
    console.error("Database error in getBasics:", error);
    throw new Error("Failed to fetch basics");
  }
}

export async function getProfiles() {
  try {
    const result = await sql`
            SELECT * FROM profiles;
        `;
    const profilesData = result.rows.map((profile) => {
      return {
        id: profile.id,
        network: profile.network,
        username: profile.username,
        url: profile.url,
      };
    });
    return profilesData;
  } catch (error) {
    console.error(`Database error in getProfiles:`, error);
    throw new Error("Failed to fetch profiles");
  }
}

export async function getEducation() {
  try {
    const result = await sql`SELECT * FROM education;`;
    const educationData = result.rows.map((education) => {
      const endDate = convertDate(education.enddate);
      return {
        id: education.id,
        institution: education.institution,
        area: education.area,
        studyType: education.studytype,
        endDate,
      };
    });
    return educationData;
  } catch (error) {
    console.error("Database error in getEducation:", error);
    throw new Error("Failed to fetch education");
  }
}

export async function getWork() {
  try {
    const result = await sql`SELECT * FROM work;`;
    const workData = result.rows.map((work) => {
      const startDate = convertDate(work.startdate);
      const endDate = convertDate(work.enddate);
      return {
        id: work.id,
        company: work.company,
        position: work.position,
        startDate,
        endDate,
        summary: work.summary,
      };
    });
    return workData;
  } catch (error) {
    console.error("Database error in getWork:", error);
    throw new Error("Failed to fetch work");
  }
}

export async function getSkills() {
  try {
    const result = await sql`SELECT * FROM skills;`;
    const skillsData = result.rows.map((skill) => {
      return {
        id: skill.id,
        name: skill.name,
      };
    });
    return skillsData;
  } catch (error) {
    console.error("Database error in getSkills:", error);
    throw new Error("Failed to fetch skills");
  }
}

export async function getProjects() {
  try {
    const result = await sql`
            SELECT projects.id, projects.name, projects.description, projects.githublink, projects.deploymentlink FROM projects;
        `;
    const projectsData = result.rows.map((project) => {
      return {
        id: project.id,
        name: project.name,
        description: project.description,
        github: project.githublink,
        deployment: project.deploymentlink,
      };
    });
    return projectsData;
  } catch (error) {
    console.error("Database error in getProjects:", error);
    throw new Error("Failed to fetch projects");
  }
}

export async function getProjectFrontend() {
  try {
    const result = await sql`SELECT * FROM projectfrontend;`;
    const frontendData = result.rows.map((frontend) => {
      return {
        id: frontend.id,
        projectid: frontend.project_id,
        github: frontend.githublink,
        deployment: frontend.deploymentlink,
      };
    });
    return frontendData;
  } catch (error) {
    console.error(`Database error in getProjectFrontend:`, error);
    throw new Error("Failed to fetch project frontend");
  }
}

export async function getProjectBackend() {
  try {
    const result = await sql`SELECT * FROM projectbackend;`;
    const backendData = result.rows.map((backend) => {
      return {
        id: backend.id,
        projectid: backend.project_id,
        github: backend.githublink,
        deployment: backend.deploymentlink,
      };
    });
    return backendData;
  } catch (error) {
    console.error(`Database error in getProjectBackend:`, error);
    throw new Error("Failed to fetch project backend");
  }
}
