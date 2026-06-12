import { Suspense } from 'react'
import CalendarTopbar from '@/components/calendar/CalendarTopbar'
import styles from './calendar.module.css'

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.content}>
      <Suspense fallback={null}>
        <CalendarTopbar />
      </Suspense>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
