import type { CSSProperties, MouseEvent } from 'react'
import type { CalendarEvent } from '@/types/calendar'
import styles from './monthlyCalendar.module.css'

type EventChipProps = {
  event: CalendarEvent
  onClick: (event: CalendarEvent) => void
}

export default function EventChip({ event, onClick }: EventChipProps) {
  const handleClick = (clickEvent: MouseEvent<HTMLSpanElement>) => {
    clickEvent.stopPropagation()
    onClick(event)
  }

  return (
    <span
      className={styles.eventChip}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      style={{ '--event-color': event.color } as CSSProperties}
      onKeyDown={(keyEvent) => {
        keyEvent.stopPropagation()
        if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
          keyEvent.preventDefault()
          onClick(event)
        }
      }}
    >
      <span className={styles.eventDot} />
      <span className={styles.eventTime}>{event.startTime}</span>
      <span className={styles.eventTitle}>{event.title}</span>
    </span>
  )
}
