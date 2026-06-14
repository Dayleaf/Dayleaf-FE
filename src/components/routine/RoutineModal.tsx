'use client'

import dayjs from 'dayjs'
import { useState, type FormEvent } from 'react'
import { useCalendarStore } from '@/stores/calendarStore'
import type { CalendarTodo, RoutineFrequency } from '@/types/calendar'
import styles from './routineModal.module.css'

type RoutineModalProps = {
  todo: CalendarTodo
  onClose: () => void
}

const frequencyOptions: { value: RoutineFrequency; label: string }[] = [
  { value: 'DAILY', label: '매일' },
  { value: 'WEEKDAYS', label: '평일마다' },
  { value: 'WEEKLY', label: '매주' },
  { value: 'MONTHLY', label: '매월' },
]

export default function RoutineModal({ onClose, todo }: RoutineModalProps) {
  const createRoutineFromTodo = useCalendarStore((state) => state.createRoutineFromTodo)
  const [frequency, setFrequency] = useState<RoutineFrequency>('DAILY')
  const [startDate, setStartDate] = useState(todo.date ?? dayjs().format('YYYY-MM-DD'))
  const [dueDate, setDueDate] = useState(dayjs(todo.date ?? undefined).add(3, 'month').format('YYYY-MM-DD'))

  const handleSubmit = (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()
    createRoutineFromTodo(todo.id, {
      frequency,
      startDate,
      dueDate,
      todoId: todo.id,
      categoryId: todo.categoryId,
    })
    onClose()
  }

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <form
        className={styles.modal}
        onClick={(clickEvent) => clickEvent.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className={styles.header}>
          <div>
            <p>루틴화</p>
            <h2>{todo.title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기">
            x
          </button>
        </div>
        <label>
          <span>반복 주기</span>
          <select
            value={frequency}
            onChange={(changeEvent) => setFrequency(changeEvent.target.value as RoutineFrequency)}
          >
            {frequencyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.dateGrid}>
          <label>
            <span>시작일</span>
            <input
              type="date"
              value={startDate}
              onChange={(changeEvent) => setStartDate(changeEvent.target.value)}
            />
          </label>
          <label>
            <span>루틴 기한</span>
            <input
              type="date"
              value={dueDate}
              min={startDate}
              onChange={(changeEvent) => setDueDate(changeEvent.target.value)}
            />
          </label>
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={onClose}>
            취소
          </button>
          <button type="submit">생성</button>
        </div>
      </form>
    </div>
  )
}
