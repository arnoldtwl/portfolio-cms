// app/api/projects/route.js
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

// Function to add activity
async function addActivity(activity) {
  try {
    await sql`
      INSERT INTO activities (type, icon, title, description)
      VALUES (${activity.type}, ${activity.icon}, ${activity.title}, ${activity.description})
    `;
  } catch (error) {
    console.error('Error adding activity:', error);
  }
}

// Input validation function
function validateProjectInput(data) {
  const errors = [];
  
  // Validate name
  if (!data.name || typeof data.name !== 'string' || data.name.length > 100) {
    errors.push('Invalid project name');
  }

  // Validate description
  if (!data.description || typeof data.description !== 'string' || data.description.length > 1000) {
    errors.push('Invalid description');
  }

  // Validate GitHub link
  if (data.githubLink) {
    try {
      const url = new URL(data.githubLink);
      if (!url.hostname.includes('github.com')) {
        errors.push('GitHub link must be from github.com');
      }
    } catch {
      errors.push('Invalid GitHub URL');
    }
  }

  // Validate deployment link
  if (data.deploymentLink) {
    try {
      new URL(data.deploymentLink);
    } catch {
      errors.push('Invalid deployment URL');
    }
  }

  return errors;
}

// Sanitize input
function sanitizeInput(data) {
  return {
    name: data.name?.trim().slice(0, 100) || '',
    description: data.description?.trim().slice(0, 1000) || '',
    githubLink: data.githubLink?.trim() || null,
    deploymentLink: data.deploymentLink?.trim() || null
  };
}

// GET: Fetch all projects
export async function GET() {
  try {
    const result = await sql`SELECT * FROM projects;`;
    const projects = result.rows.map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        githubLink: project.githublink,
        deploymentLink: project.deploymentlink,
    }));
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST: Add a new project
export async function POST(req) {
  try {
    const data = await req.json();
    
    // Validate input
    const validationErrors = validateProjectInput(data);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedData = sanitizeInput(data);
    
    const result = await sql`
      INSERT INTO projects (name, description, githublink, deploymentlink)
      VALUES (${sanitizedData.name}, ${sanitizedData.description}, ${sanitizedData.githubLink}, ${sanitizedData.deploymentLink})
      RETURNING *;
    `;
    
    // Add activity
    await addActivity({
      type: 'project',
      icon: '🚀',
      title: 'New Project Added',
      description: `Added project: ${sanitizedData.name}`
    });

    const project = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      description: result.rows[0].description,
      githubLink: result.rows[0].githublink,
      deploymentLink: result.rows[0].deploymentlink
    };

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error adding project:", error);
    return NextResponse.json(
      { error: "Failed to add project" },
      { status: 500 }
    );
  }
}

// PUT: Update an existing project
export async function PUT(req) {
  try {
    const data = await req.json();
    
    // Validate input
    const validationErrors = validateProjectInput(data);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedData = sanitizeInput(data);
    
    const result = await sql`
      UPDATE projects 
      SET name = ${sanitizedData.name}, 
          description = ${sanitizedData.description}, 
          githublink = ${sanitizedData.githubLink}, 
          deploymentlink = ${sanitizedData.deploymentLink}
      WHERE id = ${data.id}
      RETURNING *;
    `;

    // Add activity
    await addActivity({
      type: 'project',
      icon: '🚀',
      title: 'Project Updated',
      description: `Updated project: ${sanitizedData.name}`
    });

    const project = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      description: result.rows[0].description,
      githubLink: result.rows[0].githublink,
      deploymentLink: result.rows[0].deploymentlink
    };

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a project
export async function DELETE(req) {
  try {
    const { id } = await req.json();
    const result = await sql`
      DELETE FROM projects WHERE id = ${id}
      RETURNING name;
    `;

    // Add activity
    await addActivity({
      type: 'project',
      icon: '🚀',
      title: 'Project Deleted',
      description: `Deleted project: ${result.rows[0].name}`
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
