'use client'

import dayjs from 'dayjs'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useCalendarStore } from '@/stores/calendarStore'
import type { CalendarRoutine, RoutineFrequency } from '@/types/calendar'
import styles from './routine.module.css'

type ChartView = 'week' | 'month'

const frequencyLabels: Record<RoutineFrequency, string> = {
  DAILY: '매일',
  WEEKDAYS: '평일',
  WEEKLY: '매주',
  MONTHLY: '매월',
}

function countExpectedOccurrences(routine: CalendarRoutine, from: string, to: string) {
  const start = dayjs(from).isAfter(dayjs(routine.startDate), 'day') ? dayjs(from) : dayjs(routine.startDate)
  const endLimit = routine.completedAt ?? routine.dueDate
  const end = dayjs(to).isBefore(dayjs(endLimit), 'day') ? dayjs(to) : dayjs(endLimit)

  if (end.isBefore(start, 'day')) {
    return 0
  }

  if (routine.frequency === 'WEEKLY') {
    return Math.floor(end.diff(start, 'day') / 7) + 1
  }

  if (routine.frequency === 'MONTHLY') {
    return end.diff(start, 'month') + 1
  }

  let count = 0
  let cursor = start

  while (!cursor.isAfter(end, 'day')) {
    if (routine.frequency === 'DAILY' || [1, 2, 3, 4, 5].includes(cursor.day())) {
      count += 1
    }

    cursor = cursor.add(1, 'day')
  }

  return count
}

function getRoutineProgress(routine: CalendarRoutine) {
  const until = routine.completedAt ?? dayjs().format('YYYY-MM-DD')
  const expected = countExpectedOccurrences(routine, routine.startDate, until)
  const completed = routine.completionDates.filter((date) => {
    const current = dayjs(date)

    return !current.isBefore(dayjs(routine.startDate), 'day') && !current.isAfter(dayjs(until), 'day')
  }).length

  if (expected === 0) {
    return 0
  }

  return Math.min(100, Math.round((completed / expected) * 100))
}

function getWeekStart(date: dayjs.Dayjs) {
  const daysSinceMonday = date.day() === 0 ? 6 : date.day() - 1

  return date.subtract(daysSinceMonday, 'day')
}

function getChartPeriods(
  view: ChartView,
  selectedWeekStart: dayjs.Dayjs,
  selectedMonthYear: dayjs.Dayjs,
) {
  if (view === 'week') {
    const end = selectedWeekStart.add(6, 'day')

    return [
      {
        key: selectedWeekStart.format('YYYY-MM-DD'),
        label: `${selectedWeekStart.format('M/D')}~${end.format('M/D')}`,
        start: selectedWeekStart.format('YYYY-MM-DD'),
        end: end.format('YYYY-MM-DD'),
      },
    ]
  }

  const currentMonth = selectedMonthYear.startOf('year')

  return Array.from({ length: 12 }, (_, index) => {
    const start = currentMonth.add(index, 'month')
    const end = start.endOf('month')

    return {
      key: start.format('YYYY-MM'),
      label: start.format('M월'),
      start: start.format('YYYY-MM-DD'),
      end: end.format('YYYY-MM-DD'),
    }
  })
}

export default function RoutinePage() {
  const routines = useCalendarStore((state) => state.routines)
  const updateRoutine = useCalendarStore((state) => state.updateRoutine)
  const completeRoutine = useCalendarStore((state) => state.completeRoutine)
  const reopenRoutine = useCalendarStore((state) => state.reopenRoutine)
  const deleteRoutine = useCalendarStore((state) => state.deleteRoutine)
  const [activeView, setActiveView] = useState<ChartView>('week')
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => getWeekStart(dayjs()))
  const [selectedMonthYear, setSelectedMonthYear] = useState(() => dayjs().startOf('year'))
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingFrequency, setEditingFrequency] = useState<RoutineFrequency>('DAILY')
  const [editingDueDate, setEditingDueDate] = useState('')
  const activeRoutines = routines.filter((routine) => !routine.completedAt)
  const completedRoutines = routines.filter((routine) => routine.completedAt)
  const periods = useMemo(
    () => getChartPeriods(activeView, selectedWeekStart, selectedMonthYear),
    [activeView, selectedMonthYear, selectedWeekStart],
  )

  useEffect(() => {
    if (!openMenuId) {
      return
    }

    const handlePointerDown = (pointerEvent: PointerEvent) => {
      const target = pointerEvent.target

      if (target instanceof Element && target.closest('[data-routine-menu]')) {
        return
      }

      setOpenMenuId(null)
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [openMenuId])

  const handleStartEdit = (routine: CalendarRoutine) => {
    setEditingRoutineId(routine.id)
    setEditingTitle(routine.title)
    setEditingFrequency(routine.frequency)
    setEditingDueDate(routine.dueDate)
    setOpenMenuId(null)
  }

  const handleSaveEdit = (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()

    if (!editingRoutineId || !editingTitle.trim()) {
      return
    }

    updateRoutine(editingRoutineId, {
      title: editingTitle,
      frequency: editingFrequency,
      dueDate: editingDueDate,
    })
    setEditingRoutineId(null)
  }

  const renderRoutineItem = (routine: CalendarRoutine) => {
    const progress = getRoutineProgress(routine)
    const isEditing = editingRoutineId === routine.id

    return (
      <article key={routine.id} className={styles.routineItem}>
        {isEditing ? (
          <form className={styles.routineEditForm} onSubmit={handleSaveEdit}>
            <input
              value={editingTitle}
              onChange={(changeEvent) => setEditingTitle(changeEvent.target.value)}
              aria-label={`${routine.title} 이름 수정`}
            />
            <select
              value={editingFrequency}
              onChange={(changeEvent) => setEditingFrequency(changeEvent.target.value as RoutineFrequency)}
              aria-label={`${routine.title} 반복 주기 수정`}
            >
              {Object.entries(frequencyLabels).map(([frequency, label]) => (
                <option key={frequency} value={frequency}>
                  {label}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={editingDueDate}
              onChange={(changeEvent) => setEditingDueDate(changeEvent.target.value)}
              aria-label={`${routine.title} 기한 수정`}
            />
            <button type="submit">저장</button>
          </form>
        ) : (
          <div className={styles.routineTitleRow}>
            <div className={styles.routineText}>
              <span className={routine.completedAt ? styles.doneStatus : styles.activeStatus}>
                {routine.completedAt ? '종료' : '진행 중'}
              </span>
              <button type="button" onClick={() => handleStartEdit(routine)}>
                {routine.title}
              </button>
            </div>
            <div className={styles.routineMenuWrap} data-routine-menu>
              <button
                type="button"
                className={styles.moreButton}
                onClick={() =>
                  setOpenMenuId((currentId) => (currentId === routine.id ? null : routine.id))
                }
                aria-label={`${routine.title} 더보기`}
              >
                ⋮
              </button>
              {openMenuId === routine.id ? (
                <div className={styles.actionMenu}>
                  <button type="button" onClick={() => handleStartEdit(routine)}>
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (routine.completedAt) {
                        reopenRoutine(routine.id)
                      } else {
                        completeRoutine(routine.id)
                      }

                      setOpenMenuId(null)
                    }}
                  >
                    {routine.completedAt ? '미완료로 변경' : '완료'}
                  </button>
                  <button type="button" onClick={() => deleteRoutine(routine.id)}>
                    삭제
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}
        {isEditing ? null : (
          <span className={styles.routineMeta}>
            {frequencyLabels[routine.frequency]} · {routine.startDate} ~ {routine.dueDate}
          </span>
        )}
        <div className={styles.routineProgress} aria-label={`${routine.title} 진행률 ${progress}%`}>
          <span style={{ width: `${progress}%` }} />
        </div>
      </article>
    )
  }

  return (
    <main className={styles.routinePage}>
      <section className={styles.header}>
        <div>
          <p>Routine</p>
          <h1>반복 Todo 진행률</h1>
        </div>
        <div className={styles.viewTabs} aria-label="그래프 보기">
          <button
            type="button"
            className={activeView === 'week' ? styles.activeTab : undefined}
            onClick={() => setActiveView('week')}
          >
            주
          </button>
          <button
            type="button"
            className={activeView === 'month' ? styles.activeTab : undefined}
            onClick={() => setActiveView('month')}
          >
            월
          </button>
        </div>
      </section>
      <div className={styles.routineGrid}>
        <section className={styles.routineListPanel}>
          <div className={styles.listSectionHeader}>
            <h2>진행중 루틴</h2>
            <span>{activeRoutines.length}개</span>
          </div>
          <div className={styles.routineList}>
            {activeRoutines.map(renderRoutineItem)}
            {activeRoutines.length === 0 ? <p className={styles.emptyText}>진행중 루틴이 없습니다</p> : null}
          </div>
          <div className={styles.listSectionHeader}>
            <h2>완료 루틴</h2>
            <span>{completedRoutines.length}개</span>
          </div>
          <div className={styles.routineList}>
            {completedRoutines.map(renderRoutineItem)}
            {completedRoutines.length === 0 ? <p className={styles.emptyText}>완료 루틴이 없습니다</p> : null}
          </div>
        </section>
        <section className={styles.chartPanel}>
          <div className={styles.chartPanelHeader}>
            <div className={styles.listSectionHeader}>
              <h2>{activeView === 'week' ? '주별 수행 현황' : '월별 수행 현황'}</h2>
              <span>
                {activeView === 'week'
                  ? periods[0]?.label
                  : `${periods[0]?.label ?? ''} ~ ${periods[periods.length - 1]?.label ?? ''}`}
              </span>
            </div>
            {activeView === 'week' ? (
              <div className={styles.weekNavigator} aria-label="주간 기간 이동">
                <button
                  type="button"
                  onClick={() => setSelectedWeekStart((current) => current.subtract(1, 'week'))}
                  aria-label="이전 주"
                >
                  &lt;
                </button>
                <strong>
                  {periods[0]?.start} ~ {periods[0]?.end}
                </strong>
                <button
                  type="button"
                  onClick={() => setSelectedWeekStart((current) => current.add(1, 'week'))}
                  aria-label="다음 주"
                >
                  &gt;
                </button>
              </div>
            ) : null}
            {activeView === 'month' ? (
              <div className={styles.weekNavigator} aria-label="월간 연도 이동">
                <button
                  type="button"
                  onClick={() => setSelectedMonthYear((current) => current.subtract(1, 'year'))}
                  aria-label="이전 연도"
                >
                  &lt;
                </button>
                <strong>{selectedMonthYear.format('YYYY년')}</strong>
                <button
                  type="button"
                  onClick={() => setSelectedMonthYear((current) => current.add(1, 'year'))}
                  aria-label="다음 연도"
                >
                  &gt;
                </button>
              </div>
            ) : null}
          </div>
          <div className={styles.chartList}>
            {routines.map((routine) => (
              <article key={routine.id} className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <h3>{routine.title}</h3>
                    <p>
                      {routine.completedAt
                        ? `${routine.startDate} ~ ${routine.completedAt} 수행`
                        : `${routine.startDate}부터 진행중`}
                    </p>
                  </div>
                  <strong>{getRoutineProgress(routine)}%</strong>
                </div>
                <div
                  className={`${styles.progressChart} ${
                    activeView === 'month' ? styles.monthlyDonutGrid : ''
                  }`}
                >
                  {periods.map((period) => {
                    const expected = countExpectedOccurrences(routine, period.start, period.end)
                    const completed = routine.completionDates.filter((date) => {
                      const current = dayjs(date)

                      return !current.isBefore(dayjs(period.start), 'day') && !current.isAfter(dayjs(period.end), 'day')
                    }).length
                    const value = expected === 0 ? 0 : Math.min(100, Math.round((completed / expected) * 100))

                    return activeView === 'month' ? (
                      <div key={period.key} className={styles.donutItem}>
                        <div
                          className={styles.donutChart}
                          style={{ '--progress': `${value}%` } as React.CSSProperties}
                          aria-label={`${period.label} 수행률 ${value}%`}
                        >
                          <span>{value}%</span>
                        </div>
                        <strong>{period.label}</strong>
                      </div>
                    ) : (
                      <div key={period.key} className={styles.progressRow}>
                        <span>{period.label}</span>
                        <div className={styles.progressTrack}>
                          <span style={{ width: `${value}%` }} />
                        </div>
                        <strong>{value}%</strong>
                      </div>
                    )
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
