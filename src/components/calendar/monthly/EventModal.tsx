import { useState, type FormEvent } from 'react'
import type { CalendarCategory, CalendarEvent, CalendarEventDraft } from '@/types/calendar'
import styles from './monthlyCalendar.module.css'

type EventModalProps = {
  categories: CalendarCategory[]
  defaultDate?: string
  event?: CalendarEvent
  getCategoryColor: (categoryId: string) => string
  mode: 'create' | 'edit'
  onClose: () => void
  onDelete: () => void
  onSave: (draft: CalendarEventDraft) => void
}

const defaultCategoryId = 'work'

export default function EventModal({
  categories,
  defaultDate,
  event,
  getCategoryColor,
  mode,
  onClose,
  onDelete,
  onSave,
}: EventModalProps) {
  const [title, setTitle] = useState(event?.title ?? '')
  const [date, setDate] = useState(event?.date ?? defaultDate ?? '')
  const [startTime, setStartTime] = useState(event?.startTime ?? '09:00')
  const [endTime, setEndTime] = useState(event?.endTime ?? '10:00')
  const [categoryId, setCategoryId] = useState(event?.categoryId ?? defaultCategoryId)

  const handleSubmit = (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()

    onSave({
      title: title.trim() || '제목 없는 일정',
      date,
      startTime,
      endTime,
      categoryId,
      color: getCategoryColor(categoryId),
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
            <h2>{mode === 'edit' ? '일정을 수정합니다' : '새 일정을 만듭니다'}</h2>
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
          <span>카테고리</span>
          <select
            value={categoryId}
            onChange={(changeEvent) => setCategoryId(changeEvent.target.value)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

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
