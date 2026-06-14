'use client'

import dayjs from 'dayjs'
import { create } from 'zustand'
import {
  calendarCategories as initialNodes,
  sampleRoutines,
  sampleEvents,
  sampleTodos,
  todoCategories as initialTodoCategories,
} from '@/lib/calendar'
import type {
  CalendarCategory,
  CalendarEvent,
  CalendarEventDraft,
  CalendarRoutine,
  CalendarRoutineDraft,
  CalendarTodo,
  CalendarTodoDraft,
} from '@/types/calendar'

const DEFAULT_RECURRENCE_COUNT = 12

type CalendarStore = {
  events: CalendarEvent[]
  todos: CalendarTodo[]
  routines: CalendarRoutine[]
  nodes: CalendarCategory[]
  visibleNodeIds: string[]
  todoCategories: CalendarCategory[]
  addEvent: (draft: CalendarEventDraft) => CalendarEvent
  updateEvent: (eventId: string, draft: CalendarEventDraft) => void
  deleteEvent: (eventId: string) => void
  addNode: (label: string, color: string, parentId?: string) => void
  updateNode: (
    nodeId: string,
    draft: Partial<Pick<CalendarCategory, 'label' | 'color' | 'parentId'>>,
  ) => void
  deleteNode: (nodeId: string) => void
  reorderNodes: (nodeIds: string[]) => void
  toggleNodeVisibility: (nodeId: string) => void
  addTodo: (draft: CalendarTodoDraft) => CalendarTodo
  updateTodo: (todoId: string, draft: Partial<CalendarTodoDraft>) => void
  toggleTodo: (todoId: string) => void
  deleteTodo: (todoId: string) => void
  reorderTodosByPriority: (todoIds: string[]) => void
  createRoutineFromTodo: (todoId: string, draft: Omit<CalendarRoutineDraft, 'title'>) => void
  updateRoutine: (routineId: string, draft: Partial<CalendarRoutineDraft>) => void
  completeRoutine: (routineId: string) => void
  reopenRoutine: (routineId: string) => void
  toggleRoutineDate: (routineId: string, date: string) => void
  deleteRoutine: (routineId: string) => void
  addTodoCategory: (label: string) => void
  updateTodoCategory: (categoryId: string, label: string) => void
  deleteTodoCategory: (categoryId: string) => void
}

function getRecurringDates(draft: CalendarEventDraft) {
  const recurrenceRule = draft.recurrenceRule

  if (!recurrenceRule || recurrenceRule.frequency === 'NONE') {
    return [draft.date]
  }

  const interval = recurrenceRule.interval ?? 1
  const startDate = dayjs(draft.date)
  const untilDate = recurrenceRule.until ? dayjs(recurrenceRule.until) : null
  const occurrenceCount = recurrenceRule.count ?? DEFAULT_RECURRENCE_COUNT
  const dates: string[] = []
  let cursor = startDate

  while (dates.length < occurrenceCount) {
    if (untilDate && cursor.isAfter(untilDate, 'day')) {
      break
    }

    if (recurrenceRule.frequency === 'WEEKDAYS') {
      if ([1, 2, 3, 4, 5].includes(cursor.day())) {
        dates.push(cursor.format('YYYY-MM-DD'))
      }

      cursor = cursor.add(1, 'day')
      continue
    }

    dates.push(cursor.format('YYYY-MM-DD'))

    if (recurrenceRule.frequency === 'DAILY') {
      cursor = cursor.add(interval, 'day')
      continue
    }

    if (recurrenceRule.frequency === 'MONTHLY') {
      cursor = cursor.add(interval, 'month')
      continue
    }

    cursor = cursor.add(interval, 'week')
  }

  return dates
}

function createId(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`
}

export const useCalendarStore = create<CalendarStore>((set) => ({
  events: sampleEvents,
  todos: sampleTodos.map((todo, index) => ({ ...todo, priorityOrder: index })),
  routines: sampleRoutines,
  nodes: initialNodes,
  visibleNodeIds: initialNodes.map((node) => node.id),
  todoCategories: initialTodoCategories,
  addEvent: (draft) => {
    const events = getRecurringDates(draft).map((date) => ({
      ...draft,
      date,
      id: createId('event'),
    }))
    const event = events[0]

    set((state) => ({ events: [...state.events, ...events] }))
    return event
  },
  updateEvent: (eventId, draft) => {
    set((state) => ({
      events: state.events.map((event) => (event.id === eventId ? { ...draft, id: eventId } : event)),
    }))
  },
  deleteEvent: (eventId) => {
    set((state) => ({
      events: state.events.filter((event) => event.id !== eventId),
      todos: state.todos.filter((todo) => todo.eventId !== eventId),
    }))
  },
  addNode: (label, color, parentId) => {
    const nextLabel = label.trim()

    if (!nextLabel) {
      return
    }

    const nodeId = createId('node')

    set((state) => ({
      nodes: [
        ...state.nodes,
        {
          id: nodeId,
          label: nextLabel,
          color,
          parentId,
        },
      ],
      visibleNodeIds: [...state.visibleNodeIds, nodeId],
    }))
  },
  updateNode: (nodeId, draft) => {
    const nextLabel = draft.label?.trim()

    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              ...draft,
              label: nextLabel || node.label,
            }
          : node,
      ),
      events: state.events.map((event) =>
        event.categoryId === nodeId && draft.color ? { ...event, color: draft.color } : event,
      ),
    }))
  },
  deleteNode: (nodeId) => {
    set((state) => {
      if (state.nodes.length <= 1) {
        return state
      }

      const nextNodes = state.nodes
        .filter((node) => node.id !== nodeId)
        .map((node) => (node.parentId === nodeId ? { ...node, parentId: undefined } : node))
      const fallbackNode = nextNodes[0]

      return {
        nodes: nextNodes,
        visibleNodeIds: state.visibleNodeIds.filter((visibleNodeId) => visibleNodeId !== nodeId),
        events: state.events.map((event) =>
          event.categoryId === nodeId && fallbackNode
            ? { ...event, categoryId: fallbackNode.id, color: fallbackNode.color }
            : event,
        ),
      }
    })
  },
  reorderNodes: (nodeIds) => {
    const orderMap = new Map(nodeIds.map((nodeId, index) => [nodeId, index]))

    set((state) => ({
      nodes: [...state.nodes].sort(
        (first, second) =>
          (orderMap.get(first.id) ?? state.nodes.indexOf(first)) -
          (orderMap.get(second.id) ?? state.nodes.indexOf(second)),
      ),
    }))
  },
  toggleNodeVisibility: (nodeId) => {
    set((state) => ({
      visibleNodeIds: state.visibleNodeIds.includes(nodeId)
        ? state.visibleNodeIds.filter((visibleNodeId) => visibleNodeId !== nodeId)
        : [...state.visibleNodeIds, nodeId],
    }))
  },
  addTodo: (draft) => {
    const todo = { ...draft, priorityOrder: draft.priorityOrder ?? Date.now(), id: createId('todo') }

    set((state) => ({ todos: [...state.todos, todo] }))
    return todo
  },
  updateTodo: (todoId, draft) => {
    set((state) => ({
      todos: state.todos.map((todo) => (todo.id === todoId ? { ...todo, ...draft } : todo)),
    }))
  },
  toggleTodo: (todoId) => {
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
      ),
    }))
  },
  deleteTodo: (todoId) => {
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== todoId),
      routines: state.routines.map((routine) =>
        routine.todoId === todoId ? { ...routine, todoId: undefined } : routine,
      ),
    }))
  },
  reorderTodosByPriority: (todoIds) => {
    const orderMap = new Map(todoIds.map((todoId, index) => [todoId, index]))

    set((state) => ({
      todos: state.todos.map((todo) => {
        const priorityOrder = orderMap.get(todo.id)

        return priorityOrder === undefined ? todo : { ...todo, priorityOrder }
      }),
    }))
  },
  createRoutineFromTodo: (todoId, draft) => {
    set((state) => {
      const todo = state.todos.find((candidate) => candidate.id === todoId)

      if (!todo) {
        return state
      }

      return {
        todos: state.todos.map((candidate) =>
          candidate.id === todoId
            ? {
                ...candidate,
                recurrenceRule: {
                  frequency: draft.frequency,
                  until: draft.dueDate,
                },
              }
            : candidate,
        ),
        routines: [
          ...state.routines,
          {
            ...draft,
            id: createId('routine'),
            title: todo.title,
            todoId,
            categoryId: todo.categoryId,
            completionDates: todo.completed && todo.date ? [todo.date] : [],
            createdAt: dayjs().format('YYYY-MM-DD'),
          },
        ],
      }
    })
  },
  updateRoutine: (routineId, draft) => {
    set((state) => ({
      routines: state.routines.map((routine) =>
        routine.id === routineId ? { ...routine, ...draft, title: draft.title?.trim() || routine.title } : routine,
      ),
    }))
  },
  completeRoutine: (routineId) => {
    set((state) => ({
      routines: state.routines.map((routine) =>
        routine.id === routineId
          ? {
              ...routine,
              completedAt: routine.completedAt ?? dayjs().format('YYYY-MM-DD'),
            }
          : routine,
      ),
    }))
  },
  reopenRoutine: (routineId) => {
    set((state) => ({
      routines: state.routines.map((routine) =>
        routine.id === routineId ? { ...routine, completedAt: undefined } : routine,
      ),
    }))
  },
  toggleRoutineDate: (routineId, date) => {
    set((state) => ({
      routines: state.routines.map((routine) => {
        if (routine.id !== routineId) {
          return routine
        }

        const hasDate = routine.completionDates.includes(date)

        return {
          ...routine,
          completionDates: hasDate
            ? routine.completionDates.filter((completionDate) => completionDate !== date)
            : [...routine.completionDates, date].sort(),
        }
      }),
    }))
  },
  deleteRoutine: (routineId) => {
    set((state) => ({ routines: state.routines.filter((routine) => routine.id !== routineId) }))
  },
  addTodoCategory: (label) => {
    const nextLabel = label.trim()

    if (!nextLabel) {
      return
    }

    set((state) => ({
      todoCategories: [
        ...state.todoCategories,
        {
          id: createId('todo-category'),
          label: nextLabel,
          color: 'var(--color-text-subtle)',
        },
      ],
    }))
  },
  updateTodoCategory: (categoryId, label) => {
    const nextLabel = label.trim()

    if (!nextLabel) {
      return
    }

    set((state) => ({
      todoCategories: state.todoCategories.map((category) =>
        category.id === categoryId ? { ...category, label: nextLabel } : category,
      ),
    }))
  },
  deleteTodoCategory: (categoryId) => {
    set((state) => {
      if (state.todoCategories.length <= 1) {
        return state
      }

      const nextCategories = state.todoCategories.filter((category) => category.id !== categoryId)
      const fallbackCategoryId = nextCategories[0]?.id

      return {
        todoCategories: nextCategories,
        todos: state.todos.map((todo) =>
          todo.categoryId === categoryId ? { ...todo, categoryId: fallbackCategoryId } : todo,
        ),
      }
    })
  },
}))
