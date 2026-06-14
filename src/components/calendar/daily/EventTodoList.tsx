'use client'

import { useState, type KeyboardEvent } from 'react'
import type { CalendarCategory, CalendarTodo, CalendarTodoDraft } from '@/types/calendar'
import styles from './dailyCalendar.module.css'

type EventTodoListProps = {
  categories?: CalendarCategory[]
  defaultCategoryId?: string
  todos?: CalendarTodo[]
  onAddTodo?: (title: string, categoryId: string) => void
  onDeleteTodo?: (todoId: string) => void
  onToggleTodo?: (todoId: string) => void
  onUpdateTodo?: (todoId: string, draft: Partial<CalendarTodoDraft>) => void
}

export default function EventTodoList({
  categories = [],
  defaultCategoryId,
  todos = [],
  onAddTodo = () => {},
  onDeleteTodo = () => {},
  onToggleTodo = () => {},
  onUpdateTodo = () => {},
}: EventTodoListProps) {
  const initialCategoryId = defaultCategoryId ?? categories[0]?.id ?? 'study'
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState(initialCategoryId)
  const [openTodoMenuId, setOpenTodoMenuId] = useState<string | null>(null)
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState(initialCategoryId)

  const handleAddTodo = () => {
    const nextTitle = title.trim()

    if (!nextTitle) {
      return
    }

    onAddTodo(nextTitle, categoryId)
    setTitle('')
  }

  const handleKeyDown = (keyEvent: KeyboardEvent<HTMLInputElement>) => {
    if (keyEvent.nativeEvent.isComposing) {
      return
    }

    if (keyEvent.key === 'Enter') {
      keyEvent.preventDefault()
      handleAddTodo()
    }
  }

  const handleStartEditTodo = (todo: CalendarTodo) => {
    setEditingTodoId(todo.id)
    setEditingTitle(todo.title)
    setEditingCategoryId(todo.categoryId ?? initialCategoryId)
    setOpenTodoMenuId(null)
  }

  const handleSaveTodo = (todoId: string) => {
    const nextTitle = editingTitle.trim()

    if (!nextTitle) {
      return
    }

    onUpdateTodo(todoId, {
      title: nextTitle,
      categoryId: editingCategoryId,
    })
    setEditingTodoId(null)
    setEditingTitle('')
    setEditingCategoryId(initialCategoryId)
  }

  return (
    <section className={styles.eventTodoSection} aria-label="일정 연결 Todo">
      <div className={styles.eventTodoHeader}>
        <span>연결된 Todo</span>
      </div>
      <div className={styles.eventTodoList}>
        {todos.map((todo) => (
          <div key={todo.id} className={styles.inlineTodoItem}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => onToggleTodo(todo.id)}
              aria-label={`${todo.title} 완료`}
            />
            {editingTodoId === todo.id ? (
              <div className={styles.todoInlineEditForm}>
                <input
                  value={editingTitle}
                  onChange={(changeEvent) => setEditingTitle(changeEvent.target.value)}
                  className={todo.completed ? styles.completedTodoInput : undefined}
                  aria-label={`${todo.title} 수정`}
                />
                {categories.length > 0 ? (
                  <select
                    value={editingCategoryId}
                    onChange={(changeEvent) => setEditingCategoryId(changeEvent.target.value)}
                    aria-label={`${todo.title} 카테고리`}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                ) : null}
                <button type="button" onClick={() => handleSaveTodo(todo.id)}>
                  저장
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={`${styles.inlineTodoTitle} ${
                  todo.completed ? styles.completedTodoInput : ''
                }`}
                onClick={() => onToggleTodo(todo.id)}
              >
                {todo.title}
              </button>
            )}
            {editingTodoId === todo.id ? null : (
            <div className={styles.todoMoreMenuWrap}>
              <button
                type="button"
                className={styles.todoMoreButton}
                onClick={() =>
                  setOpenTodoMenuId((currentTodoId) =>
                    currentTodoId === todo.id ? null : todo.id,
                  )
                }
                aria-label={`${todo.title} 더보기`}
              >
                ⋮
              </button>
              {openTodoMenuId === todo.id ? (
                <div className={styles.todoActionMenu}>
                  <button type="button" onClick={() => handleStartEditTodo(todo)}>
                    수정
                  </button>
                  <button type="button" onClick={() => onDeleteTodo(todo.id)}>
                    삭제
                  </button>
                  <button type="button" onClick={() => setOpenTodoMenuId(null)}>
                    루틴화
                  </button>
                </div>
              ) : null}
            </div>
            )}
          </div>
        ))}
        <div className={styles.inlineTodoForm}>
          <input
            value={title}
            onChange={(changeEvent) => setTitle(changeEvent.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="이 일정에 Todo 추가"
            aria-label="일정 Todo 추가"
          />
          {categories.length > 0 ? (
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
          ) : null}
          <button type="button" onClick={handleAddTodo}>
            추가
          </button>
        </div>
      </div>
    </section>
  )
}
