'use client'

import dayjs from 'dayjs'
import { useRef, useState, type DragEvent, type FormEvent } from 'react'
import EventTodoList from '@/components/calendar/daily/EventTodoList'
import EventModal from '@/components/calendar/weekly/EventModal'
import { useCalendarStore } from '@/stores/calendarStore'
import type { CalendarEvent, CalendarEventDraft, CalendarTodo } from '@/types/calendar'
import styles from './library.module.css'

const nodeColorOptions = [
  'var(--color-work)',
  'var(--color-routine)',
  'var(--color-personal)',
  'var(--color-study)',
  'var(--color-important)',
  'var(--color-brand)',
]

const todayKey = dayjs().format('YYYY-MM-DD')

type LibraryEventModalState =
  | {
      mode: 'create'
      date: string
      startTime: string
      endTime: string
      categoryId?: string
    }
  | {
      mode: 'edit'
      event: CalendarEvent
    }
  | null

type ColorSwatchPickerProps = {
  value: string
  onChange: (color: string) => void
  label: string
}

function ColorDropdownPicker({ label, onChange, value }: ColorSwatchPickerProps) {
  return (
    <details className={styles.colorDropdown}>
      <summary>
        <span className={styles.colorPreview} style={{ background: value }} />
        <span>{label}</span>
      </summary>
      <div className={styles.colorSwatches} role="radiogroup" aria-label={label}>
        {nodeColorOptions.map((color) => (
          <button
            key={color}
            type="button"
            className={`${styles.colorSwatch} ${value === color ? styles.activeColorSwatch : ''}`}
            style={{ background: color }}
            onClick={() => onChange(color)}
            role="radio"
            aria-checked={value === color}
            aria-label={color}
          />
        ))}
      </div>
    </details>
  )
}

export default function LibraryPage() {
  const nodes = useCalendarStore((state) => state.nodes)
  const events = useCalendarStore((state) => state.events)
  const todos = useCalendarStore((state) => state.todos)
  const todoCategories = useCalendarStore((state) => state.todoCategories)
  const addNode = useCalendarStore((state) => state.addNode)
  const updateNode = useCalendarStore((state) => state.updateNode)
  const deleteNode = useCalendarStore((state) => state.deleteNode)
  const reorderNodes = useCalendarStore((state) => state.reorderNodes)
  const addEvent = useCalendarStore((state) => state.addEvent)
  const updateEvent = useCalendarStore((state) => state.updateEvent)
  const deleteEvent = useCalendarStore((state) => state.deleteEvent)
  const addTodo = useCalendarStore((state) => state.addTodo)
  const updateTodo = useCalendarStore((state) => state.updateTodo)
  const deleteTodo = useCalendarStore((state) => state.deleteTodo)
  const toggleTodo = useCalendarStore((state) => state.toggleTodo)
  const [nodeName, setNodeName] = useState('')
  const [nodeColor, setNodeColor] = useState(nodeColorOptions[0])
  const [childNodeName, setChildNodeName] = useState('')
  const [childNodeColor, setChildNodeColor] = useState(nodeColorOptions[0])
  const [isChildNodeModalOpen, setIsChildNodeModalOpen] = useState(false)
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [editingNodeName, setEditingNodeName] = useState('')
  const [editingNodeColor, setEditingNodeColor] = useState(nodeColorOptions[0])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [highlightedChildNodeId, setHighlightedChildNodeId] = useState<string | null>(null)
  const [eventModal, setEventModal] = useState<LibraryEventModalState>(null)
  const [draftTodos, setDraftTodos] = useState<CalendarTodo[]>([])
  const [creatingTodoEventId, setCreatingTodoEventId] = useState<string | null>(null)
  const [newTodoTitle, setNewTodoTitle] = useState('')
  const [newTodoCategoryId, setNewTodoCategoryId] = useState(todoCategories[0]?.id ?? '')
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)
  const [dragOverNodeId, setDragOverNodeId] = useState<string | null>(null)
  const [isDragOverEnd, setIsDragOverEnd] = useState(false)
  const dragHandleNodeIdRef = useRef<string | null>(null)
  const childNodeDetailRefs = useRef<Record<string, HTMLDetailsElement | null>>({})
  const parentNodes = nodes.filter((node) => !node.parentId)
  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? parentNodes[0] ?? nodes[0]
  const selectedChildNodes = selectedNode
    ? nodes.filter((node) => node.parentId === selectedNode.id)
    : []
  const selectedNodeEvents = selectedNode
    ? events
        .filter((event) => event.categoryId === selectedNode.id)
        .sort((first, second) =>
          `${first.date} ${first.startTime}`.localeCompare(`${second.date} ${second.startTime}`),
        )
    : []
  const eventModalEvent = eventModal?.mode === 'edit' ? eventModal.event : null
  const libraryEventCategories =
    eventModal?.mode === 'create' && eventModal.categoryId
      ? [
          nodes.find((node) => node.id === eventModal.categoryId),
          ...nodes.filter((node) => node.id !== eventModal.categoryId),
        ].filter((node): node is (typeof nodes)[number] => Boolean(node))
      : selectedNode
        ? [selectedNode, ...selectedChildNodes]
        : nodes

  const handleCreateNode = (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()
    addNode(nodeName, nodeColor)
    setNodeName('')
    setNodeColor(nodeColorOptions[0])
  }

  const handleCreateChildNode = (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()

    if (!selectedNode) {
      return
    }

    addNode(childNodeName, childNodeColor, selectedNode.id)
    setChildNodeName('')
    setChildNodeColor(nodeColorOptions[0])
    setIsChildNodeModalOpen(false)
  }

  const handleOpenCreateEvent = (categoryId = selectedNode?.id) => {
    setDraftTodos([])
    setEventModal({
      mode: 'create',
      date: todayKey,
      startTime: '09:00',
      endTime: '10:00',
      categoryId,
    })
  }

  const handleSelectChildNode = (parentNodeId: string, childNodeId: string) => {
    setSelectedNodeId(parentNodeId)
    setHighlightedChildNodeId(childNodeId)
    globalThis.setTimeout(() => {
      const target = childNodeDetailRefs.current[childNodeId]

      if (!target) {
        return
      }

      target.open = true
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  const handleStartEdit = (nodeId: string, label: string, color: string) => {
    setEditingNodeId(nodeId)
    setEditingNodeName(label)
    setEditingNodeColor(color)
  }

  const handleSaveEdit = () => {
    if (!editingNodeId) {
      return
    }

    updateNode(editingNodeId, {
      label: editingNodeName,
      color: editingNodeColor,
    })
    setEditingNodeId(null)
    setEditingNodeName('')
    setEditingNodeColor(nodeColorOptions[0])
  }
  const getNodeColor = (nodeId: string) =>
    nodes.find((node) => node.id === nodeId)?.color ?? 'var(--color-brand)'
  const handleSaveEvent = (draft: CalendarEventDraft) => {
    if (!eventModal) {
      return
    }

    if (eventModal.mode === 'edit') {
      updateEvent(eventModal.event.id, draft)
    } else {
      const createdEvent = addEvent(draft)

      draftTodos.forEach((todo) => {
        addTodo({
          title: todo.title,
          completed: todo.completed,
          date: createdEvent.date,
          categoryId: todo.categoryId,
          eventId: createdEvent.id,
          priority: todo.priority ?? 'MEDIUM',
          priorityOrder: todo.priorityOrder,
          createdAt: createdEvent.date,
        })
      })
      setDraftTodos([])
    }

    setEventModal(null)
  }
  const handleDeleteEvent = () => {
    if (!eventModal || eventModal.mode !== 'edit') {
      return
    }

    deleteEvent(eventModal.event.id)
    setEventModal(null)
  }
  const handleAddScheduleTodo = (event: CalendarEvent) => {
    const title = newTodoTitle.trim()

    if (!title) {
      return
    }

    addTodo({
      title,
      completed: false,
      date: event.date,
      categoryId: newTodoCategoryId || todoCategories[0]?.id,
      eventId: event.id,
      priority: 'MEDIUM',
      createdAt: event.date,
    })
    setNewTodoTitle('')
    setCreatingTodoEventId(null)
  }
  const handleDropNode = (dropEvent: DragEvent<HTMLElement>, targetNodeId?: string) => {
    dropEvent.preventDefault()
    const draggedNodeId = dropEvent.dataTransfer.getData('text/plain')

    if (!draggedNodeId || draggedNodeId === targetNodeId) {
      setDraggingNodeId(null)
      setDragOverNodeId(null)
      setIsDragOverEnd(false)
      return
    }

    const nextNodeIds = parentNodes.map((node) => node.id)
    const draggedIndex = nextNodeIds.indexOf(draggedNodeId)

    if (draggedIndex < 0) {
      setDraggingNodeId(null)
      setDragOverNodeId(null)
      setIsDragOverEnd(false)
      return
    }

    nextNodeIds.splice(draggedIndex, 1)

    if (targetNodeId) {
      const targetIndex = nextNodeIds.indexOf(targetNodeId)
      nextNodeIds.splice(targetIndex < 0 ? nextNodeIds.length : targetIndex, 0, draggedNodeId)
    } else {
      nextNodeIds.push(draggedNodeId)
    }

    reorderNodes(nextNodeIds)
    dragHandleNodeIdRef.current = null
    setDraggingNodeId(null)
    setDragOverNodeId(null)
    setIsDragOverEnd(false)
  }
  const editingEventTodos = eventModalEvent
    ? todos.filter((todo) => todo.eventId === eventModalEvent.id)
    : []

  return (
    <main className={styles.libraryPage}>
      <section className={styles.header}>
        <div>
          <p>Library</p>
          <h1>Node를 관리합니다</h1>
        </div>
        <span>{nodes.length}개 node</span>
      </section>

      <form className={styles.createPanel} onSubmit={handleCreateNode}>
        <label>
          <span>Node 이름</span>
          <input
            value={nodeName}
            onChange={(changeEvent) => setNodeName(changeEvent.target.value)}
            placeholder="새 node 이름"
          />
        </label>
        <label>
          <span>색상</span>
          <ColorDropdownPicker label="색상 선택" value={nodeColor} onChange={setNodeColor} />
        </label>
        <button type="submit">상위 Node 추가</button>
      </form>

      <div className={styles.libraryGrid}>
        <section className={styles.nodeList} aria-label="Node 목록">
          <div className={styles.listSectionHeader}>
            <h2>상위 Node</h2>
            <span>드래그로 순서 변경</span>
          </div>
          {parentNodes.map((node) => {
            const childNodes = nodes.filter((childNode) => childNode.parentId === node.id)
            const nodeGroupIds = [node.id, ...childNodes.map((childNode) => childNode.id)]
            const eventCount = events.filter((event) => nodeGroupIds.includes(event.categoryId)).length
            const isEditing = editingNodeId === node.id
            const isSelected = selectedNode?.id === node.id

            return (
              <details
                key={node.id}
                className={`${styles.nodeDropdown} ${isSelected ? styles.selectedNodeItem : ''} ${
                  draggingNodeId === node.id ? styles.draggingNodeItem : ''
                } ${dragOverNodeId === node.id ? styles.dragOverNodeItem : ''}`}
                draggable
                onDragStart={(dragEvent) => {
                  if (dragHandleNodeIdRef.current !== node.id) {
                    dragEvent.preventDefault()
                    return
                  }

                  dragEvent.dataTransfer.setData('text/plain', node.id)
                  dragEvent.dataTransfer.effectAllowed = 'move'
                  setDraggingNodeId(node.id)
                }}
                onDragEnd={() => {
                  dragHandleNodeIdRef.current = null
                  setDraggingNodeId(null)
                  setDragOverNodeId(null)
                  setIsDragOverEnd(false)
                }}
                onDragOver={(dragEvent) => {
                  dragEvent.preventDefault()

                  if (draggingNodeId && draggingNodeId !== node.id) {
                    setDragOverNodeId(node.id)
                    setIsDragOverEnd(false)
                  }
                }}
                onDragLeave={() => {
                  if (dragOverNodeId === node.id) {
                    setDragOverNodeId(null)
                  }
                }}
                onDrop={(dropEvent) => handleDropNode(dropEvent, node.id)}
              >
                <summary className={styles.nodeItem}>
                  <span
                    className={styles.nodeDragHandle}
                    role="button"
                    tabIndex={0}
                    aria-label={`${node.label} 순서 변경 핸들`}
                    onClick={(clickEvent) => clickEvent.preventDefault()}
                    onPointerDown={() => {
                      dragHandleNodeIdRef.current = node.id
                    }}
                  >
                    ::
                  </span>
                  <button
                    type="button"
                    className={styles.nodeSelectButton}
                    onClick={(clickEvent) => {
                      clickEvent.preventDefault()
                      setSelectedNodeId(node.id)
                    }}
                    aria-label={`${node.label} 상세 보기`}
                  >
                    <span className={styles.nodeColor} style={{ background: node.color }} />
                  </button>
                  <div className={styles.nodeBody}>
                    {isEditing ? (
                      <input
                        value={editingNodeName}
                        onClick={(clickEvent) => clickEvent.preventDefault()}
                        onChange={(changeEvent) => setEditingNodeName(changeEvent.target.value)}
                        aria-label={`${node.label} 이름 수정`}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={(clickEvent) => {
                          clickEvent.preventDefault()
                          setSelectedNodeId(node.id)
                        }}
                      >
                        {node.label}
                      </button>
                    )}
                    <p>
                      {eventCount}개 일정 · 하위 {childNodes.length}개
                    </p>
                  </div>
                  {isEditing ? (
                    <div onClick={(clickEvent) => clickEvent.preventDefault()}>
                      <ColorDropdownPicker
                        label={`${node.label} 색상 수정`}
                        value={editingNodeColor}
                        onChange={setEditingNodeColor}
                      />
                    </div>
                  ) : null}
                  <div
                    className={styles.nodeActions}
                    onClick={(clickEvent) => clickEvent.preventDefault()}
                  >
                    {isEditing ? (
                      <button type="button" onClick={handleSaveEdit}>
                        저장
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(node.id, node.label, node.color)}
                      >
                        수정
                      </button>
                    )}
                    <button type="button" onClick={() => deleteNode(node.id)}>
                      삭제
                    </button>
                  </div>
                </summary>
                <div className={styles.nodeDropdownPanel}>
                  {childNodes.length > 0 ? (
                    childNodes.map((childNode) => {
                      const childEventCount = events.filter(
                        (event) => event.categoryId === childNode.id,
                      ).length

                      return (
                        <button
                          key={childNode.id}
                          type="button"
                          className={styles.nodeDropdownChild}
                          onClick={() => handleSelectChildNode(node.id, childNode.id)}
                        >
                          <span className={styles.nodeColor} style={{ background: childNode.color }} />
                          <span>{childNode.label}</span>
                          <small>{childEventCount}개 일정</small>
                        </button>
                      )
                    })
                  ) : (
                    <span className={styles.emptyDropdownItem}>하위 Node가 없습니다</span>
                  )}
                </div>
              </details>
            )
          })}
          <div
            className={`${styles.nodeEndDropZone} ${
              isDragOverEnd ? styles.activeNodeEndDropZone : ''
            }`}
            onDragOver={(dragEvent) => {
              dragEvent.preventDefault()

              if (draggingNodeId) {
                setDragOverNodeId(null)
                setIsDragOverEnd(true)
              }
            }}
            onDragLeave={() => setIsDragOverEnd(false)}
            onDrop={(dropEvent) => handleDropNode(dropEvent)}
          />
        </section>

        <section className={styles.nodeDetail} aria-label="Node 상세">
          {selectedNode ? (
            <>
              <div className={styles.nodeDetailHeader}>
                <div className={styles.nodeDetailTitle}>
                  <span className={styles.nodeColor} style={{ background: selectedNode.color }} />
                  <div>
                    <p>Selected Node</p>
                    <h2>{selectedNode.label}</h2>
                  </div>
                </div>
                <div className={styles.detailActions}>
                  <button type="button" onClick={() => setIsChildNodeModalOpen(true)}>
                    하위 Node 생성
                  </button>
                  <button type="button" onClick={() => handleOpenCreateEvent(selectedNode.id)}>
                    일정 생성
                  </button>
                </div>
              </div>
              <div className={styles.listSectionHeader}>
                <h3>상위 Node 일정</h3>
                <span>{selectedNodeEvents.length}개</span>
              </div>
              <div className={styles.scheduleList}>
                {selectedNodeEvents.map((event) => {
                  const eventTodos = todos.filter((todo) => todo.eventId === event.id)

                  return (
                    <article key={event.id} className={styles.scheduleItem}>
                      <div className={styles.scheduleHeader}>
                        <div>
                          <button
                            type="button"
                            className={styles.scheduleTitleButton}
                            onClick={() => setEventModal({ mode: 'edit', event })}
                          >
                            {event.title}
                          </button>
                          <p>
                            {event.date} {event.startTime} - {event.endTime}
                          </p>
                        </div>
                        <button
                          type="button"
                          className={styles.scheduleAddTodoButton}
                          onClick={() => {
                            setCreatingTodoEventId(event.id)
                            setNewTodoCategoryId(todoCategories[0]?.id ?? '')
                            setNewTodoTitle('')
                          }}
                          aria-label={`${event.title}에 Todo 추가`}
                        >
                          +
                        </button>
                      </div>
                      <div className={styles.scheduleTodos}>
                        {eventTodos.length > 0 ? (
                          eventTodos.map((todo) => (
                            <div key={todo.id} className={styles.scheduleTodoItem}>
                              <label>
                                <input
                                  type="checkbox"
                                  checked={todo.completed}
                                  onChange={() => toggleTodo(todo.id)}
                                />
                                <span>{todo.title}</span>
                              </label>
                              <select
                                value={todo.categoryId ?? todoCategories[0]?.id ?? ''}
                                onChange={(changeEvent) =>
                                  updateTodo(todo.id, { categoryId: changeEvent.target.value })
                                }
                                aria-label={`${todo.title} Todo 카테고리`}
                              >
                                {todoCategories.map((category) => (
                                  <option key={category.id} value={category.id}>
                                    #{category.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))
                        ) : (
                          <span>연결된 Todo가 없습니다</span>
                        )}
                        {creatingTodoEventId === event.id ? (
                          <div className={styles.scheduleTodoCreateForm}>
                            <textarea
                              value={newTodoTitle}
                              onChange={(changeEvent) => setNewTodoTitle(changeEvent.target.value)}
                              placeholder="새 Todo"
                              aria-label={`${event.title} 새 Todo`}
                            />
                            <select
                              value={newTodoCategoryId}
                              onChange={(changeEvent) =>
                                setNewTodoCategoryId(changeEvent.target.value)
                              }
                              aria-label="새 Todo 카테고리"
                            >
                              {todoCategories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  #{category.label}
                                </option>
                              ))}
                            </select>
                            <button type="button" onClick={() => handleAddScheduleTodo(event)}>
                              추가
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCreatingTodoEventId(null)
                                setNewTodoTitle('')
                              }}
                            >
                              취소
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  )
                })}
                {selectedNodeEvents.length === 0 ? (
                  <p className={styles.emptyDetail}>이 node에 속한 일정이 없습니다</p>
                ) : null}
              </div>
              <section className={styles.childNodeSection} aria-label="하위 Node">
                <div className={styles.listSectionHeader}>
                  <h3>하위 Node</h3>
                  <span>{selectedChildNodes.length}개</span>
                </div>
                {selectedChildNodes.length > 0 ? (
                  <div className={styles.childNodeDetailList}>
                    {selectedChildNodes.map((childNode) => {
                      const childEvents = events
                        .filter((event) => event.categoryId === childNode.id)
                        .sort((first, second) =>
                          `${first.date} ${first.startTime}`.localeCompare(
                            `${second.date} ${second.startTime}`,
                          ),
                        )

                      return (
                        <details
                          key={childNode.id}
                          ref={(element) => {
                            childNodeDetailRefs.current[childNode.id] = element
                          }}
                          className={`${styles.childNodeDetail} ${
                            highlightedChildNodeId === childNode.id
                              ? styles.highlightedChildNodeDetail
                              : ''
                          }`}
                        >
                          <summary>
                            <span className={styles.nodeColor} style={{ background: childNode.color }} />
                            <span>{childNode.label}</span>
                            <small>{childEvents.length}개 일정</small>
                          </summary>
                          <div className={styles.childNodeScheduleHeader}>
                            <span>{childNode.label} 일정</span>
                            <button type="button" onClick={() => handleOpenCreateEvent(childNode.id)}>
                              일정 생성
                            </button>
                          </div>
                          <div className={styles.scheduleList}>
                            {childEvents.length > 0 ? (
                              childEvents.map((event) => {
                                const eventTodos = todos.filter((todo) => todo.eventId === event.id)

                                return (
                                  <article key={event.id} className={styles.scheduleItem}>
                                    <div className={styles.scheduleHeader}>
                                      <div>
                                        <button
                                          type="button"
                                          className={styles.scheduleTitleButton}
                                          onClick={() => setEventModal({ mode: 'edit', event })}
                                        >
                                          {event.title}
                                        </button>
                                        <p>
                                          {event.date} {event.startTime} - {event.endTime}
                                        </p>
                                      </div>
                                      <button
                                        type="button"
                                        className={styles.scheduleAddTodoButton}
                                        onClick={() => {
                                          setCreatingTodoEventId(event.id)
                                          setNewTodoCategoryId(todoCategories[0]?.id ?? '')
                                          setNewTodoTitle('')
                                        }}
                                        aria-label={`${event.title}에 Todo 추가`}
                                      >
                                        +
                                      </button>
                                    </div>
                                    <div className={styles.scheduleTodos}>
                                      {eventTodos.length > 0 ? (
                                        eventTodos.map((todo) => (
                                          <div key={todo.id} className={styles.scheduleTodoItem}>
                                            <label>
                                              <input
                                                type="checkbox"
                                                checked={todo.completed}
                                                onChange={() => toggleTodo(todo.id)}
                                              />
                                              <span>{todo.title}</span>
                                            </label>
                                            <select
                                              value={todo.categoryId ?? todoCategories[0]?.id ?? ''}
                                              onChange={(changeEvent) =>
                                                updateTodo(todo.id, {
                                                  categoryId: changeEvent.target.value,
                                                })
                                              }
                                              aria-label={`${todo.title} Todo 카테고리`}
                                            >
                                              {todoCategories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                  #{category.label}
                                                </option>
                                              ))}
                                            </select>
                                          </div>
                                        ))
                                      ) : (
                                        <span>연결된 Todo가 없습니다</span>
                                      )}
                                      {creatingTodoEventId === event.id ? (
                                        <div className={styles.scheduleTodoCreateForm}>
                                          <textarea
                                            value={newTodoTitle}
                                            onChange={(changeEvent) =>
                                              setNewTodoTitle(changeEvent.target.value)
                                            }
                                            placeholder="새 Todo"
                                            aria-label={`${event.title} 새 Todo`}
                                          />
                                          <select
                                            value={newTodoCategoryId}
                                            onChange={(changeEvent) =>
                                              setNewTodoCategoryId(changeEvent.target.value)
                                            }
                                            aria-label="새 Todo 카테고리"
                                          >
                                            {todoCategories.map((category) => (
                                              <option key={category.id} value={category.id}>
                                                #{category.label}
                                              </option>
                                            ))}
                                          </select>
                                          <button
                                            type="button"
                                            onClick={() => handleAddScheduleTodo(event)}
                                          >
                                            추가
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setCreatingTodoEventId(null)
                                              setNewTodoTitle('')
                                            }}
                                          >
                                            취소
                                          </button>
                                        </div>
                                      ) : null}
                                    </div>
                                  </article>
                                )
                              })
                            ) : (
                              <p className={styles.emptyDetail}>이 하위 node에 속한 일정이 없습니다</p>
                            )}
                          </div>
                        </details>
                      )
                    })}
                  </div>
                ) : (
                  <p className={styles.emptyDetail}>등록된 하위 node가 없습니다</p>
                )}
              </section>
            </>
          ) : (
            <p className={styles.emptyDetail}>Node를 먼저 추가해주세요</p>
          )}
        </section>
      </div>
      {isChildNodeModalOpen && selectedNode ? (
        <div
          className={styles.modalOverlay}
          role="presentation"
          onClick={() => setIsChildNodeModalOpen(false)}
        >
          <form
            className={styles.nodeModal}
            onClick={(clickEvent) => clickEvent.stopPropagation()}
            onSubmit={handleCreateChildNode}
          >
            <div className={styles.nodeModalHeader}>
              <div>
                <p>하위 Node 생성</p>
                <h2>{selectedNode.label} 안에 추가합니다</h2>
              </div>
              <button type="button" onClick={() => setIsChildNodeModalOpen(false)} aria-label="닫기">
                x
              </button>
            </div>
            <label>
              <span>이름</span>
              <input
                value={childNodeName}
                onChange={(changeEvent) => setChildNodeName(changeEvent.target.value)}
                placeholder="하위 node 이름"
                autoFocus
              />
            </label>
            <label>
              <span>색상</span>
              <ColorDropdownPicker
                label="색상 선택"
                value={childNodeColor}
                onChange={setChildNodeColor}
              />
            </label>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setIsChildNodeModalOpen(false)}>
                취소
              </button>
              <button type="submit">생성</button>
            </div>
          </form>
        </div>
      ) : null}
      {eventModal ? (
        <EventModal
          key={eventModal.mode === 'edit' ? eventModal.event.id : 'library-create-event'}
          categories={libraryEventCategories}
          defaultDate={eventModal.mode === 'edit' ? eventModal.event.date : eventModal.date}
          defaultEndTime={eventModal.mode === 'edit' ? eventModal.event.endTime : eventModal.endTime}
          defaultStartTime={
            eventModal.mode === 'edit' ? eventModal.event.startTime : eventModal.startTime
          }
          event={eventModal.mode === 'edit' ? eventModal.event : undefined}
          getCategoryColor={getNodeColor}
          linkedTodosSlot={
            <EventTodoList
              categories={todoCategories}
              defaultCategoryId={
                (eventModal.mode === 'edit'
                  ? editingEventTodos[0]?.categoryId
                  : draftTodos[0]?.categoryId) ?? todoCategories[0]?.id
              }
              todos={eventModal.mode === 'edit' ? editingEventTodos : draftTodos}
              onAddTodo={(title, categoryId) => {
                if (eventModal.mode === 'edit') {
                  addTodo({
                    title,
                    completed: false,
                    date: eventModal.event.date,
                    categoryId,
                    eventId: eventModal.event.id,
                    priority: 'MEDIUM',
                    createdAt: eventModal.event.date,
                  })
                  return
                }

                setDraftTodos((prevTodos) => [
                  ...prevTodos,
                  {
                    id: `draft-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
                    title,
                    completed: false,
                    date: eventModal.date,
                    categoryId,
                    priority: 'MEDIUM',
                    createdAt: eventModal.date,
                  },
                ])
              }}
              onDeleteTodo={(todoId) => {
                if (eventModal.mode === 'edit') {
                  deleteTodo(todoId)
                  return
                }

                setDraftTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== todoId))
              }}
              onToggleTodo={(todoId) => {
                if (eventModal.mode === 'edit') {
                  toggleTodo(todoId)
                  return
                }

                setDraftTodos((prevTodos) =>
                  prevTodos.map((todo) =>
                    todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
                  ),
                )
              }}
              onUpdateTodo={(todoId, draft) => {
                if (eventModal.mode === 'edit') {
                  updateTodo(todoId, draft)
                  return
                }

                setDraftTodos((prevTodos) =>
                  prevTodos.map((todo) => (todo.id === todoId ? { ...todo, ...draft } : todo)),
                )
              }}
            />
          }
          mode={eventModal.mode}
          onClose={() => {
            setEventModal(null)
            setDraftTodos([])
          }}
          onDelete={handleDeleteEvent}
          onSave={handleSaveEvent}
        />
      ) : null}
    </main>
  )
}
