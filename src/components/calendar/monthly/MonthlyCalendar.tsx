'use client'

import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { useSearchParams } from 'next/navigation'
import { getMonthDays } from '@/lib/calendar'
import { useCalendarStore } from '@/stores/calendarStore'
import type { CalendarDay, CalendarEvent, CalendarEventDraft, CalendarTodo, CalendarTodoDraft } from '@/types/calendar'
import EventTodoList from '../daily/EventTodoList'
import CalendarGrid from './CalendarGrid'
import EventModal from './EventModal'
import styles from './monthlyCalendar.module.css'

type ModalState =
  | { mode: 'create'; date: string; event?: undefined }
  | { mode: 'edit'; date: string; event: CalendarEvent }
  | null

export default function MonthlyCalendar() {
  const searchParams = useSearchParams()
  const events = useCalendarStore((state) => state.events)
  const nodes = useCalendarStore((state) => state.nodes)
  const visibleNodeIds = useCalendarStore((state) => state.visibleNodeIds)
  const todos = useCalendarStore((state) => state.todos)
  const todoCategories = useCalendarStore((state) => state.todoCategories)
  const addEvent = useCalendarStore((state) => state.addEvent)
  const updateEvent = useCalendarStore((state) => state.updateEvent)
  const deleteEvent = useCalendarStore((state) => state.deleteEvent)
  const addTodo = useCalendarStore((state) => state.addTodo)
  const updateTodo = useCalendarStore((state) => state.updateTodo)
  const toggleTodo = useCalendarStore((state) => state.toggleTodo)
  const deleteTodo = useCalendarStore((state) => state.deleteTodo)
  const [modalState, setModalState] = useState<ModalState>(null)
  const [draftTodos, setDraftTodos] = useState<CalendarTodo[]>([])

  const selectedMonth = useMemo(
    () => searchParams.get('date') ?? dayjs().format('YYYY-MM-DD'),
    [searchParams],
  )
  const days = useMemo(() => getMonthDays(selectedMonth), [selectedMonth])
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
      .filter((event) => visibleCategoryIds.has(event.categoryId))
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
  const getNodeColor = (nodeId: string) =>
    nodes.find((node) => node.id === nodeId)?.color ?? 'var(--color-brand)'

  const handleCellClick = (day: CalendarDay) => {
    setDraftTodos([])
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
  }

  const handleDelete = () => {
    if (modalState?.mode !== 'edit') {
      return
    }

    deleteEvent(modalState.event.id)
    setModalState(null)
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
    const fallbackDate = modalState?.date ?? selectedMonth

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
  const handleCloseModal = () => {
    setModalState(null)
    setDraftTodos([])
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
          categories={nodes}
          defaultDate={modalState.date}
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
          onDelete={handleDelete}
          onSave={handleSave}
        />
      ) : null}
    </section>
  )
}
