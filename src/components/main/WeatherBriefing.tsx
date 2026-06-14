// src/components/main/WeatherBriefing.tsx
//
// 사서 '리프'의 날씨 브리핑 카드.
// async 서버 컴포넌트로 두어, getTodayBriefing()을 서버에서 호출한다.
// BE 엔드포인트 확정 후 lib/api/weather.ts의 함수만 교체하면 이 컴포넌트는 변경되지 않는다.

import {
  getClothingLabel,
  getTodayBriefing,
  getWeatherLabel,
} from '@/lib/api/weather'
import WeatherIcon from './WeatherIcon'
import styles from './main.module.css'

export default async function WeatherBriefing() {
  const briefing = await getTodayBriefing()

  return (
    <section
      className={`${styles.card} ${styles.weatherCard}`}
      aria-label="오늘 날씨"
    >
      <p className={styles.cardLabel}>오늘 날씨</p>

      <div className={styles.weatherTop}>
        <div className={styles.weatherIcon}>
          <WeatherIcon code={briefing.iconCode} />
        </div>
        <div className={styles.weatherMeta}>
          <span className={styles.weatherCondition}>
            {getWeatherLabel(briefing.iconCode)}
          </span>
          <span className={styles.weatherSub}>
            사서 리프가 전하는 오늘의 한 마디
          </span>
        </div>
      </div>

      {/* 사서 '리프'의 브리핑 메시지 — 인용구처럼 표현 */}
      <blockquote className={styles.briefing}>
        {briefing.message}
        <cite className={styles.briefingSign}>— 리프</cite>
      </blockquote>

      {briefing.clothing.length > 0 ? (
        <div className={styles.clothingRow} aria-label="추천 의류">
          {briefing.clothing.map((code) => (
            <span key={code} className={styles.clothingChip}>
              {getClothingLabel(code)}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  )
}
