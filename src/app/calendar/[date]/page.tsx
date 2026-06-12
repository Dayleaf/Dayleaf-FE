export default function DailyPage({ params }: { params: { date: string } }) {
  return (
    <main>
      <h1>{params.date} 데일리</h1>
    </main>
  )
}