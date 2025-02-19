import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { convertDate } from "@/app/lib/utils";

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

// Handler for GET requests - Fetch all education data
export async function GET() {
  try {
    const result = await sql`SELECT * FROM education ORDER BY enddate DESC;`;
    const educationData = result.rows.map((edu) => ({
      id: edu.id,
      institution: edu.institution,
      area: edu.area,
      studytype: edu.studytype,
      enddate: convertDate(edu.enddate)
    }));
    return NextResponse.json(educationData);
  } catch (error) {
    console.error("Error fetching education:", error);
    return NextResponse.json(
      { error: "Failed to fetch education" },
      { status: 500 }
    );
  }
}

// Handler for POST requests - Create a new education entry
export async function POST(req) {
  try {
    const { institution, area, studytype, enddate } = await req.json();
    const result = await sql`
      INSERT INTO education (institution, area, studytype, enddate)
      VALUES (${institution}, ${area}, ${studytype}, ${enddate})
      RETURNING *;
    `;

    // Add activity
    await addActivity({
      type: 'education',
      icon: '🎓',
      title: 'New Education Added',
      description: `Added ${studytype} at ${institution}`
    });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error adding education:", error);
    return NextResponse.json(
      { error: "Failed to add education" },
      { status: 500 }
    );
  }
}

// Handler for PUT requests - Update an existing education entry
export async function PUT(req) {
  try {
    const { id, institution, area, studytype, enddate } = await req.json();
    const result = await sql`
      UPDATE education
      SET institution = ${institution},
          area = ${area},
          studytype = ${studytype},
          enddate = ${enddate}
      WHERE id = ${id}
      RETURNING *;
    `;

    // Add activity
    await addActivity({
      type: 'education',
      icon: '🎓',
      title: 'Education Updated',
      description: `Updated ${studytype} at ${institution}`
    });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating education:", error);
    return NextResponse.json(
      { error: "Failed to update education" },
      { status: 500 }
    );
  }
}

// Handler for DELETE requests - Delete an education entry
export async function DELETE(req) {
  try {
    const { id } = await req.json();
    const result = await sql`
      DELETE FROM education
      WHERE id = ${id}
      RETURNING *;
    `;

    // Add activity
    await addActivity({
      type: 'education',
      icon: '🎓',
      title: 'Education Deleted',
      description: `Deleted education entry`
    });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error deleting education:", error);
    return NextResponse.json(
      { error: "Failed to delete education" },
      { status: 500 }
    );
  }
}