'use client'

import { useMemo, useState, type CSSProperties } from 'react'
import { calendarCategories } from '@/lib/calendar'
import { useCalendarStore } from '@/stores/calendarStore'
import type { CalendarTodo } from '@/types/calendar'
import TodoInputModal, { type TodoInputValues } from './TodoInputModal'
import styles from './dailyCalendar.module.css'

type DailyTodoPanelProps = {
  date: string
}

const fallbackCategory = { id: 'etc', label: '기타', color: 'var(--color-text-subtle)' }
const todoCategories = [
  ...calendarCategories.filter((category) =>
    ['study', 'work', 'routine', 'personal'].includes(category.id),
  ),
  fallbackCategory,
]

const priorityLabels = {
  LOW: '낮음',
  MEDIUM: '보통',
  HIGH: '높음',
} as const

function getTodoDate(todo: CalendarTodo) {
  return todo.date ?? todo.createdAt
}

export default function DailyTodoPanel({ date }: DailyTodoPanelProps) {
  const todos = useCalendarStore((state) => state.todos)
  const addTodo = useCalendarStore((state) => state.addTodo)
  const updateTodo = useCalendarStore((state) => state.updateTodo)
  const toggleTodo = useCalendarStore((state) => state.toggleTodo)
  const deleteTodo = useCalendarStore((state) => state.deleteTodo)
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)

  const todosByCategory = useMemo(() => {
    return todos
      .filter((todo) => getTodoDate(todo) === date)
      .reduce<Record<string, CalendarTodo[]>>((groupedTodos, todo) => {
        const categoryId = todo.categoryId ?? fallbackCategory.id
        const categoryTodos = groupedTodos[categoryId] ?? []

        return {
          ...groupedTodos,
          [categoryId]: [...categoryTodos, todo],
        }
      }, {})
  }, [date, todos])

  const handleAddTodo = (values: TodoInputValues) => {
    addTodo({
      title: values.title,
      completed: false,
      date: values.date,
      categoryId: values.categoryId,
      priority: values.priority,
      recurrenceRule: values.recurrenceRule,
      createdAt: values.date,
    })
    setActiveCategoryId(null)
  }

  return (
    <section className={styles.dailyTodoPanel} aria-label={`${date} Todo`}>
      <div className={styles.todoPanelHeader}>
        <p>Daily Todo</p>
        <span>{date}</span>
      </div>
      <div className={styles.todoCategoryList}>
        {todoCategories.map((category) => {
          const categoryTodos = todosByCategory[category.id] ?? []

          return (
            <section key={category.id} className={styles.todoCategory}>
              <div className={styles.todoCategoryHeader}>
                <span
                  className={styles.categoryDot}
                  style={{ '--category-color': category.color } as CSSProperties}
                />
                <h2>{category.label}</h2>
                <button
                  type="button"
                  onClick={() => setActiveCategoryId(category.id)}
                  aria-label={`${category.label} Todo 추가`}
                >
                  +
                </button>
              </div>
              <div className={styles.todoCategoryItems}>
                {categoryTodos.map((todo) => (
                  <div key={todo.id} className={styles.dailyTodoItem}>
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      aria-label={`${todo.title} 완료`}
                    />
                    <button
                      type="button"
                      className={todo.completed ? styles.completedDailyTodo : undefined}
                      onClick={() => updateTodo(todo.id, { completed: !todo.completed })}
                    >
                      {todo.title}
                    </button>
                    {todo.priority ? (
                      <span className={styles.priorityBadge}>
                        {priorityLabels[todo.priority]}
                      </span>
                    ) : null}
                    <button
                      type="button"
                      className={styles.todoRemoveButton}
                      onClick={() => deleteTodo(todo.id)}
                      aria-label={`${todo.title} 삭제`}
                    >
                      x
                    </button>
                  </div>
                ))}
                {categoryTodos.length === 0 ? (
                  <p className={styles.emptyTodo}>등록된 Todo가 없습니다</p>
                ) : null}
              </div>
            </section>
          )
        })}
      </div>
      {activeCategoryId ? (
        <TodoInputModal
          categoryId={activeCategoryId}
          date={date}
          onClose={() => setActiveCategoryId(null)}
          onSave={handleAddTodo}
        />
      ) : null}
    </section>
  )
}
