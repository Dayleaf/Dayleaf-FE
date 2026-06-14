// src/lib/api/schedule.ts
//
// 일정(Schedule) 관련 API 패칭 함수.
//
// BE 엔드포인트: GET /api/schedules/day?date={yyyy-MM-dd}
// BE 응답 DTO: ScheduleResponse (nodeId, date, startTime, endTime, allDay)
//
// 현재 상태:
//   BE ScheduleResponse에는 일정 제목(title)이 없다.
//   제목은 Node.title에 있으므로, 추후 BE에서 title을 포함한 응답 DTO를 제공하거나
//   별도 Node 조회를 추가해야 한다.
//   이 함수를 실제 fetch로 교체할 때 title 처리 방식을 함께 결정한다.
//
// 현재는 mock 데이터를 반환하며, 실제 연동 시 아래 주석처럼 교체한다.
//
// 교체 예시:
//   const { data } = await apiClient.get<ScheduleResponse[]>('/api/schedules/day', {
//     params: { date },
//   })
//   return data

import type { TodayScheduleItem } from '@/types/main'

// mock 데이터. BE에서 title을 포함한 응답을 주기 전까지 사용.
const MOCK_SCHEDULE: TodayScheduleItem[] = [
  {
    nodeId: 1,
    title: '아침 독서 모임',
    startTime: '10:00:00',
    endTime: '11:30:00',
    allDay: false,
    color: 'var(--color-study)',
  },
  {
    nodeId: 2,
    title: '오후 산책',
    startTime: '15:00:00',
    endTime: '16:00:00',
    allDay: false,
    color: 'var(--color-routine)',
  },
]

export async function getTodaySchedule(
  _date: string
): Promise<TodayScheduleItem[]> {
  // TODO: BE /api/schedules/day?date={date} 연동 시 교체
  // title 포함 여부는 BE와 협의 후 결정
  return MOCK_SCHEDULE
}

// 'HH:mm:ss' → 'HH:mm' 변환 유틸 (표시용)
// BE의 LocalTime은 'HH:mm:ss' 형태로 직렬화된다.
export function formatTime(time: string | null): string {
  if (!time) return ''
  // 'HH:mm:ss' → 'HH:mm'
  return time.slice(0, 5)
}
