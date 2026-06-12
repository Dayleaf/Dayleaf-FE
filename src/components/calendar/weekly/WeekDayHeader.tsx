import type { CalendarDay } from '@/types/calendar'
import styles from './weeklyCalendar.module.css'

const weekdays = ['월', '화', '수', '목', '금', '토', '일']

type WeekDayHeaderProps = {
  days: CalendarDay[]
}

export default function WeekDayHeader({ days }: WeekDayHeaderProps) {
  return (
    <div className={styles.weekHeader}>
      <div className={styles.timeHeader} />
      <div className={styles.dayHeaderGrid}>
        {days.map((day, index) => (
          <div key={day.key} className={styles.dayHeaderCell}>
            <span className={styles.weekday}>{weekdays[index]}</span>
            <span className={day.isToday ? styles.todayDate : styles.dateNumber}>
              {day.dayNumber}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
