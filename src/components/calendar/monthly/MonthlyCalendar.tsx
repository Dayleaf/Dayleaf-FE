'use client'

import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { calendarCategories, getCategoryColor, getMonthDays } from '@/lib/calendar'
import { useCalendarStore } from '@/stores/calendarStore'
import type { CalendarDay, CalendarEvent, CalendarEventDraft } from '@/types/calendar'
import CalendarGrid from './CalendarGrid'
import EventModal from './EventModal'
import styles from './monthlyCalendar.module.css'

type ModalState =
  | { mode: 'create'; date: string; event?: undefined }
  | { mode: 'edit'; date: string; event: CalendarEvent }
  | null

export default function MonthlyCalendar() {
  const events = useCalendarStore((state) => state.events)
  const addEvent = useCalendarStore((state) => state.addEvent)
  const updateEvent = useCalendarStore((state) => state.updateEvent)
  const deleteEvent = useCalendarStore((state) => state.deleteEvent)
  const [modalState, setModalState] = useState<ModalState>(null)

  const selectedMonth = useMemo(() => dayjs().format('YYYY-MM-DD'), [])
  const days = useMemo(() => getMonthDays(selectedMonth), [selectedMonth])
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
      updateEvent(modalState.event.id, draft)
      setModalState(null)
      return
    }

    addEvent(draft)
    setModalState(null)
  }

  const handleDelete = () => {
    if (modalState?.mode !== 'edit') {
      return
    }

    deleteEvent(modalState.event.id)
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
