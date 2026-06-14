'use client'

import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import {
  calendarCategories,
  getCategoryColor,
  getTimeSlots,
  minutesToTime,
} from '@/lib/calendar'
import { useCalendarStore } from '@/stores/calendarStore'
import type {
  CalendarDay,
  CalendarEvent,
  CalendarEventDraft,
  CalendarTodo,
  CalendarTodoDraft,
} from '@/types/calendar'
import DayColumn from '../weekly/DayColumn'
import EventModal from '../weekly/EventModal'
import TimeColumn from '../weekly/TimeColumn'
import DailyTodoPanel from './DailyTodoPanel'
import EventTodoList from './EventTodoList'
import styles from './dailyCalendar.module.css'

type DailyCalendarProps = {
  date?: string
}

type ModalState =
  | { mode: 'create'; date: string; startTime: string; endTime: string; event?: undefined }
  | { mode: 'edit'; event: CalendarEvent }
  | null

type SelectionState = {
  date: string
  startMinute: number
  endMinute: number
}

function getDailyDay(date: string): CalendarDay {
  const targetDate = dayjs(date)

  return {
    key: targetDate.format('YYYY-MM-DD'),
    date: targetDate,
    dayNumber: targetDate.date(),
    isCurrentMonth: true,
    isToday: targetDate.isSame(dayjs(), 'day'),
  }
}

export default function DailyCalendar({ date }: DailyCalendarProps) {
  const events = useCalendarStore((state) => state.events)
  const todos = useCalendarStore((state) => state.todos)
  const addEvent = useCalendarStore((state) => state.addEvent)
  const updateEvent = useCalendarStore((state) => state.updateEvent)
  const deleteEvent = useCalendarStore((state) => state.deleteEvent)
  const addTodo = useCalendarStore((state) => state.addTodo)
  const updateTodo = useCalendarStore((state) => state.updateTodo)
  const toggleTodo = useCalendarStore((state) => state.toggleTodo)
  const deleteTodo = useCalendarStore((state) => state.deleteTodo)
  const todoCategories = useCalendarStore((state) => state.todoCategories)
  const [modalState, setModalState] = useState<ModalState>(null)
  const [selection, setSelection] = useState<SelectionState | null>(null)
  const [draftTodos, setDraftTodos] = useState<CalendarTodo[]>([])

  const selectedDate = useMemo(() => date ?? dayjs().format('YYYY-MM-DD'), [date])
  const day = useMemo(() => getDailyDay(selectedDate), [selectedDate])
  const timeSlots = useMemo(() => getTimeSlots(), [])
  const dayEvents = useMemo(() => {
    return events
      .filter((event) => event.date === day.key)
      .sort((first, second) => first.startTime.localeCompare(second.startTime))
  }, [day.key, events])
  const editingEventTodos = useMemo(() => {
    if (modalState?.mode !== 'edit') {
      return []
    }

    return todos.filter((todo) => todo.eventId === modalState.event.id)
  }, [modalState, todos])

  const createDraftTodoId = () => {
    return `draft-todo-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`
  }

  const handleCreateEvent = (targetDay: CalendarDay, startMinute: number, endMinute: number) => {
    setDraftTodos([])
    setSelection({ date: targetDay.key, startMinute, endMinute })
    setModalState({
      mode: 'create',
      date: targetDay.key,
      startTime: minutesToTime(startMinute),
      endTime: minutesToTime(endMinute),
    })
  }

  const handleSaveEvent = (draft: CalendarEventDraft) => {
    if (modalState?.mode === 'edit') {
      updateEvent(modalState.event.id, draft)
      setModalState(null)
      setSelection(null)
      return
    }

    const event = addEvent(draft)

    draftTodos.forEach((todo) => {
      addTodo({
        title: todo.title,
        completed: todo.completed,
        date: draft.date,
        categoryId: todo.categoryId ?? todoCategories[0].id,
        eventId: event.id,
        priority: todo.priority,
        recurrenceRule: todo.recurrenceRule,
        createdAt: draft.date,
      })
    })

    setDraftTodos([])
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
    setDraftTodos([])
  }

  const handleAddDraftTodo = (title: string, categoryId: string) => {
    const fallbackDate = modalState?.mode === 'create' ? modalState.date : day.key

    setDraftTodos((currentTodos) => [
      ...currentTodos,
      {
        id: createDraftTodoId(),
        title,
        completed: false,
        date: fallbackDate,
        categoryId,
        priority: 'MEDIUM',
        createdAt: fallbackDate,
      },
    ])
  }

  const handleUpdateDraftTodo = (todoId: string, draft: Partial<CalendarTodoDraft>) => {
    setDraftTodos((currentTodos) =>
      currentTodos.map((todo) => (todo.id === todoId ? { ...todo, ...draft } : todo)),
    )
  }

  const handleToggleDraftTodo = (todoId: string) => {
    setDraftTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
      ),
    )
  }

  const handleDeleteDraftTodo = (todoId: string) => {
    setDraftTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== todoId))
  }

  return (
    <section className={styles.dailyCalendar} aria-label="일간 캘린더">
      <aside className={styles.todoArea}>
        <DailyTodoPanel date={day.key} />
      </aside>
      <section className={styles.timeTable} aria-label={`${day.key} 시간표`}>
        <header className={styles.dayHeader}>
          <div className={styles.timeHeader} />
          <div className={styles.dayHeaderCell}>
            <span className={styles.weekday}>{day.date.format('ddd')}</span>
            <span className={day.isToday ? styles.todayDate : styles.dateNumber}>
              {day.dayNumber}
            </span>
          </div>
        </header>
        <div className={styles.dayGrid}>
          <TimeColumn timeSlots={timeSlots} />
          <div className={styles.dayColumnWrap}>
            <DayColumn
              day={day}
              events={dayEvents}
              selection={selection?.date === day.key ? selection : null}
              timeSlots={timeSlots}
              onCreateEvent={handleCreateEvent}
              onEditEvent={(event) => setModalState({ mode: 'edit', event })}
              onMoveEvent={handleMoveEvent}
              onResizeEnd={() => setSelection(null)}
              onResizeEvent={handleResizeEvent}
            />
          </div>
        </div>
      </section>
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
          linkedTodosSlot={
            modalState.mode === 'edit' ? (
              <EventTodoList
                categories={todoCategories}
                defaultCategoryId={editingEventTodos[0]?.categoryId ?? todoCategories[0].id}
                todos={editingEventTodos}
                onAddTodo={(title, categoryId) =>
                  addTodo({
                    title,
                    completed: false,
                    date: modalState.event.date,
                    categoryId,
                    eventId: modalState.event.id,
                    priority: 'MEDIUM',
                    createdAt: modalState.event.date,
                  })
                }
                onDeleteTodo={deleteTodo}
                onToggleTodo={toggleTodo}
                onUpdateTodo={updateTodo}
              />
            ) : (
              <EventTodoList
                categories={todoCategories}
                defaultCategoryId={todoCategories[0].id}
                todos={draftTodos}
                onAddTodo={handleAddDraftTodo}
                onDeleteTodo={handleDeleteDraftTodo}
                onToggleTodo={handleToggleDraftTodo}
                onUpdateTodo={handleUpdateDraftTodo}
              />
            )
          }
          mode={modalState.mode}
          onClose={handleCloseModal}
          onDelete={handleDeleteEvent}
          onSave={handleSaveEvent}
        />
      ) : null}
    </section>
  )
}
