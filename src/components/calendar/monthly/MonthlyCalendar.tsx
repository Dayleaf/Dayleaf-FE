'use client'

import { useMemo, useState } from 'react'
import { calendarCategories, getCategoryColor, getMonthDays, sampleEvents } from '@/lib/calendar'
import type { CalendarDay, CalendarEvent, CalendarEventDraft } from '@/types/calendar'
import CalendarGrid from './CalendarGrid'
import EventModal from './EventModal'
import styles from './monthlyCalendar.module.css'

const selectedMonth = '2026-06-01'

type ModalState =
  | { mode: 'create'; date: string; event?: undefined }
  | { mode: 'edit'; date: string; event: CalendarEvent }
  | null

export default function MonthlyCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>(sampleEvents)
  const [modalState, setModalState] = useState<ModalState>(null)

  const days = useMemo(() => getMonthDays(selectedMonth), [])
  const eventsByDate = useMemo(() => {
    return events.reduce<Record<string, CalendarEvent[]>>((groupedEvents, event) => {
      const dayEvents = groupedEvents[event.date] ?? []
      return {
        ...groupedEvents,
        [event.date]: [...dayEvents, event].sort((first, second) =>
          first.startTime.localeCompare(second.startTime),
        ),
      }
    }, {})
  }, [events])

  const handleCellClick = (day: CalendarDay) => {
    setModalState({ mode: 'create', date: day.key })
  }

  const handleEventClick = (event: CalendarEvent) => {
    setModalState({ mode: 'edit', date: event.date, event })
  }

  const handleSave = (draft: CalendarEventDraft) => {
    if (modalState?.mode === 'edit') {
      setEvents((currentEvents) =>
        currentEvents.map((event) =>
          event.id === modalState.event.id ? { ...draft, id: modalState.event.id } : event,
        ),
      )
      setModalState(null)
      return
    }

    setEvents((currentEvents) => [
      ...currentEvents,
      {
        ...draft,
        id: `${Date.now()}`,
      },
    ])
    setModalState(null)
  }

  const handleDelete = () => {
    if (modalState?.mode !== 'edit') {
      return
    }

    setEvents((currentEvents) =>
      currentEvents.filter((event) => event.id !== modalState.event.id),
    )
    setModalState(null)
  }

  return (
    <section className={styles.monthlyCalendar} aria-label="월간 캘린더">
      <CalendarGrid
        days={days}
        eventsByDate={eventsByDate}
        onCellClick={handleCellClick}
        onEventClick={handleEventClick}
      />
      {modalState ? (
        <EventModal
          key={modalState.mode === 'edit' ? modalState.event.id : modalState.date}
          categories={calendarCategories}
          defaultDate={modalState.date}
          event={modalState.mode === 'edit' ? modalState.event : undefined}
          getCategoryColor={getCategoryColor}
          mode={modalState.mode}
          onClose={() => setModalState(null)}
          onDelete={handleDelete}
          onSave={handleSave}
        />
      ) : null}
    </section>
  )
}
