// src/app/page.tsx
//
// 메인 페이지(대시보드).
//
// 설계 원칙:
//   - 서버 컴포넌트로 유지하고, 날짜 기준 값만 하위 클라이언트 카드에 전달한다.
//   - WeatherBriefing: 내부에서 getTodayBriefing()을 직접 await하는 async 서버 컴포넌트
//   - TodaySchedule / TodayProgress: calendar store와 연동되는 클라이언트 카드
//
// 데이터 흐름:
//   서버 컴포넌트에서 오늘 날짜를 계산하고, 일정·진행률 카드는 store의 실제 데이터를 조회한다.

import MainHeader from '@/components/main/MainHeader'
import WeatherBriefing from '@/components/main/WeatherBriefing'
import TodaySchedule from '@/components/main/TodaySchedule'
import TodayProgress from '@/components/main/TodayProgress'
import { getTodayIso } from '@/lib/main'
import styles from '@/components/main/main.module.css'

export default function MainPage() {
  const today = getTodayIso() // 'YYYY-MM-DD'

  return (
    <main className={styles.page}>
      {/* 날짜 헤더 */}
      <MainHeader todayIso={today} />

      {/* 상단: 날씨 전체 폭, 하단 2열 일정/진행률 */}
      <div className={styles.topGrid}>
        <div className={styles.weatherArea}>
          <WeatherBriefing />
        </div>
        <div className={styles.scheduleArea}>
          <TodaySchedule date={today} />
        </div>
        <div className={styles.progressArea}>
          <TodayProgress date={today} />
        </div>
      </div>
    </main>
  )
}
