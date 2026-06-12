import styles from './weeklyCalendar.module.css'

type TimeColumnProps = {
  timeSlots: string[]
}

export default function TimeColumn({ timeSlots }: TimeColumnProps) {
  return (
    <div className={styles.timeColumn} aria-hidden="true">
      {timeSlots.map((time) => (
        <div key={time} className={styles.timeSlot}>
          {time}
        </div>
      ))}
    </div>
  )
}
