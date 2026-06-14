import type dayjs from 'dayjs'

export type CalendarView = 'day' | 'week' | 'month'

export type CalendarCategory = {
  id: string
  label: string
  color: string
  parentId?: string
}

export type WeekDayCode = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU'

export type RecurrenceFrequency =
  | 'NONE'
  | 'DAILY'
  | 'WEEKLY'
  | 'WEEKDAYS'
  | 'MONTHLY'
  | 'CUSTOM'

export type RecurrenceRule = {
  frequency: RecurrenceFrequency
  interval?: number
  byWeekDay?: WeekDayCode[]
  until?: string
  count?: number
}

export type CalendarEvent = {
  id: string
  title: string
  description?: string
  date: string
  startTime: string
  endTime: string
  categoryId: string
  color: string
  recurrenceRule?: RecurrenceRule
}

export type CalendarTodo = {
  id: string
  title: string
  completed: boolean
  date?: string
  categoryId?: string
  nodeId?: string
  eventId?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  priorityOrder?: number
  recurrenceRule?: RecurrenceRule
  createdAt: string
}

export type RoutineFrequency = 'DAILY' | 'WEEKLY' | 'WEEKDAYS' | 'MONTHLY'

export type CalendarRoutine = {
  id: string
  title: string
  todoId?: string
  categoryId?: string
  frequency: RoutineFrequency
  startDate: string
  dueDate: string
  completedAt?: string
  completionDates: string[]
  createdAt: string
}

export type CalendarRoutineDraft = Omit<CalendarRoutine, 'id' | 'completionDates' | 'createdAt'>

export type CalendarDay = {
  key: string
  date: dayjs.Dayjs
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
}

export type CalendarEventDraft = Omit<CalendarEvent, 'id'>

export type CalendarTodoDraft = Omit<CalendarTodo, 'id'>
