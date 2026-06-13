'use client'

import { create } from 'zustand'
import { sampleEvents, sampleTodos } from '@/lib/calendar'
import type {
  CalendarEvent,
  CalendarEventDraft,
  CalendarTodo,
  CalendarTodoDraft,
} from '@/types/calendar'

type CalendarStore = {
  events: CalendarEvent[]
  todos: CalendarTodo[]
  addEvent: (draft: CalendarEventDraft) => CalendarEvent
  updateEvent: (eventId: string, draft: CalendarEventDraft) => void
  deleteEvent: (eventId: string) => void
  addTodo: (draft: CalendarTodoDraft) => CalendarTodo
  updateTodo: (todoId: string, draft: Partial<CalendarTodoDraft>) => void
  toggleTodo: (todoId: string) => void
  deleteTodo: (todoId: string) => void
}

function createId(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`
}

export const useCalendarStore = create<CalendarStore>((set) => ({
  events: sampleEvents,
  todos: sampleTodos,
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
    const todo = { ...draft, id: createId('todo') }

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
}))
