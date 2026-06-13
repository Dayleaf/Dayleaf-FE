'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { calendarCategories } from '@/lib/calendar'
import styles from './sidebar.module.css'

const navItems = [
  { label: '캘린더', href: '/calendar/monthly' },
  { label: '라이브러리', href: '/library' },
  { label: '루틴', href: '/routine' },
  { label: '일기', href: '/' },
  { label: '친구', href: '/' },
  { label: '설정', href: '/' },
]

const miniDays = Array.from({ length: 35 }, (_, index) => index - 1)

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoMark} aria-hidden="true">
          <Image src="/dayleaf-logo.png" alt="" width={34} height={33} priority />
        </span>
        <span>DayLeaf</span>
      </div>

      <button className={styles.createButton} type="button">
        + 새 일정
      </button>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === item.href
              : pathname.startsWith(item.href.replace('/monthly', ''))

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <section className={styles.section} aria-labelledby="mini-calendar-title">
        <div className={styles.sectionHeader}>
          <h2 id="mini-calendar-title">2026년 6월</h2>
          <div className={styles.miniActions}>
            <button type="button" aria-label="이전 달">
              &lt;
            </button>
            <button type="button" aria-label="다음 달">
              &gt;
            </button>
          </div>
        </div>
        <div className={styles.miniCalendar}>
          {['일', '월', '화', '수', '목', '금', '토'].map((weekday) => (
            <span key={weekday} className={styles.weekday}>
              {weekday}
            </span>
          ))}
          {miniDays.map((day, index) => (
            <button
              key={`${day}-${index}`}
              className={`${styles.miniDay} ${day === 5 ? styles.selectedMiniDay : ''} ${
                day < 1 || day > 30 ? styles.mutedMiniDay : ''
              }`}
              type="button"
            >
              {day < 1 ? '' : day > 30 ? '' : day}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="category-title">
        <h2 id="category-title">캘린더</h2>
        <div className={styles.categoryList}>
          {calendarCategories.map((category) => (
            <label key={category.id} className={styles.categoryItem}>
              <input type="checkbox" defaultChecked />
              <span className={styles.categoryDot} style={{ background: category.color }} />
              <span>{category.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="filter-title">
        <h2 id="filter-title">필터</h2>
        <div className={styles.filterList}>
          {['전체 일정', '반복 일정', '완료된 일정'].map((filter, index) => (
            <label key={filter} className={styles.filterItem}>
              <input type="checkbox" defaultChecked={index < 2} />
              <span>{filter}</span>
            </label>
          ))}
        </div>
      </section>
    </aside>
  )
}
