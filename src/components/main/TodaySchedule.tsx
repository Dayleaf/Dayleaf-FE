'use client'

import { useMemo, type CSSProperties } from 'react'
import { useCalendarStore } from '@/stores/calendarStore'
import styles from './main.module.css'

type TodayScheduleProps = {
  date: string
}

function formatRange(startTime: string, endTime: string): string {
  return `${startTime} – ${endTime}`
}

export default function TodaySchedule({ date }: TodayScheduleProps) {
  const events = useCalendarStore((state) => state.events)
  const nodes = useCalendarStore((state) => state.nodes)

  const todayEvents = useMemo(
    () =>
      events
        .filter((event) => event.date === date)
        .sort((first, second) => first.startTime.localeCompare(second.startTime)),
    [date, events],
  )

  return (
    <section className={styles.card} aria-label="오늘 일정">
      <p className={styles.cardLabel}>오늘 일정</p>

      {todayEvents.length === 0 ? (
        <p className={styles.emptyText}>오늘은 등록된 일정이 없어요.</p>
      ) : (
        <div className={styles.scheduleList}>
          {todayEvents.map((event) => {
            const nodeColor = nodes.find((node) => node.id === event.categoryId)?.color

            return (
              <div key={event.id} className={styles.scheduleItem}>
                <span
                  className={styles.scheduleDot}
                  style={{ '--event-color': event.color || nodeColor } as CSSProperties}
                />
                <div className={styles.scheduleBody}>
                  <span className={styles.scheduleTitle}>{event.title}</span>
                  <span className={styles.scheduleTime}>
                    {formatRange(event.startTime, event.endTime)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
