'use client'

import { useState, type FormEvent } from 'react'
import type { CalendarCategory, RecurrenceFrequency, RecurrenceRule } from '@/types/calendar'
import styles from './dailyCalendar.module.css'

export type TodoInputValues = {
  title: string
  categoryId: string
  date: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  recurrenceRule?: RecurrenceRule
}

type TodoInputModalProps = {
  categories: CalendarCategory[]
  categoryId: string
  date: string
  onClose: () => void
  onSave: (values: TodoInputValues) => void
}

const recurrenceOptions: Array<{ label: string; value: RecurrenceFrequency }> = [
  { label: '반복 안 함', value: 'NONE' },
  { label: '매일', value: 'DAILY' },
  { label: '매주', value: 'WEEKLY' },
  { label: '평일마다', value: 'WEEKDAYS' },
  { label: '매월', value: 'MONTHLY' },
  { label: '사용자 정의', value: 'CUSTOM' },
]

function getRecurrenceRule(frequency: RecurrenceFrequency): RecurrenceRule | undefined {
  if (frequency === 'NONE') {
    return undefined
  }

  if (frequency === 'WEEKDAYS') {
    return { frequency, interval: 1, byWeekDay: ['MO', 'TU', 'WE', 'TH', 'FR'] }
  }

  return { frequency, interval: 1 }
}

export default function TodoInputModal({
  categories,
  categoryId,
  date,
  onClose,
  onSave,
}: TodoInputModalProps) {
  const [title, setTitle] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId)
  const [selectedDate, setSelectedDate] = useState(date)
  const [priority, setPriority] = useState<TodoInputValues['priority']>('MEDIUM')
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency>('NONE')

  const handleSubmit = (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()
    const nextTitle = title.trim()

    if (!nextTitle) {
      return
    }

    onSave({
      title: nextTitle,
      categoryId: selectedCategoryId,
      date: selectedDate,
      priority,
      recurrenceRule: getRecurrenceRule(recurrenceFrequency),
    })
  }

  return (
    <div className={styles.todoModalOverlay} role="presentation" onClick={onClose}>
      <form
        className={styles.todoModal}
        onClick={(clickEvent) => clickEvent.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className={styles.todoModalHeader}>
          <div>
            <p>Todo 추가</p>
            <h2>하루 Todo를 정리합니다</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기">
            x
          </button>
        </div>
        <label className={styles.todoField}>
          <span>이름</span>
          <input value={title} onChange={(changeEvent) => setTitle(changeEvent.target.value)} />
        </label>
        <label className={styles.todoField}>
          <span>카테고리</span>
          <select
            value={selectedCategoryId}
            onChange={(changeEvent) => setSelectedCategoryId(changeEvent.target.value)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.todoField}>
          <span>날짜</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(changeEvent) => setSelectedDate(changeEvent.target.value)}
          />
        </label>
        <label className={styles.todoField}>
          <span>반복</span>
          <select
            value={recurrenceFrequency}
            onChange={(changeEvent) =>
              setRecurrenceFrequency(changeEvent.target.value as RecurrenceFrequency)
            }
          >
            {recurrenceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.todoField}>
          <span>우선순위</span>
          <select
            value={priority}
            onChange={(changeEvent) =>
              setPriority(changeEvent.target.value as TodoInputValues['priority'])
            }
          >
            <option value="LOW">낮음</option>
            <option value="MEDIUM">보통</option>
            <option value="HIGH">높음</option>
          </select>
        </label>
        <div className={styles.todoModalActions}>
          <button type="button" onClick={onClose}>
            취소
          </button>
          <button type="submit">저장</button>
        </div>
      </form>
    </div>
  )
}
