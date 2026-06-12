import { getCategoryById, getMonthDays, sampleEvents } from '@/lib/calendar'
import styles from './monthlyCalendarView.module.css'

const weekdays = ['일', '월', '화', '수', '목', '금', '토']

export default function MonthlyCalendarView() {
  const days = getMonthDays()

  return (
    <section className={styles.monthlyView} aria-label="월간 캘린더">
      <div className={styles.weekHeader}>
        {weekdays.map((weekday) => (
          <div key={weekday} className={styles.weekday}>
            {weekday}
          </div>
        ))}
      </div>

      <div className={styles.monthGrid}>
        {days.map((day) => {
          const events = sampleEvents.filter((event) => event.date === day.key)
          const visibleEvents = events.slice(0, 3)
          const hiddenCount = events.length - visibleEvents.length

          return (
            <article
              key={day.key}
              className={`${styles.dayCell} ${day.isCurrentMonth ? '' : styles.outsideMonth}`}
            >
              <div className={styles.dayHeader}>
                <span className={day.isToday ? styles.today : styles.dayNumber}>
                  {day.dayNumber}
                </span>
              </div>

              <div className={styles.eventList}>
                {visibleEvents.map((event) => {
                  const category = getCategoryById(event.categoryId)

                  return (
                    <div
                      key={event.id}
                      className={styles.eventChip}
                      style={{ '--event-color': category?.color } as React.CSSProperties}
                    >
                      <span className={styles.eventDot} />
                      <span className={styles.eventTime}>{event.time}</span>
                      <span className={styles.eventTitle}>{event.title}</span>
                    </div>
                  )
                })}
                {hiddenCount > 0 ? (
                  <button className={styles.moreButton} type="button">
                    +{hiddenCount}개 더보기
                  </button>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
