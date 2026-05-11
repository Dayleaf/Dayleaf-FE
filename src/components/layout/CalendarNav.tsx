'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './calendarNav.module.css'

export default function CalendarNav() {
  const pathname = usePathname()

  const tabs = [
    { label: 'daily', href: '/calendar' },
    { label: 'weekly', href: '/calendar/weekly' },
    { label: 'monthly', href: '/calendar/monthly' },
  ]

  return (
    <nav className={styles.nav}>
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`${styles.tab} ${pathname === tab.href ? styles.active : ''}`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
