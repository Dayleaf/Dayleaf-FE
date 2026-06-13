'use client'

import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  calendarCategories,
  getCategoryColor,
  getTimeSlots,
  getWeekDays,
  minutesToTime,
} from '@/lib/calendar'
import { useCalendarStore } from '@/stores/calendarStore'
import type { CalendarDay, CalendarEvent, CalendarEventDraft } from '@/types/calendar'
import EventModal from './EventModal'
import TodoPanel from './TodoPanel'
import WeekDayHeader from './WeekDayHeader'
import WeeklyGrid from './WeeklyGrid'
import styles from './weeklyCalendar.module.css'

type ModalState =
  | { mode: 'create'; date: string; startTime: string; endTime: string; event?: undefined }
  | { mode: 'edit'; event: CalendarEvent }
  | null

type SelectionState = {
  date: string
  startMinute: number
  endMinute: number
}

export default function WeeklyCalendar() {
  const searchParams = useSearchParams()
  const isTodoOpen = searchParams.get('todo') === 'open'
  const events = useCalendarStore((state) => state.events)
  const todos = useCalendarStore((state) => state.todos)
  const addEvent = useCalendarStore((state) => state.addEvent)
  const updateEvent = useCalendarStore((state) => state.updateEvent)
  const deleteEvent = useCalendarStore((state) => state.deleteEvent)
  const addTodo = useCalendarStore((state) => state.addTodo)
  const updateTodo = useCalendarStore((state) => state.updateTodo)
  const toggleTodo = useCalendarStore((state) => state.toggleTodo)
  const deleteTodo = useCalendarStore((state) => state.deleteTodo)
  const [modalState, setModalState] = useState<ModalState>(null)
  const [selection, setSelection] = useState<SelectionState | null>(null)

  const selectedWeek = useMemo(() => dayjs().format('YYYY-MM-DD'), [])
  const days = useMemo(() => getWeekDays(selectedWeek), [selectedWeek])
  const timeSlots = useMemo(() => getTimeSlots(), [])
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

  const handleCreateEvent = (day: CalendarDay, startMinute: number, endMinute: number) => {
    setSelection({ date: day.key, startMinute, endMinute })
    setModalState({
      mode: 'create',
      date: day.key,
      startTime: minutesToTime(startMinute),
      endTime: minutesToTime(endMinute),
    })
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setModalState({ mode: 'edit', event })
  }

  const handleSaveEvent = (draft: CalendarEventDraft) => {
    if (modalState?.mode === 'edit') {
      updateEvent(modalState.event.id, draft)
      setModalState(null)
      setSelection(null)
      return
    }

    addEvent(draft)
    setModalState(null)
    setSelection(null)
  }

  const handleMoveEvent = (
    targetEvent: CalendarEvent,
    nextDate: string,
    startMinute: number,
    endMinute: number,
  ) => {
    updateEvent(targetEvent.id, {
      ...targetEvent,
      date: nextDate,
      startTime: minutesToTime(startMinute),
      endTime: minutesToTime(endMinute),
    })
  }

  const handleResizeEvent = (
    targetEvent: CalendarEvent,
    startMinute: number,
    endMinute: number,
  ) => {
    updateEvent(targetEvent.id, {
      ...targetEvent,
      startTime: minutesToTime(startMinute),
      endTime: minutesToTime(endMinute),
    })
  }

  const handleResizeEnd = () => {
    setSelection(null)
  }

  const handleDeleteEvent = () => {
    if (modalState?.mode !== 'edit') {
      return
    }

    deleteEvent(modalState.event.id)
    setModalState(null)
  }

  const handleCloseModal = () => {
    setModalState(null)
    setSelection(null)
  }

  const handleAddTodo = (title: string, createdAt: string) => {
    addTodo({
      title,
      completed: false,
      date: createdAt,
      categoryId: 'study',
      createdAt,
    })
  }

  const handleToggleTodo = (todoId: string) => {
    toggleTodo(todoId)
  }

  const handleUpdateTodo = (todoId: string, title: string) => {
    updateTodo(todoId, { title })
  }

  const handleDeleteTodo = (todoId: string) => {
    deleteTodo(todoId)
  }

  return (
    <section className={styles.weeklyCalendar} aria-label="주간 캘린더">
      <WeekDayHeader days={days} />
      {isTodoOpen ? (
        <TodoPanel
          days={days}
          todos={todos}
          onAddTodo={handleAddTodo}
          onDeleteTodo={handleDeleteTodo}
          onToggleTodo={handleToggleTodo}
          onUpdateTodo={handleUpdateTodo}
        />
      ) : null}
      <WeeklyGrid
        days={days}
        eventsByDate={eventsByDate}
        selection={selection}
        timeSlots={timeSlots}
        onCreateEvent={handleCreateEvent}
        onEditEvent={handleEditEvent}
        onMoveEvent={handleMoveEvent}
        onResizeEnd={handleResizeEnd}
        onResizeEvent={handleResizeEvent}
      />
      {modalState ? (
        <EventModal
          key={
            modalState.mode === 'edit'
              ? modalState.event.id
              : `${modalState.date}-${modalState.startTime}`
          }
          categories={calendarCategories}
          defaultDate={modalState.mode === 'edit' ? modalState.event.date : modalState.date}
          defaultEndTime={modalState.mode === 'edit' ? modalState.event.endTime : modalState.endTime}
          defaultStartTime={
            modalState.mode === 'edit' ? modalState.event.startTime : modalState.startTime
          }
          event={modalState.mode === 'edit' ? modalState.event : undefined}
          getCategoryColor={getCategoryColor}
          mode={modalState.mode}
          onClose={handleCloseModal}
          onDelete={handleDeleteEvent}
          onSave={handleSaveEvent}
        />
      ) : null}
    </section>
  )
}
