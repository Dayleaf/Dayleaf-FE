// src/types/weather.ts
//
// Dayleaf-AI 서버(POST /api/v1/weather/briefing)의 응답 스키마와 1:1 대응.
// BE가 AI 서버를 호출한 뒤 FE로 전달하는 최종 응답 형태.
//
// 설계 원칙:
//   - AI 계약의 snake_case(icon_code, clothing)를 FE camelCase로 변환해 정의한다.
//   - lib/api/weather.ts의 패칭 함수에서 변환 책임을 진다.

// 날씨 아이콘 코드 (AI 계약 IconCode와 1:1)
export type WeatherIconCode =
  | 'SUNNY'
  | 'PARTLY_CLOUDY'
  | 'CLOUDY'
  | 'RAINY'
  | 'HEAVY_RAIN'
  | 'SNOWY'
  | 'HEAVY_SNOW'
  | 'THUNDERSTORM'
  | 'FOGGY'
  | 'YELLOW_DUST'
  | 'TYPHOON'

// 추천 의류 코드 (AI 계약 Clothing과 1:1)
export type ClothingCode =
  | 'T_SHIRT'
  | 'LONG_SLEEVE'
  | 'LIGHT_JACKET'
  | 'JACKET'
  | 'COAT'
  | 'PADDED_JACKET'
  | 'JEANS'
  | 'SHORTS'
  | 'UMBRELLA'
  | 'SUNSCREEN'
  | 'MASK'

// FE에서 사용하는 날씨 브리핑 (camelCase 변환 완료 상태)
export type WeatherBriefing = {
  message: string
  iconCode: WeatherIconCode
  clothing: ClothingCode[]
}
