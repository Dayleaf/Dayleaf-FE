import dayjs from 'dayjs'
import type {
  CalendarCategory,
  CalendarDay,
  CalendarEvent,
  CalendarRoutine,
  CalendarTodo,
} from '@/types/calendar'

export const calendarCategories: CalendarCategory[] = [
  { id: 'work', label: '업무', color: 'var(--color-work)' },
  { id: 'routine', label: '루틴', color: 'var(--color-routine)' },
  { id: 'lecture', label: '강의', color: 'var(--color-routine)' },
  { id: 'personal', label: '개인', color: 'var(--color-personal)' },
  { id: 'study', label: '공부', color: 'var(--color-study)' },
  { id: 'important', label: '중요', color: 'var(--color-important)' },
]

export const todoCategories: CalendarCategory[] = [
  { id: 'todo-work', label: '업무', color: 'var(--color-work)' },
  { id: 'todo-study', label: '공부', color: 'var(--color-study)' },
  { id: 'todo-routine', label: '루틴', color: 'var(--color-routine)' },
  { id: 'todo-personal', label: '개인', color: 'var(--color-personal)' },
  { id: 'todo-etc', label: '기타', color: 'var(--color-text-subtle)' },
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
  {
    id: '8',
    title: '주간 업무 정리',
    date: '2026-06-14',
    startTime: '09:30',
    endTime: '10:30',
    categoryId: 'work',
    color: 'var(--color-work)',
  },
  {
    id: '9',
    title: '자료구조 강의 복습',
    date: '2026-06-14',
    startTime: '11:00',
    endTime: '12:00',
    categoryId: 'lecture',
    color: 'var(--color-routine)',
  },
  {
    id: '10',
    title: '영어 공부',
    date: '2026-06-14',
    startTime: '14:00',
    endTime: '15:30',
    categoryId: 'study',
    color: 'var(--color-study)',
  },
  {
    id: '11',
    title: '저녁 약속',
    date: '2026-06-14',
    startTime: '18:30',
    endTime: '20:00',
    categoryId: 'personal',
    color: 'var(--color-personal)',
  },
]

export const sampleTodos: CalendarTodo[] = [
  {
    id: 'todo-1',
    title: '자바 1강 신청',
    completed: false,
    date: '2026-06-01',
    categoryId: 'todo-study',
    priority: 'HIGH',
    createdAt: '2026-06-01',
  },
  {
    id: 'todo-2',
    title: '주간 일정 정리',
    completed: false,
    date: '2026-06-01',
    categoryId: 'todo-work',
    priority: 'MEDIUM',
    createdAt: '2026-06-01',
  },
  {
    id: 'todo-3',
    title: '캘린더 QA 체크',
    completed: true,
    date: '2026-06-02',
    categoryId: 'todo-work',
    priority: 'MEDIUM',
    createdAt: '2026-06-02',
  },
  {
    id: 'todo-4',
    title: '디자인 토큰 확인',
    completed: false,
    date: '2026-06-02',
    categoryId: 'todo-etc',
    priority: 'HIGH',
    createdAt: '2026-06-02',
  },
  {
    id: 'todo-5',
    title: '프론트엔드 변수 공부',
    completed: true,
    date: '2026-06-03',
    categoryId: 'todo-study',
    priority: 'MEDIUM',
    createdAt: '2026-06-03',
  },
  {
    id: 'todo-6',
    title: 'Todo Panel 피드백 반영',
    completed: false,
    date: '2026-06-03',
    categoryId: 'todo-work',
    priority: 'LOW',
    createdAt: '2026-06-03',
  },
  {
    id: 'todo-7',
    title: '위클리 뷰 구조 검토',
    completed: false,
    date: '2026-06-04',
    categoryId: 'todo-work',
    priority: 'MEDIUM',
    createdAt: '2026-06-04',
  },
  {
    id: 'todo-8',
    title: '일정 모달 플로우 점검',
    completed: false,
    date: '2026-06-04',
    categoryId: 'todo-etc',
    priority: 'HIGH',
    createdAt: '2026-06-04',
  },
  {
    id: 'todo-9',
    title: '메인페이지 기획',
    completed: false,
    date: '2026-06-05',
    categoryId: 'todo-work',
    eventId: '1',
    priority: 'HIGH',
    createdAt: '2026-06-05',
  },
  {
    id: 'todo-10',
    title: '회의 자료 정리',
    completed: true,
    date: '2026-06-05',
    categoryId: 'todo-work',
    eventId: '1',
    priority: 'MEDIUM',
    createdAt: '2026-06-05',
  },
  {
    id: 'todo-11',
    title: '주말 루틴 작성',
    completed: false,
    date: '2026-06-06',
    categoryId: 'todo-routine',
    priority: 'LOW',
    createdAt: '2026-06-06',
  },
  {
    id: 'todo-12',
    title: '다음 주 작업 메모',
    completed: false,
    date: '2026-06-06',
    categoryId: 'todo-personal',
    priority: 'LOW',
    createdAt: '2026-06-06',
  },
  {
    id: 'todo-13',
    title: '월요일 우선순위 정리',
    completed: false,
    date: '2026-06-07',
    categoryId: 'todo-etc',
    priority: 'HIGH',
    createdAt: '2026-06-07',
  },
  {
    id: 'todo-14',
    title: '개인 일정 확인',
    completed: true,
    date: '2026-06-07',
    categoryId: 'todo-personal',
    priority: 'MEDIUM',
    createdAt: '2026-06-07',
  },
]

function makeCompletionDates(
  entries: Array<{
    year?: number
    month: number
    days: number[]
  }>,
) {
  return entries.flatMap(({ days, month, year = 2026 }) =>
    days.map(
      (day) =>
        `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    ),
  )
}

export const sampleRoutines: CalendarRoutine[] = [
  {
    id: 'routine-1',
    title: '아침 러닝',
    todoId: 'todo-11',
    categoryId: 'todo-routine',
    frequency: 'WEEKDAYS',
    startDate: '2024-01-08',
    dueDate: '2026-07-31',
    completionDates: makeCompletionDates([
      { year: 2024, month: 1, days: [8, 10, 12, 15, 19, 23] },
      { year: 2024, month: 2, days: [1, 5, 8, 12, 16] },
      { year: 2024, month: 3, days: [4, 5, 7, 8, 11, 13, 15, 18, 20, 22] },
      { year: 2024, month: 4, days: [2, 9, 16, 23] },
      { year: 2024, month: 5, days: [3, 6, 8, 10, 13, 15, 17, 20, 22, 24, 27, 29] },
      { year: 2024, month: 6, days: [4, 11, 18] },
      { year: 2024, month: 7, days: [1, 3, 5, 8, 10, 12, 15, 17, 19, 22] },
      { year: 2024, month: 8, days: [2, 9, 16, 23, 30] },
      { year: 2024, month: 9, days: [2, 3, 5, 6, 9, 11, 13, 16, 18, 20, 23, 25] },
      { year: 2024, month: 10, days: [4, 11, 18, 25] },
      { year: 2024, month: 11, days: [1, 4, 6, 8, 11, 13, 15, 18, 20, 22, 25, 27, 29] },
      { year: 2024, month: 12, days: [3, 10, 17, 24] },
      { year: 2025, month: 1, days: [2, 6, 9, 13, 16, 20, 23, 27, 30] },
      { year: 2025, month: 2, days: [3, 10, 17, 24] },
      { year: 2025, month: 3, days: [3, 4, 6, 7, 10, 12, 13, 17, 19, 20, 24, 26, 27, 31] },
      { year: 2025, month: 4, days: [1, 8, 15, 22, 29] },
      { year: 2025, month: 5, days: [1, 2, 5, 7, 8, 12, 14, 15, 19, 21, 22, 26, 28, 29] },
      { year: 2025, month: 6, days: [2, 9, 16, 23, 30] },
      { year: 2025, month: 7, days: [1, 3, 7, 8, 10, 14, 15, 17, 21, 22, 24, 28, 29, 31] },
      { year: 2025, month: 8, days: [4, 11, 18, 25] },
      { year: 2025, month: 9, days: [1, 2, 4, 5, 8, 10, 11, 15, 17, 18, 22, 24, 25, 29] },
      { year: 2025, month: 10, days: [6, 13, 20, 27] },
      { year: 2025, month: 11, days: [3, 4, 6, 7, 10, 12, 13, 17, 19, 20, 24, 26, 27] },
      { year: 2025, month: 12, days: [1, 8, 15, 22, 29] },
      { month: 2, days: [3, 6, 10, 17, 24] },
      { month: 3, days: [2, 3, 5, 6, 9, 11, 12, 16, 17, 19, 23, 24, 26, 30] },
      { month: 4, days: [1, 6, 9, 13, 16, 20, 23, 27] },
      { month: 5, days: [1, 4, 6, 7, 11, 12, 14, 18, 19, 21, 25, 27, 29] },
      { month: 6, days: [1, 4, 8, 11] },
    ]),
    createdAt: '2026-02-03',
  },
  {
    id: 'routine-2',
    title: '영어 공부',
    todoId: 'todo-5',
    categoryId: 'todo-study',
    frequency: 'DAILY',
    startDate: '2024-03-01',
    dueDate: '2026-08-31',
    completionDates: makeCompletionDates([
      { year: 2024, month: 3, days: [1, 2, 5, 9, 13, 17, 21, 25, 29] },
      { year: 2024, month: 4, days: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25] },
      { year: 2024, month: 5, days: [2, 6, 10, 14, 18, 22, 26, 30] },
      { year: 2024, month: 6, days: [1, 2, 4, 5, 7, 8, 10, 11, 13, 14, 16, 17, 19, 20, 22, 23, 25] },
      { year: 2024, month: 7, days: [3, 7, 11, 15, 19, 23, 27, 31] },
      { year: 2024, month: 8, days: [1, 2, 4, 5, 7, 8, 10, 11, 13, 14, 16, 17, 19, 20, 22, 23] },
      { year: 2024, month: 9, days: [2, 6, 10, 14, 18, 22, 26, 30] },
      { year: 2024, month: 10, days: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27] },
      { year: 2024, month: 11, days: [4, 8, 12, 16, 20, 24, 28] },
      { year: 2024, month: 12, days: [1, 2, 4, 5, 7, 8, 10, 11, 13, 14, 16, 17, 19] },
      { year: 2025, month: 1, days: [3, 7, 11, 15, 19, 23, 27, 31] },
      { year: 2025, month: 2, days: [1, 2, 4, 5, 7, 8, 10, 11, 13, 14, 16, 17, 19] },
      { year: 2025, month: 3, days: [2, 6, 10, 14, 18, 22, 26, 30] },
      { year: 2025, month: 4, days: [1, 2, 4, 5, 7, 8, 10, 11, 13, 14, 16, 17, 19, 20, 22, 23] },
      { year: 2025, month: 5, days: [4, 8, 12, 16, 20, 24, 28] },
      { year: 2025, month: 6, days: [1, 2, 4, 5, 7, 8, 10, 11, 13, 14, 16, 17, 19, 20] },
      { year: 2025, month: 7, days: [3, 7, 11, 15, 19, 23, 27, 31] },
      { year: 2025, month: 8, days: [1, 2, 4, 5, 7, 8, 10, 11, 13, 14, 16, 17, 19, 20, 22] },
      { year: 2025, month: 9, days: [4, 8, 12, 16, 20, 24, 28] },
      { year: 2025, month: 10, days: [1, 2, 4, 5, 7, 8, 10, 11, 13, 14, 16, 17, 19] },
      { year: 2025, month: 11, days: [3, 7, 11, 15, 19, 23, 27] },
      { year: 2025, month: 12, days: [1, 2, 4, 5, 7, 8, 10, 11, 13, 14, 16, 17, 19, 20] },
      { month: 1, days: [20, 21, 23, 28] },
      { month: 2, days: [2, 3, 5, 9, 12, 17, 20, 25] },
      { month: 3, days: [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30] },
      { month: 4, days: [1, 5, 9, 14, 18, 22, 27] },
      { month: 5, days: [1, 3, 5, 7, 9, 11, 13, 15, 18, 20, 22, 24, 26, 28, 31] },
      { month: 6, days: [2, 6, 10] },
    ]),
    createdAt: '2026-01-20',
  },
  {
    id: 'routine-3',
    title: '자바 스터디',
    todoId: 'todo-1',
    categoryId: 'todo-study',
    frequency: 'WEEKLY',
    startDate: '2024-09-05',
    dueDate: '2026-05-28',
    completedAt: '2026-05-28',
    completionDates: makeCompletionDates([
      { year: 2024, month: 9, days: [5, 19] },
      { year: 2024, month: 10, days: [3, 10, 17, 24, 31] },
      { year: 2024, month: 11, days: [7, 21] },
      { year: 2024, month: 12, days: [5, 12, 19] },
      { year: 2025, month: 1, days: [2, 9, 16, 23, 30] },
      { year: 2025, month: 2, days: [13, 27] },
      { year: 2025, month: 3, days: [6, 13, 20, 27] },
      { year: 2025, month: 4, days: [3, 17] },
      { year: 2025, month: 5, days: [1, 8, 15, 22, 29] },
      { year: 2025, month: 6, days: [12, 26] },
      { year: 2025, month: 7, days: [3, 10, 17, 24, 31] },
      { year: 2025, month: 8, days: [14, 28] },
      { year: 2025, month: 9, days: [4, 11, 18, 25] },
      { year: 2025, month: 10, days: [9, 23] },
      { year: 2025, month: 11, days: [6, 13, 20, 27] },
      { year: 2025, month: 12, days: [11, 25] },
      { month: 2, days: [26] },
      { month: 3, days: [5, 19] },
      { month: 4, days: [2, 9, 16, 30] },
      { month: 5, days: [7, 14, 21, 28] },
    ]),
    createdAt: '2026-02-26',
  },
]

export function getMonthDays(baseDate = dayjs().format('YYYY-MM-DD')) {
  const month = dayjs(baseDate).startOf('month')
  const daysSinceMonday = month.day() === 0 ? 6 : month.day() - 1
  const start = month.subtract(daysSinceMonday, 'day')
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

export function getWeekDays(baseDate = dayjs().format('YYYY-MM-DD')) {
  const base = dayjs(baseDate)
  const daysSinceMonday = base.day() === 0 ? 6 : base.day() - 1
  const start = base.subtract(daysSinceMonday, 'day')
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
