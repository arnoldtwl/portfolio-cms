// app/api/basics/route.js
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

// Function to get field display name
function getFieldDisplayName(field) {
  const displayNames = {
    name: 'Full Name',
    label: 'Professional Title',
    email: 'Email Address',
    picture: 'Profile Image',
    website: 'Website URL',
    phone: 'Phone Number',
    address: 'Address',
    city: 'City',
    countryCode: 'Country Code',
    region: 'Region',
    summary: 'Professional Summary',
  };
  return displayNames[field] || field.charAt(0).toUpperCase() + field.slice(1);
}

// Function to validate field name
function validateFieldName(field) {
  // Only allow alphanumeric characters, spaces, and underscores
  return /^[a-zA-Z0-9_\s]{1,50}$/.test(field);
}

// Input validation function
function validateBasicsInput(data) {
  const errors = [];
  
  // Validate field name for PATCH
  if (data.field) {
    if (!validateFieldName(data.field)) {
      errors.push('Field name must be 1-50 characters and contain only letters, numbers, spaces, and underscores');
    }
  }

  // Validate field type for PATCH
  if (data.fieldType) {
    const validTypes = ['text', 'email', 'url', 'tel', 'date'];
    if (!validTypes.includes(data.fieldType)) {
      errors.push('Invalid field type');
    }
  }

  // Validate value for PUT
  if (data.value !== undefined) {
    if (typeof data.value !== 'string' || data.value.length > 500) {
      errors.push('Invalid value: must be a string less than 500 characters');
    }

    // Additional validation based on field type
    if (data.fieldType === 'email' && data.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.match(data.value)) {
        errors.push('Invalid email format');
      }
    }

    if (data.fieldType === 'url' && data.value) {
      try {
        new URL(data.value);
      } catch {
        errors.push('Invalid URL format');
      }
    }

    if (data.fieldType === 'tel' && data.value) {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(data.value)) {
        errors.push('Invalid phone number format');
      }
    }
  }

  return errors;
}

// Sanitize input
function sanitizeInput(data) {
  const sanitized = {};
  
  if (data.field) {
    sanitized.field = data.field.trim().slice(0, 50);
  }
  
  if (data.fieldType) {
    sanitized.fieldType = data.fieldType.trim().toLowerCase();
  }
  
  if (data.value !== undefined) {
    sanitized.value = data.value.trim().slice(0, 500);
  }

  return sanitized;
}

// Handler for GET requests - Fetch all basics data
export async function GET() {
  try {
    const data = await sql`SELECT * FROM basics;`;
    return NextResponse.json(data.rows);
  } catch (error) {
    console.error("Error fetching basics:", error);
    return NextResponse.error("Failed to fetch basics", { status: 500 });
  }
}

// Handler for PUT requests - Update a single field in basics data
export async function PUT(req) {
  const client = await sql.connect();
  try {
    const data = await req.json();
    
    // Validate input
    const validationErrors = validateBasicsInput(data);
    if (validationErrors.length > 0) {
      client.release();
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedData = sanitizeInput(data);

    // Build a dynamic SQL query to update the specific field
    const fieldName = sanitizedData.field;
    const query = `UPDATE basics SET "${fieldName}" = $1 WHERE id = $2 RETURNING *;`;
    const result = await client.query(query, [sanitizedData.value, data.id]);

    // Get the display name for the field
    const fieldDisplayName = getFieldDisplayName(sanitizedData.field);

    // Add activity with more specific information
    await addActivity({
      type: 'basic',
      icon: '✏️',
      title: 'Field Updated',
      description: `Updated ${fieldDisplayName} to "${sanitizedData.value}"`
    });

    client.release();
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    client.release();
    console.error("Error updating a field in basics:", error);
    return NextResponse.json({ error: "Failed to update field" }, { status: 500 });
  }
}

// Handler for DELETE requests - Remove a single field from basics data
export async function DELETE(req) {
  const client = await sql.connect();
  try {
    const { id, field } = await req.json();
    // Get the current value before deleting
    const currentValue = await client.query(`SELECT ${field} FROM basics WHERE id = $1`, [id]);
    const oldValue = currentValue.rows[0][field];

    // Build the query string to set the field to null
    const query = `UPDATE basics SET ${field} = NULL WHERE id = $1 RETURNING *;`;
    // Execute the query with parameterized inputs
    const result = await client.query(query, [id]);

    // Get the display name for the field
    const fieldDisplayName = getFieldDisplayName(field);

    // Add activity with more specific information
    await addActivity({
      type: 'basic',
      icon: '👤',
      title: 'Basic Info Removed',
      description: `Removed ${fieldDisplayName} (was "${oldValue}")`
    });

    client.release();
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    client.release();
    console.error("Error removing a field in basics:", error);
    return NextResponse.json({ error: "Failed to remove field" }, { status: 500 });
  }
}

// Handler for PATCH requests - Add new fields dynamically
export async function PATCH(req) {
  try {
    const data = await req.json();
    
    // Validate input
    const validationErrors = validateBasicsInput(data);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedData = sanitizeInput(data);

    // Check if field already exists
    const existingField = await sql`
      SELECT field FROM basics WHERE field = ${sanitizedData.field};
    `;

    if (existingField.rows.length > 0) {
      return NextResponse.json(
        { error: "Field already exists" },
        { status: 400 }
      );
    }

    // Add new field
    const result = await sql`
      INSERT INTO basics (field, field_type, value)
      VALUES (${sanitizedData.field}, ${sanitizedData.fieldType}, '');
    `;

    // Add activity
    await addActivity({
      type: 'basics',
      icon: '📝',
      title: 'New Field Added',
      description: `Added field: ${sanitizedData.field}`
    });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error adding field:", error);
    return NextResponse.json(
      { error: "Failed to add field" },
      { status: 500 }
    );
  }
}