import { Suspense } from 'react'
import MonthlyCalendarView from '@/components/calendar/MonthlyCalendarView'

export default function MonthlyPage() {
  return (
    <Suspense fallback={null}>
      <MonthlyCalendarView />
    </Suspense>
  )
}
