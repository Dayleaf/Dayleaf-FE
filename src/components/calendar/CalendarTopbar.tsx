'use client'

import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import styles from './calendarTopbar.module.css'

const views = [
  { label: '일', href: '/calendar' },
  { label: '주', href: '/calendar/weekly' },
  { label: '월', href: '/calendar/monthly' },
]

function getView(pathname: string) {
  if (pathname === '/calendar/weekly') {
    return 'week'
  }

  if (pathname === '/calendar/monthly') {
    return 'month'
  }

  return 'day'
}

function getPathDate(pathname: string) {
  const [, date] = pathname.match(/^\/calendar\/(\d{4}-\d{2}-\d{2})$/) ?? []
  return date
}

function getDateHref(pathname: string, date: string, isTodoOpen = false) {
  const view = getView(pathname)
  const params = new URLSearchParams({ date })

  if (view === 'week' && isTodoOpen) {
    params.set('todo', 'open')
  }

  if (view === 'week') {
    return `/calendar/weekly?${params.toString()}`
  }

  if (view === 'month') {
    return `/calendar/monthly?${params.toString()}`
  }

  return `/calendar?${params.toString()}`
}

function getViewHref(href: string, date: string) {
  return `${href}?${new URLSearchParams({ date }).toString()}`
}

function getDatePickerDays(baseDate: dayjs.Dayjs) {
  const start = baseDate.startOf('month').startOf('week')

  return Array.from({ length: 42 }, (_, index) => start.add(index, 'day'))
}

export default function CalendarTopbar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const view = getView(pathname)
  const isWeeklyView = pathname === '/calendar/weekly'
  const isTodoOpen = searchParams.get('todo') === 'open'
  const selectedDate = searchParams.get('date') ?? getPathDate(pathname) ?? dayjs().format('YYYY-MM-DD')
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [datePickerMonthDraft, setDatePickerMonthDraft] = useState<string | null>(null)
  const currentDate = useMemo(() => dayjs(selectedDate), [selectedDate])
  const datePickerMonth = useMemo(
    () => dayjs(datePickerMonthDraft ?? selectedDate).startOf('month'),
    [datePickerMonthDraft, selectedDate],
  )
  const datePickerDays = useMemo(() => getDatePickerDays(datePickerMonth), [datePickerMonth])
  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), [])
  const moveUnit = view === 'day' ? 'day' : view === 'week' ? 'week' : 'month'
  const previousHref = getDateHref(
    pathname,
    currentDate.subtract(1, moveUnit).format('YYYY-MM-DD'),
    isTodoOpen,
  )
  const nextHref = getDateHref(
    pathname,
    currentDate.add(1, moveUnit).format('YYYY-MM-DD'),
    isTodoOpen,
  )
  const todayHref = getDateHref(pathname, today, isTodoOpen)
  const todoParams = new URLSearchParams({ date: selectedDate })

  if (!isTodoOpen) {
    todoParams.set('todo', 'open')
  }

  const todoHref = isTodoOpen
    ? `/calendar/weekly?${new URLSearchParams({ date: selectedDate }).toString()}`
    : `/calendar/weekly?${todoParams.toString()}`
  const currentLabel = useMemo(() => {
    if (view === 'day') {
      return currentDate.format('YYYY년 M월 D일')
    }

    if (view === 'week') {
      const daysSinceMonday = currentDate.day() === 0 ? 6 : currentDate.day() - 1
      const weekStart = currentDate.subtract(daysSinceMonday, 'day')
      const weekEnd = weekStart.add(6, 'day')

      return `${weekStart.format('YYYY년 M월 D일')} - ${weekEnd.format('M월 D일')}`
    }

    return currentDate.format('YYYY년 M월')
  }, [currentDate, view])
  const previousLabel =
    view === 'day' ? '어제' : view === 'week' ? '지난주' : '지난달'
  const nextLabel =
    view === 'day' ? '내일' : view === 'week' ? '다음주' : '다음달'
  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <header className={styles.topbar}>
      <div className={styles.leftGroup}>
        <Link href={todayHref} className={styles.todayButton}>
          오늘
        </Link>
        <div className={styles.monthControls} aria-label="날짜 이동">
          <Link className={styles.iconButton} href={previousHref} aria-label={previousLabel}>
            &lt;
          </Link>
          <Link className={styles.iconButton} href={nextHref} aria-label={nextLabel}>
            &gt;
          </Link>
        </div>
        <div className={styles.dateTitleGroup}>
          <h1 className={styles.currentMonth}>{currentLabel}</h1>
          <div className={styles.datePickerWrap}>
            <button
              className={`${styles.iconButton} ${styles.datePickerButton}`}
              type="button"
              aria-label="날짜 선택"
              aria-expanded={isDatePickerOpen}
              onClick={() => {
                setDatePickerMonthDraft(null)
                setIsDatePickerOpen((open) => !open)
              }}
            >
              v
            </button>
            {isDatePickerOpen ? (
              <div className={styles.datePickerPanel}>
                <div className={styles.datePickerHeader}>
                  <strong>{datePickerMonth.format('YYYY년 M월')}</strong>
                  <div className={styles.datePickerNav}>
                    <button
                      className={styles.datePickerNavButton}
                      type="button"
                      aria-label="이전 해"
                      onClick={() =>
                        setDatePickerMonthDraft(
                          datePickerMonth.subtract(1, 'year').format('YYYY-MM-DD'),
                        )
                      }
                    >
                      &lt;&lt;
                    </button>
                    <button
                      className={styles.datePickerNavButton}
                      type="button"
                      aria-label="이전 달"
                      onClick={() =>
                        setDatePickerMonthDraft(
                          datePickerMonth.subtract(1, 'month').format('YYYY-MM-DD'),
                        )
                      }
                    >
                      &lt;
                    </button>
                    <button
                      className={styles.datePickerNavButton}
                      type="button"
                      aria-label="다음 달"
                      onClick={() =>
                        setDatePickerMonthDraft(
                          datePickerMonth.add(1, 'month').format('YYYY-MM-DD'),
                        )
                      }
                    >
                      &gt;
                    </button>
                    <button
                      className={styles.datePickerNavButton}
                      type="button"
                      aria-label="다음 해"
                      onClick={() =>
                        setDatePickerMonthDraft(
                          datePickerMonth.add(1, 'year').format('YYYY-MM-DD'),
                        )
                      }
                    >
                      &gt;&gt;
                    </button>
                  </div>
                </div>
                <div className={styles.datePickerWeekDays}>
                  {weekDays.map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
                <div className={styles.datePickerCalendar}>
                  {datePickerDays.map((date) => {
                    const dateValue = date.format('YYYY-MM-DD')
                    const isSelected = dateValue === selectedDate
                    const isToday = dateValue === today
                    const isOutsideMonth = !date.isSame(datePickerMonth, 'month')

                    return (
                      <Link
                        key={dateValue}
                        href={getDateHref(pathname, dateValue, isTodoOpen)}
                        className={`${styles.datePickerDay} ${
                          isSelected ? styles.selectedDatePickerDay : ''
                        } ${isToday ? styles.todayDatePickerDay : ''} ${
                          isOutsideMonth ? styles.outsideDatePickerDay : ''
                        }`}
                        onClick={() => {
                          setDatePickerMonthDraft(null)
                          setIsDatePickerOpen(false)
                        }}
                      >
                        {date.format('D')}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className={styles.rightGroup}>
        <nav className={styles.viewSwitcher} aria-label="캘린더 보기">
          {views.map((view) => (
            <Link
              key={view.href}
              href={getViewHref(view.href, selectedDate)}
              className={`${styles.viewLink} ${
                getView(pathname) === getView(view.href) ? styles.activeView : ''
              }`}
            >
              {view.label}
            </Link>
          ))}
        </nav>
        {isWeeklyView ? (
          <Link
            href={todoHref}
            className={`${styles.todoButton} ${isTodoOpen ? styles.activeTodoButton : ''}`}
          >
            Todo
          </Link>
        ) : null}
      </div>
    </header>
  )
}
