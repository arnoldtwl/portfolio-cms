'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Image 
          src="/logo.png" 
          alt="ArnoldTWL Logo" 
          width={300} 
          height={100}
          priority={true}
          className={styles.logo}
        />
      </div>
      <div className={styles.rightSection}>
        <div className={styles.searchBar}>
          <input type="search" placeholder="Search..." />
        </div>
        <div className={styles.userMenu}>
          <span>Welcome, Admin</span>
          <button className={styles.profileButton}>
            <Image 
              src="/profile-placeholder.png" 
              alt="Profile" 
              width={32} 
              height={32} 
              priority={true}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
