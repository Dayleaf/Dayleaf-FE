import { useState, type FormEvent } from 'react'
import type { CalendarTodo } from '@/types/calendar'
import styles from './weeklyCalendar.module.css'

type TodoItemProps = {
  todo: CalendarTodo
  onDeleteTodo: (todoId: string) => void
  onToggleTodo: (todoId: string) => void
  onUpdateTodo: (todoId: string, title: string) => void
}

export default function TodoItem({
  todo,
  onDeleteTodo,
  onToggleTodo,
  onUpdateTodo,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(todo.title)

  const handleSubmit = (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()
    const nextTitle = title.trim()

    if (!nextTitle) {
      return
    }

    onUpdateTodo(todo.id, nextTitle)
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
        </form>
      ) : (
        <button
          className={`${styles.todoTitle} ${todo.completed ? styles.completedTodo : ''}`}
          type="button"
          onClick={() => setIsEditing(true)}
        >
          {todo.title}
        </button>
      )}
      <button
        className={styles.todoDeleteButton}
        type="button"
        aria-label={`${todo.title} 삭제`}
        onClick={() => onDeleteTodo(todo.id)}
      >
        x
      </button>
    </div>
  )
}
