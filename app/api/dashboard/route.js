import { NextResponse } from 'next/server';
import { sql } from "@vercel/postgres";
import { dashboardConfig } from '@/config/dashboard';

// Revalidation interval in seconds (5 minutes)
export const revalidate = 300;

// In-memory cache
let dashboardCache = {
  data: null,
  timestamp: 0
};

// Cache duration in milliseconds (30 seconds)
const CACHE_DURATION = 30000;

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
    const now = Date.now();
    
    // Check if we have a valid cache
    if (dashboardCache.data && (now - dashboardCache.timestamp) < CACHE_DURATION) {
      // Return cached data with cache headers
      const headers = new Headers();
      headers.set('Cache-Control', 'public, max-age=30, s-maxage=300, stale-while-revalidate=59');
      headers.set('X-Cache', 'HIT');
      
      return NextResponse.json(dashboardCache.data, { 
        status: 200,
        headers
      });
    }
    
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
    
    // Prepare response data
    const responseData = { 
      activities,
      stats,
      config: {
        retentionDays: dashboardConfig.activityRetentionDays
      }
    };
    
    // Update cache
    dashboardCache = {
      data: responseData,
      timestamp: now
    };
    
    // Set cache-control headers
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=30, s-maxage=300, stale-while-revalidate=59');
    headers.set('X-Cache', 'MISS');
    
    return NextResponse.json(responseData, { 
      status: 200,
      headers
    });
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
    
    // Invalidate the cache when a new activity is added
    dashboardCache.timestamp = 0;
    
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
