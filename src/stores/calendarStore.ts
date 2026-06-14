'use client'

import { create } from 'zustand'
import { sampleEvents, sampleTodos, todoCategories as initialTodoCategories } from '@/lib/calendar'
import type {
  CalendarCategory,
  CalendarEvent,
  CalendarEventDraft,
  CalendarTodo,
  CalendarTodoDraft,
} from '@/types/calendar'

type CalendarStore = {
  events: CalendarEvent[]
  todos: CalendarTodo[]
  todoCategories: CalendarCategory[]
  addEvent: (draft: CalendarEventDraft) => CalendarEvent
  updateEvent: (eventId: string, draft: CalendarEventDraft) => void
  deleteEvent: (eventId: string) => void
  addTodo: (draft: CalendarTodoDraft) => CalendarTodo
  updateTodo: (todoId: string, draft: Partial<CalendarTodoDraft>) => void
  toggleTodo: (todoId: string) => void
  deleteTodo: (todoId: string) => void
  reorderTodosByPriority: (todoIds: string[]) => void
  addTodoCategory: (label: string) => void
  updateTodoCategory: (categoryId: string, label: string) => void
  deleteTodoCategory: (categoryId: string) => void
}

function createId(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`
}

export const useCalendarStore = create<CalendarStore>((set) => ({
  events: sampleEvents,
  todos: sampleTodos.map((todo, index) => ({ ...todo, priorityOrder: index })),
  todoCategories: initialTodoCategories,
  addEvent: (draft) => {
    const event = { ...draft, id: createId('event') }

    set((state) => ({ events: [...state.events, event] }))
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
    set((state) => ({ todos: state.todos.filter((todo) => todo.id !== todoId) }))
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
