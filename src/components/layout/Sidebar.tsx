'use client'

import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import EventModal from '@/components/calendar/weekly/EventModal'
import EventTodoList from '@/components/calendar/daily/EventTodoList'
import { useCalendarStore } from '@/stores/calendarStore'
import type { CalendarEvent, CalendarEventDraft } from '@/types/calendar'
import styles from './sidebar.module.css'

const navItems = [
  { label: '캘린더', href: '/calendar' },
  { label: '라이브러리', href: '/library' },
  { label: '루틴', href: '/routine' },
  { label: '일기', href: '/' },
  { label: '친구', href: '/' },
  { label: '설정', href: '/' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const nodes = useCalendarStore((state) => state.nodes)
  const events = useCalendarStore((state) => state.events)
  const todos = useCalendarStore((state) => state.todos)
  const updateEvent = useCalendarStore((state) => state.updateEvent)
  const deleteEvent = useCalendarStore((state) => state.deleteEvent)
  const addTodo = useCalendarStore((state) => state.addTodo)
  const updateTodo = useCalendarStore((state) => state.updateTodo)
  const deleteTodo = useCalendarStore((state) => state.deleteTodo)
  const toggleTodo = useCalendarStore((state) => state.toggleTodo)
  const todoCategories = useCalendarStore((state) => state.todoCategories)
  const visibleNodeIds = useCalendarStore((state) => state.visibleNodeIds)
  const toggleNodeVisibility = useCalendarStore((state) => state.toggleNodeVisibility)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const today = useMemo(() => dayjs(), [])
  const miniMonthTitle = today.format('YYYY년 M월')
  const isCalendarPage = pathname.startsWith('/calendar')
  const isLibraryPage = pathname.startsWith('/library')
  const miniDays = useMemo(() => {
    const month = today.startOf('month')
    const start = month.startOf('week')

    return Array.from({ length: 42 }, (_, index) => {
      const date = start.add(index, 'day')

      return {
        key: date.format('YYYY-MM-DD'),
        dayNumber: date.date(),
        isCurrentMonth: date.month() === month.month(),
        isToday: date.isSame(today, 'day'),
      }
    })
  }, [today])
  const getNodeColor = (nodeId: string) =>
    nodes.find((node) => node.id === nodeId)?.color ?? 'var(--color-brand)'
  const handleSaveEvent = (draft: CalendarEventDraft) => {
    if (!editingEvent) {
      return
    }

    updateEvent(editingEvent.id, draft)
    setEditingEvent(null)
  }
  const handleDeleteEvent = () => {
    if (!editingEvent) {
      return
    }

    deleteEvent(editingEvent.id)
    setEditingEvent(null)
  }
  const editingEventTodos = editingEvent
    ? todos.filter((todo) => todo.eventId === editingEvent.id)
    : []
  const renderNodeTreeItem = (node: (typeof nodes)[number], showCheckbox: boolean) => {
    const isVisible = visibleNodeIds.includes(node.id)
    const childNodes = nodes.filter((childNode) => childNode.parentId === node.id)
    const nodeEvents = events.filter((event) => event.categoryId === node.id)
    const visibleEvents = showCheckbox && !isVisible ? [] : nodeEvents

    return (
      <details key={node.id} className={styles.nodeTreeItem}>
        <summary className={styles.nodeTreeSummary}>
          {showCheckbox ? (
            <input
              type="checkbox"
              checked={isVisible}
              aria-label={`${node.label} 표시`}
              onChange={() => toggleNodeVisibility(node.id)}
              onClick={(clickEvent) => clickEvent.stopPropagation()}
            />
          ) : null}
          <span className={styles.categoryDot} style={{ background: node.color }} />
          <span>{node.label}</span>
        </summary>
        {childNodes.length > 0 ? (
          <div className={styles.childNodeTree}>
            {childNodes.map((childNode) => renderNodeTreeItem(childNode, showCheckbox))}
          </div>
        ) : null}
        {visibleEvents.length > 0 ? (
          <div className={styles.scheduleTree}>
            {visibleEvents.map((event) => {
              const eventTodos = todos.filter((todo) => todo.eventId === event.id)

              return (
                <details key={event.id} className={styles.scheduleTreeItem}>
                  <summary>
                    <button
                      type="button"
                      className={styles.scheduleTreeButton}
                      onClick={(clickEvent) => {
                        clickEvent.preventDefault()
                        clickEvent.stopPropagation()
                        setEditingEvent(event)
                      }}
                    >
                      {event.title}
                    </button>
                    <time>
                      {dayjs(event.date).format('M/D')} {event.startTime}
                    </time>
                  </summary>
                  {eventTodos.length > 0 ? (
                    <div className={styles.todoTree}>
                      {eventTodos.map((todo) => (
                        <label key={todo.id} className={styles.todoTreeItem}>
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => toggleTodo(todo.id)}
                          />
                          <span>{todo.title}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <span className={styles.emptyTreeItem}>연결된 Todo 없음</span>
                  )}
                </details>
              )
            })}
          </div>
        ) : (
          <span className={styles.emptyTreeItem}>
            {showCheckbox && !isVisible ? '숨김 처리됨' : '등록된 일정 없음'}
          </span>
        )}
      </details>
    )
  }
  const renderNodeTree = (showCheckbox: boolean) => (
    <section className={`${styles.section} ${styles.nodeSection}`} aria-label="그룹 목록">
      <div className={styles.nodeTree}>
        {nodes
          .filter((node) => !node.parentId)
          .map((node) => renderNodeTreeItem(node, showCheckbox))}
      </div>
    </section>
  )

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoMark} aria-hidden="true">
          <Image src="/dayleaf-logo.png" alt="" width={34} height={33} priority />
        </span>
        <span>DayLeaf</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === item.href
              : pathname.startsWith(item.href.replace('/monthly', ''))

          return (
            <div key={item.label} className={styles.navItemGroup}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}
              >
                {item.label}
              </Link>
              {item.label === '캘린더' && isCalendarPage ? renderNodeTree(true) : null}
              {item.label === '라이브러리' && isLibraryPage ? renderNodeTree(false) : null}
            </div>
          )
        })}
      </nav>

      <section className={styles.section} aria-labelledby="mini-calendar-title">
        <div className={styles.sectionHeader}>
          <h2 id="mini-calendar-title">{miniMonthTitle}</h2>
        </div>
        <div className={styles.miniCalendar}>
          {['일', '월', '화', '수', '목', '금', '토'].map((weekday) => (
            <span key={weekday} className={styles.weekday}>
              {weekday}
            </span>
          ))}
          {miniDays.map((day) => (
            <button
              key={day.key}
              className={`${styles.miniDay} ${day.isToday ? styles.selectedMiniDay : ''} ${
                day.isCurrentMonth ? '' : styles.mutedMiniDay
              }`}
              type="button"
            >
              {day.isCurrentMonth ? day.dayNumber : ''}
            </button>
          ))}
        </div>
      </section>

      {editingEvent ? (
        <EventModal
          key={editingEvent.id}
          categories={nodes}
          defaultDate={editingEvent.date}
          defaultEndTime={editingEvent.endTime}
          defaultStartTime={editingEvent.startTime}
          event={editingEvent}
          getCategoryColor={getNodeColor}
          linkedTodosSlot={
            <EventTodoList
              categories={todoCategories}
              defaultCategoryId={editingEventTodos[0]?.categoryId ?? todoCategories[0]?.id}
              todos={editingEventTodos}
              onAddTodo={(title, categoryId) =>
                addTodo({
                  title,
                  completed: false,
                  date: editingEvent.date,
                  categoryId,
                  eventId: editingEvent.id,
                  priority: 'MEDIUM',
                  createdAt: editingEvent.date,
                })
              }
              onDeleteTodo={deleteTodo}
              onToggleTodo={toggleTodo}
              onUpdateTodo={updateTodo}
            />
          }
          mode="edit"
          onClose={() => setEditingEvent(null)}
          onDelete={handleDeleteEvent}
          onSave={handleSaveEvent}
        />
      ) : null}
    </aside>
  )
}
