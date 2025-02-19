'use client';

import Sidebar from '../components/Sidebar';
import styles from './layout.module.css';

export default function DashboardLayout({ children }) {
  return (
    <div className={styles.layout}>
      <div className={styles.container}>
        <Sidebar />
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}
