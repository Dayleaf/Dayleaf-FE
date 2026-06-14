import DailyCalendar from '@/components/calendar/daily/DailyCalendar'

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date } = await searchParams

  return <DailyCalendar date={date} />
}
