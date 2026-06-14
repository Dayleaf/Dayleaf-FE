'use client'

import { useMemo, useState, type CSSProperties, type DragEvent, type FormEvent, type KeyboardEvent } from 'react'
import { useCalendarStore } from '@/stores/calendarStore'
import type { CalendarTodo } from '@/types/calendar'
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
  const [activeTab, setActiveTab] = useState<'category' | 'priority'>('category')
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const [activeNewTodoKey, setActiveNewTodoKey] = useState<string | null>(null)
  const [newTodoTitles, setNewTodoTitles] = useState<Record<string, string>>({})
  const [newTodoCategoryIds, setNewTodoCategoryIds] = useState<Record<string, string>>({})
  const [openTodoMenuId, setOpenTodoMenuId] = useState<string | null>(null)
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null)
  const [editingTodoTitle, setEditingTodoTitle] = useState('')
  const [editingTodoCategoryId, setEditingTodoCategoryId] = useState('')
  const [draggingTodoId, setDraggingTodoId] = useState<string | null>(null)
  const [dragOverTodoId, setDragOverTodoId] = useState<string | null>(null)
  const [isDragOverEnd, setIsDragOverEnd] = useState(false)
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

  const handleAddTodo = (categoryId: string, todoKey = categoryId) => {
    const title = (newTodoTitles[todoKey] ?? '').trim()

    if (!title) {
      return
    }

    addTodo({
      title,
      completed: false,
      date,
      categoryId: newTodoCategoryIds[todoKey] ?? categoryId,
      priority: 'MEDIUM',
      createdAt: date,
    })
    setNewTodoTitles((titles) => ({ ...titles, [todoKey]: '' }))
    setActiveNewTodoKey(null)
  }

  const handleNewTodoKeyDown = (
    keyEvent: KeyboardEvent<HTMLInputElement>,
    categoryId: string,
    todoKey = categoryId,
  ) => {
    if (keyEvent.nativeEvent.isComposing) {
      return
    }

    if (keyEvent.key === 'Enter') {
      keyEvent.preventDefault()
      handleAddTodo(categoryId, todoKey)
    }
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
      setDragOverTodoId(null)
      setIsDragOverEnd(false)
      return
    }

    const nextTodoIds = priorityTodos.map((todo) => todo.id)
    const draggedIndex = nextTodoIds.indexOf(draggedTodoId)

    if (draggedIndex < 0) {
      setDraggingTodoId(null)
      setDragOverTodoId(null)
      setIsDragOverEnd(false)
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
    setDragOverTodoId(null)
    setIsDragOverEnd(false)
  }

  const handleStartEditTodo = (todo: CalendarTodo) => {
    setEditingTodoId(todo.id)
    setEditingTodoTitle(todo.title)
    setEditingTodoCategoryId(todo.categoryId ?? fallbackCategory?.id ?? '')
    setOpenTodoMenuId(null)
  }

  const handleSaveTodo = (todoId: string) => {
    const nextTitle = editingTodoTitle.trim()

    if (!nextTitle) {
      return
    }

    updateTodo(todoId, {
      title: nextTitle,
      categoryId: editingTodoCategoryId,
    })
    setEditingTodoId(null)
    setEditingTodoTitle('')
    setEditingTodoCategoryId('')
  }

  const renderTodoItem = (todo: CalendarTodo, isPriorityItem = false) => {
    const category = todoCategories.find((todoCategory) => todoCategory.id === todo.categoryId)

    return (
      <div
        key={todo.id}
        className={`${styles.dailyTodoItem} ${
          draggingTodoId === todo.id ? styles.draggingTodoItem : ''
        } ${dragOverTodoId === todo.id ? styles.dragOverTodoItem : ''}`}
        draggable={isPriorityItem}
        onDragStart={(dragEvent) => {
          if (!isPriorityItem) {
            return
          }

          dragEvent.dataTransfer.setData('text/plain', todo.id)
          dragEvent.dataTransfer.effectAllowed = 'move'
          setDraggingTodoId(todo.id)
        }}
        onDragEnd={() => {
          setDraggingTodoId(null)
          setDragOverTodoId(null)
          setIsDragOverEnd(false)
        }}
        onDragOver={(dragEvent) => {
          if (isPriorityItem) {
            dragEvent.preventDefault()

            if (draggingTodoId && draggingTodoId !== todo.id) {
              setDragOverTodoId(todo.id)
              setIsDragOverEnd(false)
            }
          }
        }}
        onDragLeave={() => {
          if (dragOverTodoId === todo.id) {
            setDragOverTodoId(null)
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
        {editingTodoId === todo.id ? (
          <div className={styles.todoInlineEditForm}>
            <input
              value={editingTodoTitle}
              onChange={(changeEvent) => setEditingTodoTitle(changeEvent.target.value)}
              aria-label={`${todo.title} 내용 수정`}
            />
            <select
              value={editingTodoCategoryId}
              onChange={(changeEvent) => setEditingTodoCategoryId(changeEvent.target.value)}
              aria-label={`${todo.title} 카테고리 수정`}
            >
              {todoCategories.map((todoCategory) => (
                <option key={todoCategory.id} value={todoCategory.id}>
                  {todoCategory.label}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => handleSaveTodo(todo.id)}>
              저장
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={todo.completed ? styles.completedDailyTodo : undefined}
            onClick={() => updateTodo(todo.id, { completed: !todo.completed })}
          >
            {todo.title}
          </button>
        )}
        {isPriorityItem && category ? (
          <span className={styles.todoCategoryTag}>#{category.label}</span>
        ) : null}
        {editingTodoId === todo.id ? null : (
        <div className={styles.todoMoreMenuWrap}>
          <button
            type="button"
            className={styles.todoMoreButton}
            onClick={() =>
              setOpenTodoMenuId((currentTodoId) => (currentTodoId === todo.id ? null : todo.id))
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
              <button type="button" onClick={() => deleteTodo(todo.id)}>
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
                    onClick={() =>
                      setActiveNewTodoKey((currentKey) =>
                        currentKey === category.id ? null : category.id,
                      )
                    }
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
                  {activeNewTodoKey === category.id ? (
                  <div className={styles.dailyTodoNewRow}>
                    <input type="checkbox" disabled aria-hidden="true" />
                    <input
                      value={newTodoTitles[category.id] ?? ''}
                      onChange={(changeEvent) =>
                        setNewTodoTitles((titles) => ({
                          ...titles,
                          [category.id]: changeEvent.target.value,
                        }))
                      }
                      onKeyDown={(keyEvent) => handleNewTodoKeyDown(keyEvent, category.id)}
                      placeholder="new todo"
                      aria-label={`${category.label} Todo 추가`}
                    />
                    {(newTodoTitles[category.id] ?? '').trim() ? (
                      <button type="button" onClick={() => handleAddTodo(category.id)}>
                        추가
                      </button>
                    ) : null}
                  </div>
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
            <div className={styles.todoPriorityTitleRow}>
              <h2>우선순위</h2>
              <button
                type="button"
                onClick={() =>
                  setActiveNewTodoKey((currentKey) =>
                    currentKey === 'priority' ? null : 'priority',
                  )
                }
                aria-label="우선순위 Todo 추가"
              >
                +
              </button>
            </div>
            <span>위에 있을수록 먼저 처리할 Todo입니다</span>
          </div>
          <div className={styles.todoCategoryItems}>
            {priorityTodos.map((todo) => renderTodoItem(todo, true))}
            {priorityTodos.length === 0 ? (
              <p className={styles.emptyTodo}>등록된 Todo가 없습니다</p>
            ) : null}
            {activeNewTodoKey === 'priority' ? (
              <div className={styles.dailyTodoNewRow}>
                <input type="checkbox" disabled aria-hidden="true" />
                <input
                  value={newTodoTitles.priority ?? ''}
                  onChange={(changeEvent) =>
                    setNewTodoTitles((titles) => ({
                      ...titles,
                      priority: changeEvent.target.value,
                    }))
                  }
                  onKeyDown={(keyEvent) =>
                    handleNewTodoKeyDown(keyEvent, newTodoCategoryIds.priority ?? fallbackCategory?.id ?? '', 'priority')
                  }
                  placeholder="new todo"
                  aria-label="우선순위 Todo 추가"
                />
                <select
                  value={newTodoCategoryIds.priority ?? fallbackCategory?.id ?? ''}
                  onChange={(changeEvent) =>
                    setNewTodoCategoryIds((categoryIds) => ({
                      ...categoryIds,
                      priority: changeEvent.target.value,
                    }))
                  }
                  aria-label="새 Todo 카테고리"
                >
                  {todoCategories.map((todoCategory) => (
                    <option key={todoCategory.id} value={todoCategory.id}>
                      {todoCategory.label}
                    </option>
                  ))}
                </select>
                {(newTodoTitles.priority ?? '').trim() ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleAddTodo(newTodoCategoryIds.priority ?? fallbackCategory?.id ?? '', 'priority')
                    }
                  >
                    추가
                  </button>
                ) : null}
              </div>
            ) : null}
            <div
              className={`${styles.todoEndDropZone} ${
                isDragOverEnd ? styles.activeTodoEndDropZone : ''
              }`}
              onDragOver={(dragEvent) => {
                dragEvent.preventDefault()

                if (draggingTodoId) {
                  setDragOverTodoId(null)
                  setIsDragOverEnd(true)
                }
              }}
              onDragLeave={() => setIsDragOverEnd(false)}
              onDrop={(dropEvent) => handleDropTodo(dropEvent)}
            />
          </div>
        </section>
      )}
    </section>
  )
}
