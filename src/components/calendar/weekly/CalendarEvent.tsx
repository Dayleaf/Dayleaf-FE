import { useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import {
  clampMinute,
  getEventDuration,
  getMinuteFromPointer,
  timeToMinutes,
} from '@/lib/calendar'
import type { CalendarEvent as CalendarEventType } from '@/types/calendar'
import styles from './weeklyCalendar.module.css'

type CalendarEventProps = {
  event: CalendarEventType
  offset: number
  duration: number
  onClick: (event: CalendarEventType) => void
  onMove: (
    event: CalendarEventType,
    nextDate: string,
    startMinute: number,
    endMinute: number,
  ) => void
  onResize: (event: CalendarEventType, startMinute: number, endMinute: number) => void
}

function getTargetColumn(clientX: number, clientY: number) {
  const target = document.elementFromPoint(clientX, clientY)
  return target?.closest<HTMLElement>('[data-week-day-column="true"]')
}

const resizeThreshold = 8
const dragThreshold = 5
const interactionSnapStep = 15

function getResizeEdge(pointerEvent: PointerEvent<HTMLDivElement>) {
  const rect = pointerEvent.currentTarget.getBoundingClientRect()

  if (pointerEvent.clientY - rect.top <= resizeThreshold) {
    return 'top'
  }

  if (rect.bottom - pointerEvent.clientY <= resizeThreshold) {
    return 'bottom'
  }

  return null
}

export default function CalendarEvent({
  event,
  offset,
  duration,
  onClick,
  onMove,
  onResize,
}: CalendarEventProps) {
  const [cursorMode, setCursorMode] = useState<'move' | 'resize'>('move')

  const handlePointerDown = (pointerEvent: PointerEvent<HTMLDivElement>) => {
    if (pointerEvent.button !== 0) {
      return
    }

    pointerEvent.stopPropagation()
    pointerEvent.currentTarget.setPointerCapture(pointerEvent.pointerId)

    const resizeEdge = getResizeEdge(pointerEvent)
    const startMinute = timeToMinutes(event.startTime)
    const endMinute = timeToMinutes(event.endTime)
    const eventDuration = getEventDuration(event.startTime, event.endTime)
    const column = pointerEvent.currentTarget.closest<HTMLElement>('[data-week-day-column="true"]')
    const pointerMinute = column
      ? getMinuteFromPointer(pointerEvent.clientY, column.getBoundingClientRect(), interactionSnapStep)
      : startMinute
    const pointerOffsetMinute = pointerMinute - startMinute
    const startClientX = pointerEvent.clientX
    const startClientY = pointerEvent.clientY
    let didMove = false

    const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
      const movementX = Math.abs(moveEvent.clientX - startClientX)
      const movementY = Math.abs(moveEvent.clientY - startClientY)

      if (movementX < dragThreshold && movementY < dragThreshold) {
        return
      }

      didMove = true

      if (resizeEdge && column) {
        const pointerMinuteOnColumn = getMinuteFromPointer(
          moveEvent.clientY,
          column.getBoundingClientRect(),
          interactionSnapStep,
        )

        if (resizeEdge === 'top') {
          onResize(event, Math.min(pointerMinuteOnColumn, endMinute - 30), endMinute)
          return
        }

        onResize(event, startMinute, Math.max(pointerMinuteOnColumn, startMinute + 30))
        return
      }

      const nextColumn = getTargetColumn(moveEvent.clientX, moveEvent.clientY)

      if (!nextColumn) {
        return
      }

      const rawStartMinute =
        getMinuteFromPointer(
          moveEvent.clientY,
          nextColumn.getBoundingClientRect(),
          interactionSnapStep,
        ) -
        pointerOffsetMinute
      const nextStartMinute = clampMinute(
        Math.min(rawStartMinute, 24 * 60 - eventDuration),
      )
      const nextDate = nextColumn.dataset.date

      if (!nextDate) {
        return
      }

      onMove(event, nextDate, nextStartMinute, nextStartMinute + eventDuration)
    }

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)

      if (!didMove) {
        onClick(event)
      }
    }

    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp, { once: true })
  }

  const handleKeyDown = (keyEvent: KeyboardEvent<HTMLDivElement>) => {
    if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
      keyEvent.preventDefault()
      onClick(event)
    }
  }

  return (
    <div
      className={styles.eventBlock}
      data-cursor-mode={cursorMode}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={(pointerEvent) => {
        setCursorMode(getResizeEdge(pointerEvent) ? 'resize' : 'move')
      }}
      onPointerLeave={() => setCursorMode('move')}
      style={
        {
          '--event-color': event.color,
          '--event-offset': `${(offset / 1440) * 100}%`,
          '--event-height': `${(duration / 1440) * 100}%`,
        } as CSSProperties
      }
    >
      <span className={styles.eventTitle}>{event.title}</span>
      <span className={styles.eventTime}>
        {event.startTime} - {event.endTime}
      </span>
    </div>
  )
}
