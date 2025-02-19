'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    stats: [
      { title: 'Total Projects', value: '0', icon: '🚀' },
      { title: 'Skills', value: '0', icon: '🎯' },
      { title: 'Work Experience', value: '0', icon: '💼' },
      { title: 'Education', value: '0', icon: '🎓' },
    ],
    activities: []
  });

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      
      setDashboardData({
        stats: [
          { title: 'Total Projects', value: data.stats.projects.toString(), icon: '🚀' },
          { title: 'Skills', value: data.stats.skills.toString(), icon: '🎯' },
          { title: 'Work Experience', value: data.stats.work.toString(), icon: '💼' },
          { title: 'Education', value: data.stats.education.toString(), icon: '🎓' },
        ],
        activities: data.activities
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Set up polling for real-time updates
  useEffect(() => {
    const interval = setInterval(fetchDashboardData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 5) return 'just now';
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    // Format date for older activities
    return past.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Dashboard</h1>
      
      <div className={styles.statsGrid}>
        {dashboardData.stats.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statIcon}>{stat.icon}</div>
            <div className={styles.statInfo}>
              <h3>{stat.title}</h3>
              <p className={styles.statValue}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.recentActivity}>
        <h2>Recent Activity</h2>
        <div className={styles.activityList}>
          {dashboardData.activities.map((activity) => (
            <div key={activity.id} className={styles.activityItem}>
              <span className={styles.activityIcon}>{activity.icon}</span>
              <div>
                <h4>{activity.title}</h4>
                <p>{activity.description}</p>
                <small>{formatTimeAgo(activity.timestamp)}</small>
              </div>
            </div>
          ))}
          {dashboardData.activities.length === 0 && (
            <div className={styles.noActivity}>
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
