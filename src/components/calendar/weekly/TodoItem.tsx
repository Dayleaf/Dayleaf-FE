import { useState, type FormEvent } from 'react'
import type { CalendarCategory, CalendarTodo, CalendarTodoDraft } from '@/types/calendar'
import styles from './weeklyCalendar.module.css'

type TodoItemProps = {
  categories: CalendarCategory[]
  todo: CalendarTodo
  onDeleteTodo: (todoId: string) => void
  onToggleTodo: (todoId: string) => void
  onUpdateTodo: (todoId: string, draft: Partial<CalendarTodoDraft>) => void
}

export default function TodoItem({
  categories,
  todo,
  onDeleteTodo,
  onToggleTodo,
  onUpdateTodo,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [title, setTitle] = useState(todo.title)
  const [categoryId, setCategoryId] = useState(todo.categoryId ?? categories[0]?.id ?? '')

  const handleSubmit = (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()
    const nextTitle = title.trim()

    if (!nextTitle) {
      return
    }

    onUpdateTodo(todo.id, { title: nextTitle, categoryId })
    setIsEditing(false)
  }

  return (
    <div className={styles.todoItem}>
      <input
        className={styles.todoCheckbox}
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggleTodo(todo.id)}
      />
      {isEditing ? (
        <form className={styles.todoEditForm} onSubmit={handleSubmit}>
          <input value={title} onChange={(changeEvent) => setTitle(changeEvent.target.value)} />
          <select
            value={categoryId}
            onChange={(changeEvent) => setCategoryId(changeEvent.target.value)}
            aria-label={`${todo.title} 카테고리 수정`}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
          <button type="submit">저장</button>
        </form>
      ) : (
        <button
          className={`${styles.todoTitle} ${todo.completed ? styles.completedTodo : ''}`}
          type="button"
          onClick={() => onToggleTodo(todo.id)}
        >
          {todo.title}
        </button>
      )}
      {isEditing ? null : (
        <div className={styles.todoMoreMenuWrap}>
          <button
            className={styles.todoMoreButton}
            type="button"
            aria-label={`${todo.title} 더보기`}
            onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          >
            ⋮
          </button>
          {isMenuOpen ? (
            <div className={styles.todoActionMenu}>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true)
                  setIsMenuOpen(false)
                }}
              >
                수정
              </button>
              <button type="button" onClick={() => onDeleteTodo(todo.id)}>
                삭제
              </button>
              <button type="button" onClick={() => setIsMenuOpen(false)}>
                루틴화
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
