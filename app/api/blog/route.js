// app/api/blog/route.js

import { sql } from "@vercel/postgres";

const validFormatTypes = ["article", "video", "audio", "poetry"];
const validMediaTypes = ["", "video", "audio"];

function validateInput(data) {
  const errors = [];

  if (!validFormatTypes.includes(data.format_type)) {
    errors.push(`Invalid format type: ${data.format_type}`);
  }

  if (!validMediaTypes.includes(data.media_type)) {
    errors.push(`Invalid media type: ${data.media_type}`);
  }

  if (data.media_type && !data.media_url) {
    errors.push("Media URL is required when media type is specified");
  }

  return errors;
}

// Get all posts
export async function GET(req) {
  try {
    const postsData = await sql`
      SELECT p.*, a.name as author_name 
      FROM Posts p
      JOIN Authors a ON p.author_id = a.author_id
    `;
    return new Response(JSON.stringify(postsData.rows), { status: 200 });
  } catch (error) {
    console.error("Database error in GET posts:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch posts" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Create a new post
export async function POST(req) {
  try {
    const postData = await req.json();
    const validationErrors = validateInput(postData);

    if (validationErrors.length > 0) {
      return new Response(JSON.stringify({ errors: validationErrors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const {
      title,
      author_name,
      summary,
      content,
      format_type,
      media_url,
      media_type,
    } = postData;

    // First, insert or get the author
    const authorResult = await sql`
      INSERT INTO Authors (name)
      VALUES (${author_name})
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
      RETURNING author_id;
    `;
    const author_id = authorResult.rows[0].author_id;

    // Then, insert the post
    await sql`
      INSERT INTO Posts (title, author_id, published_date, last_updated_date, summary, content, format_type, media_url, media_type)
      VALUES (${title}, ${author_id}, NOW(), NOW(), ${summary}, ${content}, ${format_type}, ${media_url}, ${media_type});
    `;
    return new Response(
      JSON.stringify({ message: "Post created successfully" }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Database error in POST post:", error);
    return new Response(JSON.stringify({ error: "Failed to create post" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Update a post
export async function PUT(req) {
  try {
    const postData = await req.json();
    const validationErrors = validateInput(postData);

    if (validationErrors.length > 0) {
      return new Response(JSON.stringify({ errors: validationErrors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const {
      post_id,
      title,
      author_name,
      summary,
      content,
      format_type,
      media_url,
      media_type,
    } = postData;

    // First, update or insert the author
    const authorResult = await sql`
      INSERT INTO Authors (name)
      VALUES (${author_name})
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
      RETURNING author_id;
    `;
    const author_id = authorResult.rows[0].author_id;

    // Then, update the post
    await sql`
      UPDATE Posts
      SET title = ${title}, author_id = ${author_id}, last_updated_date = NOW(), 
          summary = ${summary}, content = ${content}, format_type = ${format_type}, 
          media_url = ${media_url}, media_type = ${media_type}
      WHERE post_id = ${post_id};
    `;
    return new Response(
      JSON.stringify({ message: "Post updated successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Database error in PUT post:", error);
    return new Response(JSON.stringify({ error: "Failed to update post" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Delete a post
export async function DELETE(req) {
  try {
    const { post_id } = await req.json();
    await sql`DELETE FROM Posts WHERE post_id = ${post_id};`;
    return new Response(
      JSON.stringify({ message: "Post deleted successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Database error in DELETE post:", error);
    return new Response(JSON.stringify({ error: "Failed to delete post" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
