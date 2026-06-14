import { useState, type FormEvent, type ReactNode } from 'react'
import type {
  CalendarCategory,
  CalendarEvent,
  CalendarEventDraft,
  RecurrenceFrequency,
  RecurrenceRule,
} from '@/types/calendar'
import styles from './weeklyCalendar.module.css'

type EventModalProps = {
  categories: CalendarCategory[]
  defaultDate: string
  defaultStartTime: string
  defaultEndTime: string
  event?: CalendarEvent
  getCategoryColor: (categoryId: string) => string
  mode: 'create' | 'edit'
  linkedTodosSlot?: ReactNode
  onClose: () => void
  onDelete: () => void
  onSave: (draft: CalendarEventDraft) => void
}

const defaultCategoryId = 'work'
const noGroupCategoryId = ''

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

export default function EventModal({
  categories,
  defaultDate,
  defaultEndTime,
  defaultStartTime,
  event,
  getCategoryColor,
  linkedTodosSlot,
  mode,
  onClose,
  onDelete,
  onSave,
}: EventModalProps) {
  const [title, setTitle] = useState(event?.title ?? '')
  const [date, setDate] = useState(event?.date ?? defaultDate)
  const [startTime, setStartTime] = useState(event?.startTime ?? defaultStartTime)
  const [endTime, setEndTime] = useState(event?.endTime ?? defaultEndTime)
  const [categoryId, setCategoryId] = useState(event?.categoryId ?? categories[0]?.id ?? defaultCategoryId)
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency>(
    event?.recurrenceRule?.frequency ?? 'NONE',
  )

  const handleSubmit = (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()

    onSave({
      title: title.trim() || '제목 없는 일정',
      date,
      startTime,
      endTime,
      categoryId,
      color: categoryId ? getCategoryColor(categoryId) : 'var(--color-brand)',
      recurrenceRule: getRecurrenceRule(recurrenceFrequency),
    })
  }

  return (
    <div className={styles.modalOverlay} role="presentation" onClick={onClose}>
      <form
        className={styles.eventModal}
        onClick={(clickEvent) => clickEvent.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.modalEyebrow}>{mode === 'edit' ? '일정 수정' : '일정 추가'}</p>
            <h2>{mode === 'edit' ? '일정을 수정합니다' : '일정을 만듭니다'}</h2>
          </div>
          <button className={styles.closeButton} type="button" onClick={onClose} aria-label="닫기">
            x
          </button>
        </div>

        <label className={styles.field}>
          <span>제목</span>
          <input value={title} onChange={(changeEvent) => setTitle(changeEvent.target.value)} />
        </label>

        <label className={styles.field}>
          <span>날짜</span>
          <input
            type="date"
            value={date}
            onChange={(changeEvent) => setDate(changeEvent.target.value)}
            required
          />
        </label>

        <div className={styles.timeFields}>
          <label className={styles.field}>
            <span>시작</span>
            <input
              type="time"
              value={startTime}
              onChange={(changeEvent) => setStartTime(changeEvent.target.value)}
              required
            />
          </label>
          <label className={styles.field}>
            <span>종료</span>
            <input
              type="time"
              value={endTime}
              onChange={(changeEvent) => setEndTime(changeEvent.target.value)}
              required
            />
          </label>
        </div>

        <label className={styles.field}>
          <span>그룹</span>
          <select
            value={categoryId}
            onChange={(changeEvent) => setCategoryId(changeEvent.target.value)}
          >
            <option value={noGroupCategoryId}>그룹 없음</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
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

        {linkedTodosSlot}

        <div className={styles.modalActions}>
          {mode === 'edit' ? (
            <button className={styles.deleteButton} type="button" onClick={onDelete}>
              삭제
            </button>
          ) : null}
          <div className={styles.actionGroup}>
            <button className={styles.secondaryButton} type="button" onClick={onClose}>
              취소
            </button>
            <button className={styles.primaryButton} type="submit">
              저장
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
