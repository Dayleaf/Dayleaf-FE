import DailyCalendar from '@/components/calendar/daily/DailyCalendar'

export default async function DailyPage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = await params

  return <DailyCalendar date={date} />
}
