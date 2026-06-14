// src/components/main/MainHeader.tsx
//
// 메인 페이지 날짜 헤더.
// 정적 표시만 하므로 서버 컴포넌트로 유지한다.

import { formatKoreanDate } from '@/lib/main'
import styles from './main.module.css'

type MainHeaderProps = {
  todayIso: string // 'YYYY-MM-DD'
}

export default function MainHeader({ todayIso }: MainHeaderProps) {
  return (
    <header className={styles.header}>
      <p className={styles.eyebrow}>오늘의 기록</p>
      <h1 className={styles.dateTitle}>{formatKoreanDate(todayIso)}</h1>
    </header>
  )
}
