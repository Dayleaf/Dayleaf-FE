import { useState, type KeyboardEvent } from 'react'
import type { CalendarDay } from '@/types/calendar'
import styles from './weeklyCalendar.module.css'

type TodoFormProps = {
  day: CalendarDay
  onAddTodo: (title: string, createdAt: string) => void
}

export default function TodoForm({ day, onAddTodo }: TodoFormProps) {
  const [title, setTitle] = useState('')

  const saveTodo = () => {
    const nextTitle = title.trim()

    if (!nextTitle) {
      return
    }

    onAddTodo(nextTitle, day.key)
    setTitle('')
  }

  const handleKeyDown = (keyEvent: KeyboardEvent<HTMLInputElement>) => {
    if (keyEvent.nativeEvent.isComposing) {
      return
    }

    if (keyEvent.key === 'Enter') {
      keyEvent.preventDefault()
      saveTodo()
    }
  }

  return (
    <div className={styles.todoForm}>
      <input type="checkbox" disabled aria-hidden="true" />
      <input
        value={title}
        onChange={(changeEvent) => setTitle(changeEvent.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="new todo"
        aria-label={`${day.key} Todo 추가`}
      />
      {title.trim() ? (
        <button
          className={styles.todoSubmitButton}
          type="button"
          onClick={saveTodo}
          aria-label={`${day.key} Todo 등록`}
        />
      ) : null}
    </div>
  )
}
