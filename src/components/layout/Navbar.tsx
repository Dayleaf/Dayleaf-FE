import Link from 'next/link'

export default function Navbar() {
  return (
    <nav>
      <Link href="/">메인</Link>
      <Link href="/calendar">캘린더</Link>
      <Link href="/library">라이브러리</Link>
      <Link href="/routine">루틴</Link>
    </nav>
  )
}