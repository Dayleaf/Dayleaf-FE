import dayjs from 'dayjs'
import type { CalendarCategory, CalendarDay, CalendarEvent, CalendarTodo } from '@/types/calendar'

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

export const sampleTodos: CalendarTodo[] = [
  {
    id: 'todo-1',
    title: '자바 1강 신청',
    completed: false,
    createdAt: '2026-06-01',
  },
  {
    id: 'todo-2',
    title: '주간 일정 정리',
    completed: false,
    createdAt: '2026-06-01',
  },
  {
    id: 'todo-3',
    title: '캘린더 QA 체크',
    completed: true,
    createdAt: '2026-06-02',
  },
  {
    id: 'todo-4',
    title: '디자인 토큰 확인',
    completed: false,
    createdAt: '2026-06-02',
  },
  {
    id: 'todo-5',
    title: '프론트엔드 변수 공부',
    completed: true,
    createdAt: '2026-06-03',
  },
  {
    id: 'todo-6',
    title: 'Todo Panel 피드백 반영',
    completed: false,
    createdAt: '2026-06-03',
  },
  {
    id: 'todo-7',
    title: '위클리 뷰 구조 검토',
    completed: false,
    createdAt: '2026-06-04',
  },
  {
    id: 'todo-8',
    title: '일정 모달 플로우 점검',
    completed: false,
    createdAt: '2026-06-04',
  },
  {
    id: 'todo-9',
    title: '메인페이지 기획',
    completed: false,
    createdAt: '2026-06-05',
  },
  {
    id: 'todo-10',
    title: '회의 자료 정리',
    completed: true,
    createdAt: '2026-06-05',
  },
  {
    id: 'todo-11',
    title: '주말 루틴 작성',
    completed: false,
    createdAt: '2026-06-06',
  },
  {
    id: 'todo-12',
    title: '다음 주 작업 메모',
    completed: false,
    createdAt: '2026-06-06',
  },
  {
    id: 'todo-13',
    title: '월요일 우선순위 정리',
    completed: false,
    createdAt: '2026-06-07',
  },
  {
    id: 'todo-14',
    title: '개인 일정 확인',
    completed: true,
    createdAt: '2026-06-07',
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

export function getWeekDays(baseDate = '2026-06-05') {
  const start = dayjs(baseDate).startOf('week').add(1, 'day')
  const today = dayjs()

  return Array.from({ length: 7 }, (_, index): CalendarDay => {
    const date = start.add(index, 'day')

    return {
      key: date.format('YYYY-MM-DD'),
      date,
      dayNumber: date.date(),
      isCurrentMonth: date.month() === dayjs(baseDate).month(),
      isToday: date.isSame(today, 'day'),
    }
  })
}

export function getTimeSlots() {
  return Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, '0')}:00`)
}

export function clampMinute(minute: number) {
  return Math.max(0, Math.min(24 * 60, minute))
}

export function snapMinute(minute: number, step = 30) {
  return clampMinute(Math.round(minute / step) * step)
}

export function timeToMinutes(time: string) {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}

export function minutesToTime(totalMinutes: number) {
  const clampedMinutes = clampMinute(totalMinutes)
  const hour = Math.floor(clampedMinutes / 60)
  const minute = clampedMinutes % 60

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export function getMinuteFromPointer(clientY: number, rect: DOMRect, step = 30) {
  const offsetY = clientY - rect.top
  return snapMinute((offsetY / rect.height) * 24 * 60, step)
}

export function getEventOffset(startTime: string) {
  return timeToMinutes(startTime)
}

export function getEventDuration(startTime: string, endTime: string) {
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)
  return Math.max(end - start, 30)
}

export function getCategoryById(categoryId: string) {
  return calendarCategories.find((category) => category.id === categoryId)
}

export function getCategoryColor(categoryId: string) {
  return getCategoryById(categoryId)?.color ?? 'var(--color-brand)'
}
