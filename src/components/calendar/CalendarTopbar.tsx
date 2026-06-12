'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './calendarTopbar.module.css'

const views = [
  { label: '일', href: '/calendar' },
  { label: '주', href: '/calendar/weekly' },
  { label: '월', href: '/calendar/monthly' },
]

export default function CalendarTopbar() {
  const pathname = usePathname()

  return (
    <header className={styles.topbar}>
      <div className={styles.leftGroup}>
        <button className={styles.todayButton} type="button">
          오늘
        </button>
        <div className={styles.monthControls} aria-label="월 이동">
          <button className={styles.iconButton} type="button" aria-label="이전 달">
            &lt;
          </button>
          <button className={styles.iconButton} type="button" aria-label="다음 달">
            &gt;
          </button>
        </div>
        <h1 className={styles.currentMonth}>2026년 6월</h1>
      </div>

      <div className={styles.rightGroup}>
        <label className={styles.search}>
          <span className={styles.searchIcon}>Search</span>
          <input type="search" placeholder="일정 검색" aria-label="일정 검색" />
        </label>
        <nav className={styles.viewSwitcher} aria-label="캘린더 보기">
          {views.map((view) => (
            <Link
              key={view.href}
              href={view.href}
              className={`${styles.viewLink} ${pathname === view.href ? styles.activeView : ''}`}
            >
              {view.label}
            </Link>
          ))}
        </nav>
        <button className={styles.iconButton} type="button" aria-label="설정">
          설정
        </button>
        <button className={styles.avatarButton} type="button" aria-label="프로필">
          DL
        </button>
      </div>
    </header>
  )
}
