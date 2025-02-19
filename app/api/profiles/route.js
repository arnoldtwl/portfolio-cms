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
    const result = await sql`SELECT * FROM profiles ORDER BY network;`;
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Database error in GET profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch profiles" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { network, username, url } = await req.json();
    const result = await sql`
      INSERT INTO profiles (network, username, url) 
      VALUES (${network}, ${username}, ${url})
      RETURNING *;
    `;

    // Add activity
    await addActivity({
      type: 'profile',
      icon: '🔗',
      title: 'Social Profile Added',
      description: `Added ${network} profile for ${username}`
    });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Database error in POST profile:", error);
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const { id, network, username, url } = await req.json();
    const result = await sql`
      UPDATE profiles 
      SET network = ${network},
          username = ${username},
          url = ${url}
      WHERE id = ${id}
      RETURNING *;
    `;

    // Add activity
    await addActivity({
      type: 'profile',
      icon: '🔗',
      title: 'Social Profile Updated',
      description: `Updated ${network} profile for ${username}`
    });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Database error in PUT profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    const result = await sql`
      DELETE FROM profiles 
      WHERE id = ${id}
      RETURNING network, username;
    `;

    // Add activity
    await addActivity({
      type: 'profile',
      icon: '🔗',
      title: 'Social Profile Removed',
      description: `Removed ${result.rows[0].network} profile for ${result.rows[0].username}`
    });

    return NextResponse.json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Database error in DELETE profile:", error);
    return NextResponse.json(
      { error: "Failed to delete profile" },
      { status: 500 }
    );
  }
}