// src/components/main/TodaySchedule.tsx
//
// 오늘 일정 카드.
// BE의 ScheduleResponse를 TodayScheduleItem으로 변환한 데이터를 받아 표시한다.
// 정적 표시이므로 서버 컴포넌트로 유지한다.
//
// BE ScheduleResponse의 시간 형태: 'HH:mm:ss' (LocalTime → Jackson 직렬화)
// → formatTime() 유틸로 'HH:mm'으로 잘라 표시한다.

import type { CSSProperties } from 'react'
import { formatTime } from '@/lib/api/schedule'
import type { TodayScheduleItem } from '@/types/main'
import styles from './main.module.css'

type TodayScheduleProps = {
  items: TodayScheduleItem[]
}

function formatRange(
  startTime: string | null,
  endTime: string | null,
  allDay: boolean
): string {
  if (allDay) return '종일'
  const start = formatTime(startTime)
  const end = formatTime(endTime)
  return end ? `${start} – ${end}` : start
}

export default function TodaySchedule({ items }: TodayScheduleProps) {
  return (
    <section className={styles.card} aria-label="오늘 일정">
      <p className={styles.cardLabel}>오늘 일정</p>

      {items.length === 0 ? (
        <p className={styles.emptyText}>오늘은 등록된 일정이 없어요.</p>
      ) : (
        <div className={styles.scheduleList}>
          {items.map((item) => (
            <div key={item.nodeId} className={styles.scheduleItem}>
              <span
                className={styles.scheduleDot}
                style={{ '--event-color': item.color } as CSSProperties}
              />
              <div className={styles.scheduleBody}>
                <span className={styles.scheduleTitle}>{item.title}</span>
                <span className={styles.scheduleTime}>
                  {formatRange(item.startTime, item.endTime, item.allDay)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
