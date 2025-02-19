// app/api/skills/route.js
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

export async function GET(req) {
  try {
    const result = await sql`SELECT * FROM skills ORDER BY name;`;
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Database error in GET skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { name } = await req.json();
    const result = await sql`
      INSERT INTO skills (name) 
      VALUES (${name})
      RETURNING *;
    `;

    // Add activity
    await addActivity({
      type: 'skill',
      icon: '✨',
      title: 'New Skill Added',
      description: `Added skill: ${name}`
    });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Database error in POST skill:", error);
    return NextResponse.json(
      { error: "Failed to create skill" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const { id, name } = await req.json();
    const result = await sql`
      UPDATE skills 
      SET name = ${name} 
      WHERE id = ${id}
      RETURNING *;
    `;

    // Add activity
    await addActivity({
      type: 'skill',
      icon: '✨',
      title: 'Skill Updated',
      description: `Updated skill: ${name}`
    });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Database error in PUT skill:", error);
    return NextResponse.json(
      { error: "Failed to update skill" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    const result = await sql`
      DELETE FROM skills 
      WHERE id = ${id}
      RETURNING name;
    `;

    // Add activity
    await addActivity({
      type: 'skill',
      icon: '✨',
      title: 'Skill Deleted',
      description: `Deleted skill: ${result.rows[0].name}`
    });

    return NextResponse.json({ message: "Skill deleted successfully" });
  } catch (error) {
    console.error("Database error in DELETE skill:", error);
    return NextResponse.json(
      { error: "Failed to delete skill" },
      { status: 500 }
    );
  }
}
