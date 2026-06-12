import type { KeyboardEvent } from 'react'
import type { CalendarDay, CalendarEvent } from '@/types/calendar'
import EventChip from './EventChip'
import styles from './monthlyCalendar.module.css'

type CalendarCellProps = {
  day: CalendarDay
  events: CalendarEvent[]
  onCellClick: (day: CalendarDay) => void
  onEventClick: (event: CalendarEvent) => void
}

export default function CalendarCell({
  day,
  events,
  onCellClick,
  onEventClick,
}: CalendarCellProps) {
  const visibleEvents = events.slice(0, 3)
  const hiddenCount = events.length - visibleEvents.length

  const handleKeyDown = (keyEvent: KeyboardEvent<HTMLDivElement>) => {
    if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
      keyEvent.preventDefault()
      onCellClick(day)
    }
  }

  return (
    <div
      className={`${styles.dayCell} ${day.isCurrentMonth ? '' : styles.outsideMonth}`}
      onClick={() => onCellClick(day)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${day.key} 일정 추가`}
    >
      <span className={styles.dayHeader}>
        <span className={day.isToday ? styles.today : styles.dayNumber}>{day.dayNumber}</span>
      </span>

      <span className={styles.eventList}>
        {visibleEvents.map((event) => (
          <EventChip key={event.id} event={event} onClick={onEventClick} />
        ))}
        {hiddenCount > 0 ? <span className={styles.moreButton}>+{hiddenCount}개 더보기</span> : null}
      </span>
    </div>
  )
}
