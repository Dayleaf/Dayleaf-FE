import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import {
  getEventDuration,
  getEventOffset,
  getMinuteFromPointer,
  minutesToTime,
} from '@/lib/calendar'
import type { CalendarDay, CalendarEvent as CalendarEventType } from '@/types/calendar'
import CalendarEvent from './CalendarEvent'
import styles from './weeklyCalendar.module.css'

type DayColumnProps = {
  day: CalendarDay
  events: CalendarEventType[]
  selection: { startMinute: number; endMinute: number } | null
  timeSlots: string[]
  onCreateEvent: (day: CalendarDay, startMinute: number, endMinute: number) => void
  onEditEvent: (event: CalendarEventType) => void
  onMoveEvent: (
    event: CalendarEventType,
    nextDate: string,
    startMinute: number,
    endMinute: number,
  ) => void
  onResizeEnd: () => void
  onResizeEvent: (event: CalendarEventType, startMinute: number, endMinute: number) => void
}

type SelectionState = {
  anchorMinute: number
  clickMinute: number
  isDragging: boolean
  startClientX: number
  startClientY: number
  startMinute: number
  endMinute: number
}

const clickThreshold = 5
const dragSnapStep = 15

export default function DayColumn({
  day,
  events,
  selection,
  timeSlots,
  onCreateEvent,
  onEditEvent,
  onMoveEvent,
  onResizeEnd,
  onResizeEvent,
}: DayColumnProps) {
  const columnRef = useRef<HTMLDivElement>(null)
  const [draftSelection, setDraftSelection] = useState<SelectionState | null>(null)

  const getColumnRect = () => columnRef.current?.getBoundingClientRect()

  const handlePointerDown = (pointerEvent: PointerEvent<HTMLElement>, startHour: number) => {
    if (pointerEvent.button !== 0) {
      return
    }

    pointerEvent.stopPropagation()
    pointerEvent.currentTarget.setPointerCapture(pointerEvent.pointerId)
    const rect = getColumnRect()

    if (!rect) {
      return
    }

    const dragMinute = Math.min(
      getMinuteFromPointer(pointerEvent.clientY, rect, dragSnapStep),
      24 * 60 - 15,
    )
    const clickMinute = Math.min(startHour * 60, 24 * 60 - 60)

    setDraftSelection({
      anchorMinute: dragMinute,
      clickMinute,
      isDragging: false,
      startClientX: pointerEvent.clientX,
      startClientY: pointerEvent.clientY,
      startMinute: dragMinute,
      endMinute: Math.min(dragMinute + 15, 24 * 60),
    })
  }

  const handlePointerMove = (pointerEvent: PointerEvent<HTMLElement>) => {
    if (!draftSelection) {
      return
    }

    const movementX = Math.abs(pointerEvent.clientX - draftSelection.startClientX)
    const movementY = Math.abs(pointerEvent.clientY - draftSelection.startClientY)

    if (
      !draftSelection.isDragging &&
      movementX <= clickThreshold &&
      movementY <= clickThreshold
    ) {
      return
    }

    const rect = getColumnRect()

    if (!rect) {
      return
    }

    const nextMinute = getMinuteFromPointer(pointerEvent.clientY, rect, dragSnapStep)
    const startMinute = Math.min(draftSelection.anchorMinute, nextMinute)
    const endMinute = Math.max(draftSelection.anchorMinute, nextMinute)

    setDraftSelection({
      ...draftSelection,
      isDragging: true,
      startMinute,
      endMinute: endMinute === startMinute ? startMinute + 15 : endMinute,
    })
  }

  const handlePointerUp = (pointerEvent: PointerEvent<HTMLElement>) => {
    if (!draftSelection) {
      return
    }

    if (pointerEvent.currentTarget.hasPointerCapture(pointerEvent.pointerId)) {
      pointerEvent.currentTarget.releasePointerCapture(pointerEvent.pointerId)
    }

    const movementX = Math.abs(pointerEvent.clientX - draftSelection.startClientX)
    const movementY = Math.abs(pointerEvent.clientY - draftSelection.startClientY)
    const isClick =
      !draftSelection.isDragging && movementX <= clickThreshold && movementY <= clickThreshold
    const startMinute = isClick ? draftSelection.clickMinute : draftSelection.startMinute
    const minimumDuration = isClick ? 60 : 15
    const endMinute = isClick
      ? Math.min(startMinute + 60, 24 * 60)
      : Math.min(Math.max(draftSelection.endMinute, startMinute + minimumDuration), 24 * 60)

    setDraftSelection(null)
    onCreateEvent(day, startMinute, endMinute)
  }

  const visibleSelection = draftSelection?.isDragging ? draftSelection : selection

  return (
    <div
      ref={columnRef}
      className={styles.dayColumn}
      data-week-day-column="true"
      data-date={day.key}
      aria-label={`${day.key} 일정 추가`}
    >
      <div className={styles.hourLines}>
        {timeSlots.map((time) => (
          <span key={time} className={styles.hourLine} />
        ))}
      </div>
      <div className={styles.hourHoverGrid}>
        {timeSlots.map((time, index) => (
          <button
            key={time}
            className={styles.hourHoverSlot}
            type="button"
            aria-label={`${day.key} ${time} 일정 추가`}
            onPointerDown={(pointerEvent) => handlePointerDown(pointerEvent, index)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
        ))}
      </div>
      {visibleSelection ? (
        <span
          className={styles.selectionBlock}
          style={
            {
              '--selection-offset': `${(visibleSelection.startMinute / 1440) * 100}%`,
              '--selection-height': `${((visibleSelection.endMinute - visibleSelection.startMinute) / 1440) * 100}%`,
            } as CSSProperties
          }
        >
          {minutesToTime(visibleSelection.startMinute)} - {minutesToTime(visibleSelection.endMinute)}
        </span>
      ) : null}
      {events.map((event) => (
        <CalendarEvent
          key={event.id}
          event={event}
          duration={getEventDuration(event.startTime, event.endTime)}
          offset={getEventOffset(event.startTime)}
          onClick={onEditEvent}
          onMove={onMoveEvent}
          onResizeEnd={onResizeEnd}
          onResize={onResizeEvent}
        />
      ))}
    </div>
  )
}
