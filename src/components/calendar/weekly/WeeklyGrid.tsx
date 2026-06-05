import type { CalendarDay, CalendarEvent } from '@/types/calendar'
import DayColumn from './DayColumn'
import TimeColumn from './TimeColumn'
import styles from './weeklyCalendar.module.css'

type WeeklyGridProps = {
  days: CalendarDay[]
  eventsByDate: Record<string, CalendarEvent[]>
  selection: { date: string; startMinute: number; endMinute: number } | null
  timeSlots: string[]
  onCreateEvent: (day: CalendarDay, startMinute: number, endMinute: number) => void
  onEditEvent: (event: CalendarEvent) => void
  onMoveEvent: (
    event: CalendarEvent,
    nextDate: string,
    startMinute: number,
    endMinute: number,
  ) => void
  onResizeEnd: () => void
  onResizeEvent: (event: CalendarEvent, startMinute: number, endMinute: number) => void
}

export default function WeeklyGrid({
  days,
  eventsByDate,
  selection,
  timeSlots,
  onCreateEvent,
  onEditEvent,
  onMoveEvent,
  onResizeEnd,
  onResizeEvent,
}: WeeklyGridProps) {
  return (
    <div className={styles.weekGrid}>
      <TimeColumn timeSlots={timeSlots} />
      <div className={styles.dayColumns}>
        {days.map((day) => (
          <DayColumn
            key={day.key}
            day={day}
            events={eventsByDate[day.key] ?? []}
            selection={selection?.date === day.key ? selection : null}
            timeSlots={timeSlots}
            onCreateEvent={onCreateEvent}
            onEditEvent={onEditEvent}
            onMoveEvent={onMoveEvent}
            onResizeEnd={onResizeEnd}
            onResizeEvent={onResizeEvent}
          />
        ))}
      </div>
    </div>
  )
}
