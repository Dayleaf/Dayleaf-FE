import Link from 'next/link'
import styles from './sidebar.module.css'

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span>🍀</span>
        <span>DayLeaf</span>
      </div>
      <div className={styles.profile}>
        <span>프로필</span>
        <span>닉네임</span>
      </div>
      <nav className={styles.nav}>
        <Link href="/calendar">캘린더</Link>
        <Link href="/library">라이브러리</Link>
        <Link href="/routine">루틴</Link>
        <Link href="/">일기</Link>
        <Link href="/">친구</Link>
        <Link href="/">설정</Link>
      </nav>
    </aside>
  )
}
