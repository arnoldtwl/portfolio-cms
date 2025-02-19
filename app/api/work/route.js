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

// Handler for GET requests - Fetch all work experience data
export async function GET() {
  try {
    const data = await sql`SELECT * FROM work ORDER BY startdate DESC;`;
    const workData = data.rows.map((work) => {
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
    return NextResponse.json(workData);
  } catch (error) {
    console.error("Error fetching work experience:", error);
    return NextResponse.json(
      { error: "Failed to fetch work experience" },
      { status: 500 }
    );
  }
}

// Handler for POST requests - Create a new work experience entry
export async function POST(req) {
  try {
    const { company, position, startDate, endDate, summary } = await req.json();
    const result = await sql`
      INSERT INTO work (company, position, startDate, endDate, summary)
      VALUES (${company}, ${position}, ${startDate}, ${endDate}, ${summary})
      RETURNING *;
    `;

    // Add activity
    await addActivity({
      type: 'work',
      icon: '💼',
      title: 'New Work Experience Added',
      description: `Added ${position} at ${company}`
    });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error adding work experience:", error);
    return NextResponse.json(
      { error: "Failed to add work experience" },
      { status: 500 }
    );
  }
}

// Handler for PUT requests - Update an existing work experience entry
export async function PUT(req) {
  try {
    const { id, company, position, startDate, endDate, summary } = await req.json();
    const result = await sql`
      UPDATE work
      SET company = ${company},
          position = ${position},
          startDate = ${startDate},
          endDate = ${endDate},
          summary = ${summary}
      WHERE id = ${id}
      RETURNING *;
    `;

    // Add activity
    await addActivity({
      type: 'work',
      icon: '💼',
      title: 'Work Experience Updated',
      description: `Updated ${position} at ${company}`
    });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating work experience:", error);
    return NextResponse.json(
      { error: "Failed to update work experience" },
      { status: 500 }
    );
  }
}

// Handler for DELETE requests - Delete a work experience entry
export async function DELETE(req) {
  try {
    const { id } = await req.json();
    const result = await sql`
      DELETE FROM work 
      WHERE id = ${id}
      RETURNING company, position;
    `;

    // Add activity
    await addActivity({
      type: 'work',
      icon: '💼',
      title: 'Work Experience Deleted',
      description: `Deleted ${result.rows[0].position} at ${result.rows[0].company}`
    });

    return NextResponse.json({ message: "Work experience deleted successfully" });
  } catch (error) {
    console.error("Error deleting work experience:", error);
    return NextResponse.json(
      { error: "Failed to delete work experience" },
      { status: 500 }
    );
  }
}