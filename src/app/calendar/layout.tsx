import CalendarTopbar from '@/components/calendar/CalendarTopbar'
import styles from './calendar.module.css'

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.content}>
      <CalendarTopbar />
      <main className={styles.main}>{children}</main>
    </div>
  )
}
