'use client'

import { create } from 'zustand'
import {
  calendarCategories as initialNodes,
  sampleEvents,
  sampleTodos,
  todoCategories as initialTodoCategories,
} from '@/lib/calendar'
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
  nodes: initialNodes,
  visibleNodeIds: initialNodes.map((node) => node.id),
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
