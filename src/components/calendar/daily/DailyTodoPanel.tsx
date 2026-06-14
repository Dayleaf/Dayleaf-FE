'use client'

import { useMemo, useState, type CSSProperties, type DragEvent, type FormEvent } from 'react'
import { useCalendarStore } from '@/stores/calendarStore'
import type { CalendarTodo } from '@/types/calendar'
import TodoInputModal, { type TodoInputValues } from './TodoInputModal'
import styles from './dailyCalendar.module.css'

type DailyTodoPanelProps = {
  date: string
}

function getTodoDate(todo: CalendarTodo) {
  return todo.date ?? todo.createdAt
}

export default function DailyTodoPanel({ date }: DailyTodoPanelProps) {
  const todos = useCalendarStore((state) => state.todos)
  const todoCategories = useCalendarStore((state) => state.todoCategories)
  const addTodo = useCalendarStore((state) => state.addTodo)
  const updateTodo = useCalendarStore((state) => state.updateTodo)
  const toggleTodo = useCalendarStore((state) => state.toggleTodo)
  const deleteTodo = useCalendarStore((state) => state.deleteTodo)
  const reorderTodosByPriority = useCalendarStore((state) => state.reorderTodosByPriority)
  const addTodoCategory = useCalendarStore((state) => state.addTodoCategory)
  const updateTodoCategory = useCalendarStore((state) => state.updateTodoCategory)
  const deleteTodoCategory = useCalendarStore((state) => state.deleteTodoCategory)
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'category' | 'priority'>('category')
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const [draggingTodoId, setDraggingTodoId] = useState<string | null>(null)
  const fallbackCategory = todoCategories[todoCategories.length - 1]

  const dailyTodos = useMemo(() => {
    return todos.filter((todo) => getTodoDate(todo) === date)
  }, [date, todos])

  const todosByCategory = useMemo(() => {
    return dailyTodos.reduce<Record<string, CalendarTodo[]>>((groupedTodos, todo) => {
        const categoryId = todo.categoryId ?? fallbackCategory?.id ?? 'todo-etc'
        const categoryTodos = groupedTodos[categoryId] ?? []

        return {
          ...groupedTodos,
          [categoryId]: [...categoryTodos, todo],
        }
      }, {})
  }, [dailyTodos, fallbackCategory?.id])

  const priorityTodos = useMemo(() => {
    return dailyTodos
      .map((todo, index) => ({ todo, index }))
      .sort(
        (first, second) =>
          (first.todo.priorityOrder ?? first.index) - (second.todo.priorityOrder ?? second.index),
      )
      .map(({ todo }) => todo)
  }, [dailyTodos])

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

  const handleCreateCategory = (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()
    addTodoCategory(newCategoryName)
    setNewCategoryName('')
  }

  const handleStartEditCategory = (categoryId: string, label: string) => {
    setEditingCategoryId(categoryId)
    setEditingCategoryName(label)
  }

  const handleSaveCategory = () => {
    if (!editingCategoryId) {
      return
    }

    updateTodoCategory(editingCategoryId, editingCategoryName)
    setEditingCategoryId(null)
    setEditingCategoryName('')
  }

  const handleDropTodo = (dropEvent: DragEvent<HTMLElement>, targetTodoId?: string) => {
    dropEvent.preventDefault()
    dropEvent.stopPropagation()
    const draggedTodoId = dropEvent.dataTransfer.getData('text/plain')

    if (!draggedTodoId || draggedTodoId === targetTodoId) {
      setDraggingTodoId(null)
      return
    }

    const nextTodoIds = priorityTodos.map((todo) => todo.id)
    const draggedIndex = nextTodoIds.indexOf(draggedTodoId)

    if (draggedIndex < 0) {
      setDraggingTodoId(null)
      return
    }

    nextTodoIds.splice(draggedIndex, 1)

    if (targetTodoId) {
      const targetIndex = nextTodoIds.indexOf(targetTodoId)
      nextTodoIds.splice(targetIndex < 0 ? nextTodoIds.length : targetIndex, 0, draggedTodoId)
    } else {
      nextTodoIds.push(draggedTodoId)
    }

    reorderTodosByPriority(nextTodoIds)
    setDraggingTodoId(null)
  }

  const renderTodoItem = (todo: CalendarTodo, isPriorityItem = false) => {
    const category = todoCategories.find((todoCategory) => todoCategory.id === todo.categoryId)

    return (
      <div
        key={todo.id}
        className={`${styles.dailyTodoItem} ${
          draggingTodoId === todo.id ? styles.draggingTodoItem : ''
        }`}
        draggable={isPriorityItem}
        onDragStart={(dragEvent) => {
          if (!isPriorityItem) {
            return
          }

          dragEvent.dataTransfer.setData('text/plain', todo.id)
          dragEvent.dataTransfer.effectAllowed = 'move'
          setDraggingTodoId(todo.id)
        }}
        onDragEnd={() => setDraggingTodoId(null)}
        onDragOver={(dragEvent) => {
          if (isPriorityItem) {
            dragEvent.preventDefault()
          }
        }}
        onDrop={(dropEvent) => {
          if (isPriorityItem) {
            handleDropTodo(dropEvent, todo.id)
          }
        }}
      >
        {isPriorityItem ? (
          <span className={styles.todoDragHandle} aria-hidden="true">
            ::
          </span>
        ) : null}
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
        {isPriorityItem && category ? (
          <span className={styles.todoCategoryTag}>#{category.label}</span>
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
    )
  }

  return (
    <section className={styles.dailyTodoPanel} aria-label={`${date} Todo`}>
      <div className={styles.todoPanelHeader}>
        <div className={styles.todoPanelTitleRow}>
          <div>
            <p>Daily Todo</p>
            <span>{date}</span>
          </div>
          <button
            type="button"
            aria-expanded={isCategoryManagerOpen}
            onClick={() => setIsCategoryManagerOpen((isOpen) => !isOpen)}
          >
            카테고리 관리
          </button>
        </div>
      </div>
      {isCategoryManagerOpen ? (
        <div className={styles.todoCategoryManager} aria-label="Todo 카테고리 관리">
          <form className={styles.todoCategoryCreateForm} onSubmit={handleCreateCategory}>
            <input
              value={newCategoryName}
              onChange={(changeEvent) => setNewCategoryName(changeEvent.target.value)}
              placeholder="새 카테고리"
              aria-label="새 Todo 카테고리 이름"
            />
            <button type="submit">추가</button>
          </form>
          <div className={styles.todoManagedCategoryList}>
            {todoCategories.map((category) => (
              <div key={category.id} className={styles.todoManagedCategory}>
                <span
                  className={styles.categoryDot}
                  style={{ '--category-color': category.color } as CSSProperties}
                />
                {editingCategoryId === category.id ? (
                  <input
                    value={editingCategoryName}
                    onChange={(changeEvent) => setEditingCategoryName(changeEvent.target.value)}
                    aria-label={`${category.label} 카테고리 이름 수정`}
                  />
                ) : (
                  <span>#{category.label}</span>
                )}
                {editingCategoryId === category.id ? (
                  <button type="button" onClick={handleSaveCategory}>
                    저장
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartEditCategory(category.id, category.label)}
                  >
                    수정
                  </button>
                )}
                <button type="button" onClick={() => deleteTodoCategory(category.id)}>
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <div className={styles.todoViewTabs} aria-label="Todo 보기 전환">
        <button
          type="button"
          className={activeTab === 'category' ? styles.activeTodoViewTab : undefined}
          onClick={() => setActiveTab('category')}
        >
          카테고리별 보기
        </button>
        <button
          type="button"
          className={activeTab === 'priority' ? styles.activeTodoViewTab : undefined}
          onClick={() => setActiveTab('priority')}
        >
          우선순위별 보기
        </button>
      </div>
      {activeTab === 'category' ? (
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
                  {categoryTodos.map((todo) => renderTodoItem(todo))}
                  {categoryTodos.length === 0 ? (
                    <p className={styles.emptyTodo}>등록된 Todo가 없습니다</p>
                  ) : null}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <section
          className={styles.todoPriorityBoard}
          onDragOver={(dragEvent) => dragEvent.preventDefault()}
          onDrop={(dropEvent) => handleDropTodo(dropEvent)}
        >
          <div className={styles.todoPriorityHeader}>
            <h2>우선순위</h2>
            <span>위에 있을수록 먼저 처리할 Todo입니다</span>
          </div>
          <div className={styles.todoCategoryItems}>
            {priorityTodos.map((todo) => renderTodoItem(todo, true))}
            {priorityTodos.length === 0 ? (
              <p className={styles.emptyTodo}>등록된 Todo가 없습니다</p>
            ) : null}
          </div>
        </section>
      )}
      {activeCategoryId ? (
        <TodoInputModal
          categories={todoCategories}
          categoryId={activeCategoryId}
          date={date}
          onClose={() => setActiveCategoryId(null)}
          onSave={handleAddTodo}
        />
      ) : null}
    </section>
  )
}
