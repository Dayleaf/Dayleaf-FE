// src/lib/api/progress.ts
//
// 오늘 기준 루틴+투두 진행률 패칭 함수.
//
// 현재 BE에서 진행률 패널에 필요한 두 데이터:
//   1. 투두: GET /api/todo/by-day/{day}
//      응답: TodoResponse[] (todoId, title, priority, status, categoryId)
//   2. 루틴: GET /api/repeats
//      응답: RepeatResponse[] (routineId, nodeId, startDate, endDate, active ...)
//      → 루틴은 현재 RepeatResponse에 title이 없어 Node 조회가 필요하다.
//        추후 BE에서 title을 포함한 응답 DTO를 제공하거나 별도 Node 조회 추가.
//
// 이 함수는 두 응답을 하나의 ProgressItem[] 으로 합쳐 반환한다.
// 현재는 mock 반환. 실제 연동 시 아래 주석처럼 교체한다.
//
// 교체 예시:
//   const [todos, repeats] = await Promise.all([
//     apiClient.get<TodoResponse[]>(`/api/todo/by-day/${date}`),
//     apiClient.get<RepeatResponse[]>('/api/repeats'),
//   ])
//   return [
//     ...todos.data.map((t) => ({ id: String(t.todoId), title: t.title, done: t.status === 'ARCHIVED', source: 'TODO' as const })),
//     ...repeats.data.map((r) => ({ id: String(r.routineId), title: `루틴 #${r.routineId}`, done: false, source: 'ROUTINE' as const })),
//   ]

import type { ProgressItem } from '@/types/main'

const MOCK_PROGRESS: ProgressItem[] = [
  { id: 'r-1', title: '물 2L 마시기', done: true, source: 'ROUTINE' },
  { id: 'r-2', title: '아침 스트레칭', done: true, source: 'ROUTINE' },
  { id: 't-1', title: '기획안 초안 작성', done: false, source: 'TODO' },
  { id: 't-2', title: '읽던 책 30쪽', done: false, source: 'TODO' },
]

export async function getTodayProgress(_date: string): Promise<ProgressItem[]> {
  // TODO: BE /api/todo/by-day/{date} + /api/repeats 연동 시 교체
  // 루틴 title 포함 여부는 BE와 협의 후 결정
  return MOCK_PROGRESS
}
