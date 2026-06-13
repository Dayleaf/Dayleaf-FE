// src/lib/api/weather.ts
//
// 날씨 브리핑 데이터 패칭 경계.
//
// 현재 상태:
//   BE에 메인 페이지용 날씨 엔드포인트가 아직 없다.
//   실제 흐름은 FE → BE(Spring Boot) → AI 서버(POST /api/v1/weather/briefing)이므로,
//   BE 엔드포인트가 확정되면 이 함수 본문만 아래 주석처럼 교체한다.
//
// 교체 예시 (BE 엔드포인트 확정 후):
//   const { data } = await apiClient.get<{ message: string; icon_code: WeatherIconCode; clothing: ClothingCode[] }>(
//     '/api/main/weather',
//   )
//   return { message: data.message, iconCode: data.icon_code, clothing: data.clothing }
//
// snake_case → camelCase 변환은 이 함수가 책임진다.
// 컴포넌트는 반환 타입(WeatherBriefing)에만 의존하므로, 교체 시 UI 변경 없음.

import type {
  ClothingCode,
  WeatherBriefing,
  WeatherIconCode,
} from '@/types/weather'

// 아이콘 코드 → 한국어 라벨 (aria-label 및 보조 텍스트용)
const ICON_LABEL: Record<WeatherIconCode, string> = {
  SUNNY: '맑음',
  PARTLY_CLOUDY: '구름 조금',
  CLOUDY: '흐림',
  RAINY: '비',
  HEAVY_RAIN: '폭우',
  SNOWY: '눈',
  HEAVY_SNOW: '폭설',
  THUNDERSTORM: '천둥번개',
  FOGGY: '안개',
  YELLOW_DUST: '황사',
  TYPHOON: '태풍',
}

export function getWeatherLabel(code: WeatherIconCode): string {
  return ICON_LABEL[code]
}

// 의류 코드 → 한국어 라벨 (추천 의류 칩 표시용)
const CLOTHING_LABEL: Record<ClothingCode, string> = {
  T_SHIRT: '반팔',
  LONG_SLEEVE: '긴소매',
  LIGHT_JACKET: '얇은 외투',
  JACKET: '재킷',
  COAT: '코트',
  PADDED_JACKET: '패딩',
  JEANS: '청바지',
  SHORTS: '반바지',
  UMBRELLA: '우산',
  SUNSCREEN: '자외선 차단제',
  MASK: '마스크',
}

export function getClothingLabel(code: ClothingCode): string {
  return CLOTHING_LABEL[code]
}

// ── 패칭 경계 함수 ────────────────────────────────────────────────────────────
// async로 선언해두어, 실제 fetch 교체 시 호출부 변경이 없도록 한다.
const MOCK_BRIEFING: WeatherBriefing = {
  message:
    '오늘은 햇살이 제법 포근하게 드는 하루예요. 가볍게 긴소매 하나만 걸치셔도 충분할 것 같으니, 산책 한 번 다녀오시는 건 어떨까요.',
  iconCode: 'SUNNY',
  clothing: ['LONG_SLEEVE', 'LIGHT_JACKET'],
}

export async function getTodayBriefing(): Promise<WeatherBriefing> {
  // TODO: BE /api/main/weather 엔드포인트 확정 후 실제 fetch로 교체
  return MOCK_BRIEFING
}
