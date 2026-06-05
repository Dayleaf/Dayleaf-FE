'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  calendarCategories,
  getCategoryColor,
  getTimeSlots,
  getWeekDays,
  minutesToTime,
  sampleEvents,
  sampleTodos,
} from '@/lib/calendar'
import type { CalendarDay, CalendarEvent, CalendarEventDraft, CalendarTodo } from '@/types/calendar'
import EventModal from './EventModal'
import TodoPanel from './TodoPanel'
import WeekDayHeader from './WeekDayHeader'
import WeeklyGrid from './WeeklyGrid'
import styles from './weeklyCalendar.module.css'

const selectedWeek = '2026-06-05'

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
  const [events, setEvents] = useState<CalendarEvent[]>(sampleEvents)
  const [todos, setTodos] = useState<CalendarTodo[]>(sampleTodos)
  const [modalState, setModalState] = useState<ModalState>(null)
  const [selection, setSelection] = useState<SelectionState | null>(null)

  const days = useMemo(() => getWeekDays(selectedWeek), [])
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
      setEvents((currentEvents) =>
        currentEvents.map((event) =>
          event.id === modalState.event.id ? { ...draft, id: modalState.event.id } : event,
        ),
      )
      setModalState(null)
      setSelection(null)
      return
    }

    setEvents((currentEvents) => [...currentEvents, { ...draft, id: `${Date.now()}` }])
    setModalState(null)
    setSelection(null)
  }

  const handleMoveEvent = (
    targetEvent: CalendarEvent,
    nextDate: string,
    startMinute: number,
    endMinute: number,
  ) => {
    setEvents((currentEvents) =>
      currentEvents.map((event) =>
        event.id === targetEvent.id
          ? {
              ...event,
              date: nextDate,
              startTime: minutesToTime(startMinute),
              endTime: minutesToTime(endMinute),
            }
          : event,
      ),
    )
  }

  const handleResizeEvent = (
    targetEvent: CalendarEvent,
    startMinute: number,
    endMinute: number,
  ) => {
    setEvents((currentEvents) =>
      currentEvents.map((event) =>
        event.id === targetEvent.id
          ? {
              ...event,
              startTime: minutesToTime(startMinute),
              endTime: minutesToTime(endMinute),
            }
          : event,
      ),
    )
  }

  const handleDeleteEvent = () => {
    if (modalState?.mode !== 'edit') {
      return
    }

    setEvents((currentEvents) =>
      currentEvents.filter((event) => event.id !== modalState.event.id),
    )
    setModalState(null)
  }

  const handleCloseModal = () => {
    setModalState(null)
    setSelection(null)
  }

  const handleAddTodo = (title: string, createdAt: string) => {
    setTodos((currentTodos) => [
      ...currentTodos,
      {
        id: `${Date.now()}`,
        title,
        completed: false,
        createdAt,
      },
    ])
  }

  const handleToggleTodo = (todoId: string) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
      ),
    )
  }

  const handleUpdateTodo = (todoId: string, title: string) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) => (todo.id === todoId ? { ...todo, title } : todo)),
    )
  }

  const handleDeleteTodo = (todoId: string) => {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== todoId))
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
