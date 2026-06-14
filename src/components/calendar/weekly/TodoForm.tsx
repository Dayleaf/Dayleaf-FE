import { useState, type KeyboardEvent } from 'react'
import type { CalendarCategory, CalendarDay } from '@/types/calendar'
import styles from './weeklyCalendar.module.css'

type TodoFormProps = {
  categories: CalendarCategory[]
  day: CalendarDay
  onAddTodo: (title: string, createdAt: string, categoryId: string) => void
}

export default function TodoForm({ categories, day, onAddTodo }: TodoFormProps) {
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '')

  const saveTodo = () => {
    const nextTitle = title.trim()

    if (!nextTitle) {
      return
    }

    onAddTodo(nextTitle, day.key, categoryId)
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
      <select
        value={categoryId}
        onChange={(changeEvent) => setCategoryId(changeEvent.target.value)}
        aria-label="새 Todo 카테고리"
      >
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.label}
          </option>
        ))}
      </select>
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
