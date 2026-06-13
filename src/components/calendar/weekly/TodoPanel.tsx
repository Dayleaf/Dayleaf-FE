import type { CalendarDay, CalendarTodo } from '@/types/calendar'
import TodoForm from './TodoForm'
import TodoItem from './TodoItem'
import styles from './weeklyCalendar.module.css'

type TodoPanelProps = {
  days: CalendarDay[]
  todos: CalendarTodo[]
  onAddTodo: (title: string, createdAt: string) => void
  onDeleteTodo: (todoId: string) => void
  onToggleTodo: (todoId: string) => void
  onUpdateTodo: (todoId: string, title: string) => void
}

export default function TodoPanel({
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
                      key={todo.id}
                      todo={todo}
                      onDeleteTodo={onDeleteTodo}
                      onToggleTodo={onToggleTodo}
                      onUpdateTodo={onUpdateTodo}
                    />
                  ))}
                  <TodoForm day={day} onAddTodo={onAddTodo} />
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </section>
  )
}
