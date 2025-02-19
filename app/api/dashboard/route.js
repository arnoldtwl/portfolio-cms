import { NextResponse } from 'next/server';
import { sql } from "@vercel/postgres";
import { dashboardConfig } from '@/config/dashboard';

// Revalidation interval in seconds (5 minutes)
export const revalidate = 300;

// Function to get activities
async function getActivities() {
  const { activityRetentionDays, maxActivities } = dashboardConfig;
  try {
    const activities = await sql`
      SELECT id, type, icon, title, description, 
             timestamp AT TIME ZONE 'UTC' as timestamp 
      FROM activities 
      WHERE timestamp > NOW() - (${activityRetentionDays || 30} || ' days')::interval
      ORDER BY timestamp DESC 
      LIMIT ${maxActivities || 50}
    `;
    return activities.rows;
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
}

// Function to add activity
async function addActivity(activity) {
  try {
    const result = await sql`
      INSERT INTO activities (type, icon, title, description)
      VALUES (${activity.type}, ${activity.icon}, ${activity.title}, ${activity.description})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error adding activity:', error);
    return null;
  }
}

// Function to clean up old activities (older than retention period)
async function cleanupOldActivities() {
  const { activityRetentionDays } = dashboardConfig;
  try {
    await sql`
      DELETE FROM activities 
      WHERE timestamp < NOW() - (${activityRetentionDays || 30} || ' days')::interval
    `;
  } catch (error) {
    console.error("Error cleaning up old activities:", error);
  }
}

// Function to get icon for type
function getIconForType(type) {
  return dashboardConfig.activityIcons[type] || '📋';
}

// GET handler with proper caching headers
export async function GET() {
  try {
    // Run cleanup less frequently (once per hour) using a timestamp check
    const CLEANUP_INTERVAL = 3600000; // 1 hour in milliseconds
    const shouldCleanup = !global.lastCleanupTime || 
                         (Date.now() - global.lastCleanupTime) >= CLEANUP_INTERVAL;
    
    if (shouldCleanup) {
      await cleanupOldActivities();
      global.lastCleanupTime = Date.now();
    }

    // Fetch activities
    const activities = await getActivities();
    
    // Fetch counts from each table
    const [projectsCount, skillsCount, workCount, educationCount] = await Promise.all([
      sql`SELECT COUNT(*) FROM projects`,
      sql`SELECT COUNT(*) FROM skills`,
      sql`SELECT COUNT(*) FROM work`,
      sql`SELECT COUNT(*) FROM education`
    ]);

    const stats = {
      projects: parseInt(projectsCount.rows[0].count),
      skills: parseInt(skillsCount.rows[0].count),
      work: parseInt(workCount.rows[0].count),
      education: parseInt(educationCount.rows[0].count)
    };
    
    // Set cache-control headers
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=59');
    
    return NextResponse.json(
      { 
        activities,
        stats,
        config: {
          retentionDays: dashboardConfig.activityRetentionDays
        }
      },
      { 
        status: 200,
        headers
      }
    );
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST handler for adding new activities
export async function POST(request) {
  try {
    const body = await request.json();
    const { type, title, description } = body;
    
    const icon = getIconForType(type);
    const activity = await addActivity({ type, icon, title, description });
    
    if (!activity) {
      return NextResponse.json(
        { error: 'Failed to add activity' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
