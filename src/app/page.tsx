// src/app/page.tsx
//
// 메인 페이지(대시보드).
//
// 설계 원칙:
//   - 서버 컴포넌트로 유지하고, 데이터는 lib/api/* 패칭 함수에서 가져온다.
//   - WeatherBriefing: 내부에서 getTodayBriefing()을 직접 await하는 async 서버 컴포넌트
//   - TodaySchedule / Bookshelf: 순수 표시용 서버 컴포넌트
//   - TodayProgress: 체크박스 토글 상태 때문에 내부적으로만 'use client'
//
// 데이터 흐름:
//   서버 컴포넌트에서 오늘 날짜를 기준으로 일정·진행률을 패칭해 props로 주입한다.
//   추후 BE 엔드포인트가 확정되면 lib/api/* 함수만 교체한다.

import MainHeader from '@/components/main/MainHeader'
import WeatherBriefing from '@/components/main/WeatherBriefing'
import TodaySchedule from '@/components/main/TodaySchedule'
import TodayProgress from '@/components/main/TodayProgress'
import Bookshelf from '@/components/main/Bookshelf'
import { archivedBooks, bookshelfPots, getTodayIso } from '@/lib/main'
import { getTodaySchedule } from '@/lib/api/schedule'
import { getTodayProgress } from '@/lib/api/progress'
import styles from '@/components/main/main.module.css'

export default async function MainPage() {
  const today = getTodayIso() // 'YYYY-MM-DD'

  // 서버에서 오늘 날짜 기준 데이터 패칭.
  // Promise.all로 병렬 실행해 렌더링 시간을 최소화한다.
  const [schedule, progress] = await Promise.all([
    getTodaySchedule(today),
    getTodayProgress(today),
  ])

  return (
    <main className={styles.page}>
      {/* 날짜 헤더 */}
      <MainHeader todayIso={today} />

      {/* 상단 3분할: 날씨 / 일정 / 진행률 */}
      <div className={styles.topGrid}>
        <WeatherBriefing />
        <TodaySchedule items={schedule} />
        <TodayProgress items={progress} />
      </div>

      {/* 하단 책장 */}
      <Bookshelf pots={bookshelfPots} books={archivedBooks} />
    </main>
  )
}
