// src/lib/main.ts
//
// 메인 페이지 공통 유틸리티 및 책장 관련 mock 데이터.

import type { ArchivedBook, BookshelfPot } from '@/types/main'

// 오늘 날짜. 서버 컴포넌트에서 사용하므로 서버 기준 시각을 사용한다.
// 'YYYY-MM-DD' 형태로 반환.
export function getTodayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

// 'YYYY-MM-DD' → '2026. 03. 08. 일요일' 형태 변환 (메인 페이지 날짜 헤더용)
const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토']

export function formatKoreanDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const weekday = WEEKDAY_KO[date.getDay()]
  return `${year}. ${month}. ${day}. ${weekday}요일`
}

// ── 책장 화분 mock ────────────────────────────────────────────────────────────
// 추후 BE의 일별 활동 요약(DailySummary) API와 연동될 자리.
// growth = 완료율(0.0~1.0). 'all'은 나머지 셋의 평균.
const routineGrowth = 0.8
const diaryGrowth = 0.5
const todoGrowth = 0.35

export const bookshelfPots: BookshelfPot[] = [
  {
    id: 'all',
    label: '전체',
    growth:
      Math.round(((routineGrowth + diaryGrowth + todoGrowth) / 3) * 100) / 100,
  },
  { id: 'routine', label: '루틴', growth: routineGrowth },
  { id: 'diary', label: '일기', growth: diaryGrowth },
  { id: 'todo', label: '투두', growth: todoGrowth },
]

// ── 아카이빙 책 mock ──────────────────────────────────────────────────────────
// completion이 낮을수록 "빛바랜 종이"처럼 옅게 표현한다.
// ERD의 '일별 활동 요약(DailySummary)'과 이어질 자리.
export const archivedBooks: ArchivedBook[] = [
  { date: '2026-03-01', completion: 0.9, spineLabel: '3/1' },
  { date: '2026-03-02', completion: 0.4, spineLabel: '3/2' },
  { date: '2026-03-03', completion: 0.7, spineLabel: '3/3' },
  { date: '2026-03-04', completion: 1.0, spineLabel: '3/4' },
  { date: '2026-03-05', completion: 0.55, spineLabel: '3/5' },
  { date: '2026-03-06', completion: 0.25, spineLabel: '3/6' },
  { date: '2026-03-07', completion: 0.85, spineLabel: '3/7' },
]
