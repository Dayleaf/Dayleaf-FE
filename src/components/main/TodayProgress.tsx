'use client'

import dayjs from 'dayjs'
import { useMemo } from 'react'
import { useCalendarStore } from '@/stores/calendarStore'
import type { CalendarRoutine, CalendarTodo } from '@/types/calendar'
import styles from './main.module.css'

type TodayProgressProps = {
  date: string
}

type TodayProgressItem =
  | {
      id: string
      title: string
      done: boolean
      source: 'ROUTINE'
      routineId: string
    }
  | {
      id: string
      title: string
      done: boolean
      source: 'TODO'
      todoId: string
    }

const SOURCE_LABEL: Record<TodayProgressItem['source'], string> = {
  ROUTINE: '루틴',
  TODO: '투두',
}

function getTodoDate(todo: CalendarTodo) {
  return todo.date ?? todo.createdAt
}

function isRoutineDueToday(routine: CalendarRoutine, date: string) {
  const targetDate = dayjs(date)
  const startDate = dayjs(routine.startDate)
  const dueDate = dayjs(routine.completedAt ?? routine.dueDate)

  if (targetDate.isBefore(startDate, 'day') || targetDate.isAfter(dueDate, 'day')) {
    return false
  }

  if (routine.frequency === 'DAILY') {
    return true
  }

  if (routine.frequency === 'WEEKDAYS') {
    return [1, 2, 3, 4, 5].includes(targetDate.day())
  }

  if (routine.frequency === 'MONTHLY') {
    return targetDate.date() === startDate.date()
  }

  return targetDate.diff(startDate, 'day') % 7 === 0
}

export default function TodayProgress({ date }: TodayProgressProps) {
  const todos = useCalendarStore((state) => state.todos)
  const routines = useCalendarStore((state) => state.routines)
  const updateTodo = useCalendarStore((state) => state.updateTodo)
  const toggleRoutineDate = useCalendarStore((state) => state.toggleRoutineDate)

  const progress = useMemo<TodayProgressItem[]>(() => {
    const routineItems: TodayProgressItem[] = routines
      .filter((routine) => isRoutineDueToday(routine, date))
      .map((routine) => ({
        id: `routine-${routine.id}`,
        title: routine.title,
        done: routine.completionDates.includes(date),
        source: 'ROUTINE',
        routineId: routine.id,
      }))

    const todoItems: TodayProgressItem[] = todos
      .filter((todo) => getTodoDate(todo) === date)
      .map((todo) => ({
        id: `todo-${todo.id}`,
        title: todo.title,
        done: todo.completed,
        source: 'TODO',
        todoId: todo.id,
      }))

    return [...routineItems, ...todoItems]
  }, [date, routines, todos])

  const doneCount = progress.filter((item) => item.done).length
  const rate = progress.length === 0 ? 0 : Math.round((doneCount / progress.length) * 100)

  const toggleItem = (item: TodayProgressItem) => {
    if (item.source === 'ROUTINE') {
      toggleRoutineDate(item.routineId, date)
      return
    }

    updateTodo(item.todoId, { completed: !item.done })
  }

  return (
    <section className={styles.card} aria-label="오늘 기준 루틴과 투두 진행률">
      <div className={styles.progressHeader}>
        <p className={styles.cardLabel}>오늘 기준 루틴+투두 진행률</p>
        <span className={styles.progressRate}>{rate}%</span>
      </div>

      <div
        className={styles.progressBar}
        role="progressbar"
        aria-valuenow={rate}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`완료 ${doneCount}건 / 전체 ${progress.length}건`}
      >
        <span className={styles.progressFill} style={{ width: `${rate}%` }} />
      </div>

      {progress.length === 0 ? (
        <p className={styles.emptyText}>오늘은 진행할 루틴과 Todo가 없어요.</p>
      ) : (
        <div className={styles.progressList}>
          {progress.map((item) => (
            <button
              key={item.id}
              type="button"
              className={styles.progressItem}
              onClick={() => toggleItem(item)}
              aria-pressed={item.done}
            >
              <span
                className={`${styles.checkbox} ${item.done ? styles.checkboxChecked : ''}`}
                aria-hidden="true"
              >
                {item.done ? '✓' : ''}
              </span>
              <span
                className={`${styles.progressItemTitle} ${
                  item.done ? styles.progressItemDone : ''
                }`}
              >
                {item.title}
              </span>
              <span className={styles.sourceTag}>{SOURCE_LABEL[item.source]}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
