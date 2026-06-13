import type { CalendarDay, CalendarEvent } from '@/types/calendar'
import CalendarCell from './CalendarCell'
import styles from './monthlyCalendar.module.css'

const weekdays = ['월', '화', '수', '목', '금', '토', '일']

type CalendarGridProps = {
  days: CalendarDay[]
  eventsByDate: Record<string, CalendarEvent[]>
  onCellClick: (day: CalendarDay) => void
  onEventClick: (event: CalendarEvent) => void
}

export default function CalendarGrid({
  days,
  eventsByDate,
  onCellClick,
  onEventClick,
}: CalendarGridProps) {
  return (
    <div className={styles.gridShell}>
      <div className={styles.weekHeader}>
        {weekdays.map((weekday) => (
          <div key={weekday} className={styles.weekday}>
            {weekday}
          </div>
        ))}
      </div>

      <div className={styles.monthGrid}>
        {days.map((day) => (
          <CalendarCell
            key={day.key}
            day={day}
            events={eventsByDate[day.key] ?? []}
            onCellClick={onCellClick}
            onEventClick={onEventClick}
          />
        ))}
      </div>
    </div>
  )
}
