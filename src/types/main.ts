// src/types/main.ts
//
// 메인 페이지(대시보드)에서 사용하는 도메인 타입.
// BE의 실제 응답 DTO와 1:1로 대응한다.

// ── 일정 ─────────────────────────────────────────────────────────────────────
// BE: ScheduleResponse (ScheduleController → GET /api/schedules/day?date=)
// BE 필드: nodeId(Long), date(LocalDate), startTime(LocalTime),
//          endTime(LocalTime), allDay(boolean)
export type ScheduleResponse = {
  nodeId: number
  date: string // 'YYYY-MM-DD'
  startTime: string | null // 'HH:mm:ss' (allDay이면 null일 수 있음)
  endTime: string | null
  allDay: boolean
}

// FE 표시용 — ScheduleResponse에 title/color를 추가한 뷰 모델.
// 현재 BE ScheduleResponse에는 title이 없으므로(Node.title로 별도 조회 필요),
// mock 단계에서는 title을 직접 포함시키고, BE 연동 시 Node 조회를 추가한다.
export type TodayScheduleItem = {
  nodeId: number
  title: string
  startTime: string | null
  endTime: string | null
  allDay: boolean
  color: string // 카테고리 색 토큰 (ex. 'var(--color-study)')
}

// ── 투두 ─────────────────────────────────────────────────────────────────────
// BE: TodoResponse (TodoController → GET /api/todo/by-day/{day})
// BE 필드: todoId(Long), title(String), priority(Priority),
//          status(TodoStatus), categoryId(Integer | null)
export type TodoResponse = {
  todoId: number
  title: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  status: 'ACTIVE' | 'ARCHIVED'
  categoryId: number | null
}

// ── 진행률 패널 (루틴 + 투두 통합) ───────────────────────────────────────────
// 루틴(Repeat)과 투두(Todo)를 source 필드로 구분해 하나의 리스트로 표시한다.
// BE의 TodoExecution.SourceType(MANUAL | SCHEDULE | REPEAT)에서 착안.
export type ProgressItem = {
  id: string
  title: string
  done: boolean
  source: 'ROUTINE' | 'TODO'
}

// ── 책장 화분 ─────────────────────────────────────────────────────────────────
// 활동량(완료율)에 따라 새싹이 자라는 게이지.
// 추후 BE의 일별 활동 요약(DailySummary) API와 연동될 자리.
export type BookshelfPotId = 'all' | 'routine' | 'diary' | 'todo'

export type BookshelfPot = {
  id: BookshelfPotId
  label: string
  growth: number // 0.0 ~ 1.0
}

// ── 아카이빙 책 ───────────────────────────────────────────────────────────────
// 과거 날짜별 기록. completion이 낮을수록 책등이 옅어진다("빛바랜 종이").
// ERD의 '일별 활동 요약(DailySummary)'과 이어질 자리.
export type ArchivedBook = {
  date: string // 'YYYY-MM-DD'
  completion: number // 0.0 ~ 1.0
  spineLabel: string // 책등 표시 라벨 (ex. '3/1')
}
