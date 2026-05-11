import CalendarNav from '@/components/layout/CalendarNav'
import styles from './calendar.module.css'

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.content}>
      <CalendarNav />
      <main className={styles.main}>{children}</main>
    </div>
  )
}
