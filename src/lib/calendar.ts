import dayjs from 'dayjs'
import type { CalendarCategory, CalendarDay, CalendarEvent } from '@/types/calendar'

export const calendarCategories: CalendarCategory[] = [
  { id: 'work', label: '업무', color: 'var(--color-work)' },
  { id: 'routine', label: '루틴', color: 'var(--color-routine)' },
  { id: 'personal', label: '개인', color: 'var(--color-personal)' },
  { id: 'study', label: '공부', color: 'var(--color-study)' },
  { id: 'important', label: '중요', color: 'var(--color-important)' },
]

export const sampleEvents: CalendarEvent[] = [
  {
    id: '1',
    title: '캡스톤 회의',
    date: '2026-06-05',
    startTime: '10:00',
    endTime: '11:00',
    categoryId: 'work',
    color: 'var(--color-work)',
  },
  {
    id: '2',
    title: 'UI 리디자인',
    date: '2026-06-08',
    startTime: '14:00',
    endTime: '16:00',
    categoryId: 'study',
    color: 'var(--color-study)',
  },
  {
    id: '3',
    title: '아침 루틴',
    date: '2026-06-10',
    startTime: '08:30',
    endTime: '09:00',
    categoryId: 'routine',
    color: 'var(--color-routine)',
  },
  {
    id: '4',
    title: '친구 약속',
    date: '2026-06-13',
    startTime: '18:00',
    endTime: '20:00',
    categoryId: 'personal',
    color: 'var(--color-personal)',
  },
  {
    id: '5',
    title: '중간 발표',
    date: '2026-06-18',
    startTime: '11:00',
    endTime: '12:00',
    categoryId: 'important',
    color: 'var(--color-important)',
  },
  {
    id: '6',
    title: '기획 정리',
    date: '2026-06-18',
    startTime: '16:00',
    endTime: '17:30',
    categoryId: 'work',
    color: 'var(--color-work)',
  },
  {
    id: '7',
    title: '회고 작성',
    date: '2026-06-24',
    startTime: '21:00',
    endTime: '21:30',
    categoryId: 'routine',
    color: 'var(--color-routine)',
  },
]

export function getMonthDays(baseDate = '2026-06-01') {
  const month = dayjs(baseDate).startOf('month')
  const start = month.startOf('week')
  const today = dayjs()

  return Array.from({ length: 42 }, (_, index): CalendarDay => {
    const date = start.add(index, 'day')

    return {
      key: date.format('YYYY-MM-DD'),
      date,
      dayNumber: date.date(),
      isCurrentMonth: date.month() === month.month(),
      isToday: date.isSame(today, 'day'),
    }
  })
}

export function getCategoryById(categoryId: string) {
  return calendarCategories.find((category) => category.id === categoryId)
}

export function getCategoryColor(categoryId: string) {
  return getCategoryById(categoryId)?.color ?? 'var(--color-brand)'
}
