'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/portfoliocm', icon: '📊' },
    { name: 'Basics', path: '/portfoliocm/basics', icon: '📝' },
    { name: 'Work', path: '/portfoliocm/work', icon: '💼' },
    { name: 'Education', path: '/portfoliocm/education', icon: '🎓' },
    { name: 'Skills', path: '/portfoliocm/skills', icon: '🎯' },
    { name: 'Projects', path: '/portfoliocm/projects', icon: '🚀' },
    { name: 'Profiles', path: '/portfoliocm/profiles', icon: '👤' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <Image 
          src="/logo.png" 
          alt="ArnoldTWL Logo" 
          width={176} 
          height={176}
          priority={true}
          className={styles.logo}
        />
      </div>
      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`${styles.navLink} ${
              pathname === item.path ? styles.active : ''
            }`}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
