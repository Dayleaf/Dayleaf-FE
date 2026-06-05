import type dayjs from 'dayjs'

export type CalendarView = 'day' | 'week' | 'month'

export type CalendarCategory = {
  id: string
  label: string
  color: string
}

export type CalendarEvent = {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  categoryId: string
  color: string
}

export type CalendarDay = {
  key: string
  date: dayjs.Dayjs
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
}

export type CalendarEventDraft = Omit<CalendarEvent, 'id'>
