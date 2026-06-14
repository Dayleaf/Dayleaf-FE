import type { CalendarCategory, CalendarDay, CalendarTodo, CalendarTodoDraft } from '@/types/calendar'
import TodoForm from './TodoForm'
import TodoItem from './TodoItem'
import styles from './weeklyCalendar.module.css'

type TodoPanelProps = {
  categories: CalendarCategory[]
  days: CalendarDay[]
  todos: CalendarTodo[]
  onAddTodo: (title: string, createdAt: string, categoryId: string) => void
  onDeleteTodo: (todoId: string) => void
  onToggleTodo: (todoId: string) => void
  onUpdateTodo: (todoId: string, draft: Partial<CalendarTodoDraft>) => void
}

export default function TodoPanel({
  categories,
  days,
  todos,
  onAddTodo,
  onDeleteTodo,
  onToggleTodo,
  onUpdateTodo,
}: TodoPanelProps) {
  return (
    <section className={styles.todoPanel} aria-label="주간 할 일">
      <div className={styles.todoPanelOffset} />
      <div className={styles.todoPanelContent}>
        <div className={styles.todoDayGrid}>
          {days.map((day) => {
            const dayTodos = todos.filter((todo) => (todo.date ?? todo.createdAt) === day.key)

            return (
              <section key={day.key} className={styles.todoDayColumn} aria-label={`${day.key} 할 일`}>
                <div className={styles.todoList}>
                  {dayTodos.map((todo) => (
                    <TodoItem
                      categories={categories}
                      key={todo.id}
                      todo={todo}
                      onDeleteTodo={onDeleteTodo}
                      onToggleTodo={onToggleTodo}
                      onUpdateTodo={onUpdateTodo}
                    />
                  ))}
                  <TodoForm categories={categories} day={day} onAddTodo={onAddTodo} />
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </section>
  )
}
