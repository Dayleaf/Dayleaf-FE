'use client'

import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  getTimeSlots,
  getWeekDays,
  minutesToTime,
} from '@/lib/calendar'
import { useCalendarStore } from '@/stores/calendarStore'
import type { CalendarDay, CalendarEvent, CalendarEventDraft, CalendarTodo, CalendarTodoDraft } from '@/types/calendar'
import EventTodoList from '../daily/EventTodoList'
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
  const nodes = useCalendarStore((state) => state.nodes)
  const visibleNodeIds = useCalendarStore((state) => state.visibleNodeIds)
  const todoCategories = useCalendarStore((state) => state.todoCategories)
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
  const [draftTodos, setDraftTodos] = useState<CalendarTodo[]>([])

  const selectedWeek = useMemo(
    () => searchParams.get('date') ?? dayjs().format('YYYY-MM-DD'),
    [searchParams],
  )
  const days = useMemo(() => getWeekDays(selectedWeek), [selectedWeek])
  const timeSlots = useMemo(() => getTimeSlots(), [])
  const visibleCategoryIds = useMemo(() => {
    const visibleIdSet = new Set(visibleNodeIds)
    const isNodeVisible = (nodeId: string): boolean => {
      if (!visibleIdSet.has(nodeId)) {
        return false
      }

      const node = nodes.find((candidate) => candidate.id === nodeId)

      return node?.parentId ? isNodeVisible(node.parentId) : true
    }

    return new Set(nodes.filter((node) => isNodeVisible(node.id)).map((node) => node.id))
  }, [nodes, visibleNodeIds])
  const eventsByDate = useMemo(() => {
    return events
      .filter((event) => !event.categoryId || visibleCategoryIds.has(event.categoryId))
      .reduce<Record<string, CalendarEvent[]>>((groupedEvents, event) => {
      const dayEvents = groupedEvents[event.date] ?? []
      return {
        ...groupedEvents,
        [event.date]: [...dayEvents, event].sort((first, second) =>
          first.startTime.localeCompare(second.startTime),
        ),
      }
      }, {})
  }, [events, visibleCategoryIds])
  const visibleEventIds = useMemo(
    () =>
      new Set(
        events
          .filter((event) => !event.categoryId || visibleCategoryIds.has(event.categoryId))
          .map((event) => event.id),
      ),
    [events, visibleCategoryIds],
  )
  const visibleTodos = useMemo(
    () => todos.filter((todo) => !todo.eventId || visibleEventIds.has(todo.eventId)),
    [todos, visibleEventIds],
  )
  const getNodeColor = (nodeId: string) =>
    nodes.find((node) => node.id === nodeId)?.color ?? 'var(--color-brand)'

  const handleCreateEvent = (day: CalendarDay, startMinute: number, endMinute: number) => {
    setDraftTodos([])
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

    const event = addEvent(draft)
    draftTodos.forEach((todo) => {
      addTodo({
        title: todo.title,
        completed: todo.completed,
        date: draft.date,
        categoryId: todo.categoryId ?? todoCategories[0]?.id,
        eventId: event.id,
        priority: todo.priority,
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
    setDraftTodos([])
  }

  const handleAddTodo = (title: string, createdAt: string, categoryId: string) => {
    addTodo({
      title,
      completed: false,
      date: createdAt,
      categoryId,
      createdAt,
    })
  }

  const handleToggleTodo = (todoId: string) => {
    toggleTodo(todoId)
  }

  const handleUpdateTodo = (todoId: string, draft: Partial<CalendarTodoDraft>) => {
    updateTodo(todoId, draft)
  }

  const handleDeleteTodo = (todoId: string) => {
    deleteTodo(todoId)
  }
  const editingEventTodos = useMemo(() => {
    if (modalState?.mode !== 'edit') {
      return []
    }

    return todos.filter((todo) => todo.eventId === modalState.event.id)
  }, [modalState, todos])
  const createDraftTodoId = () => {
    return `draft-todo-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`
  }
  const handleAddDraftTodo = (title: string, categoryId: string) => {
    const fallbackDate = modalState?.mode === 'create' ? modalState.date : selectedWeek

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
    <section className={styles.weeklyCalendar} aria-label="주간 캘린더">
      <WeekDayHeader days={days} />
      {isTodoOpen ? (
        <TodoPanel
          categories={todoCategories}
          days={days}
          todos={visibleTodos}
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
          categories={nodes}
          defaultDate={modalState.mode === 'edit' ? modalState.event.date : modalState.date}
          defaultEndTime={modalState.mode === 'edit' ? modalState.event.endTime : modalState.endTime}
          defaultStartTime={
            modalState.mode === 'edit' ? modalState.event.startTime : modalState.startTime
          }
          event={modalState.mode === 'edit' ? modalState.event : undefined}
          getCategoryColor={getNodeColor}
          linkedTodosSlot={
            modalState.mode === 'edit' ? (
              <EventTodoList
                categories={todoCategories}
                defaultCategoryId={editingEventTodos[0]?.categoryId ?? todoCategories[0]?.id}
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
                defaultCategoryId={todoCategories[0]?.id}
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
