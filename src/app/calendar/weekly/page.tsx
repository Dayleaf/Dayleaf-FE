import { Suspense } from 'react'
import WeeklyCalendar from '@/components/calendar/weekly/WeeklyCalendar'

export default function WeeklyPage() {
  return (
    <Suspense fallback={null}>
      <WeeklyCalendar />
    </Suspense>
  )
}
