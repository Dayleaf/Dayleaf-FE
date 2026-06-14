// src/components/main/WeatherIcon.tsx
//
// WeatherIconCode를 인라인 SVG 아이콘으로 렌더링한다.
// 외부 아이콘 라이브러리를 사용하지 않고 기존 코드 스타일을 따른다.
// 색은 currentColor를 사용해, 부모에서 color 토큰으로 제어한다.

import type { WeatherIconCode } from '@/types/weather'

type WeatherIconProps = {
  code: WeatherIconCode
  size?: number
}

export default function WeatherIcon({ code, size = 56 }: WeatherIconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 48 48',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  switch (code) {
    case 'SUNNY':
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="9" fill="currentColor" stroke="none" />
          <line x1="24" y1="4" x2="24" y2="10" />
          <line x1="24" y1="38" x2="24" y2="44" />
          <line x1="4" y1="24" x2="10" y2="24" />
          <line x1="38" y1="24" x2="44" y2="24" />
          <line x1="10" y1="10" x2="14" y2="14" />
          <line x1="34" y1="34" x2="38" y2="38" />
          <line x1="38" y1="10" x2="34" y2="14" />
          <line x1="14" y1="34" x2="10" y2="38" />
        </svg>
      )
    case 'PARTLY_CLOUDY':
      return (
        <svg {...common}>
          <circle cx="18" cy="16" r="6" fill="currentColor" stroke="none" />
          <line x1="18" y1="4" x2="18" y2="7" />
          <line x1="6" y1="16" x2="9" y2="16" />
          <line x1="9" y1="7" x2="11" y2="9" />
          <path
            d="M16 34h16a6 6 0 0 0 0-12 8 8 0 0 0-15-2 5 5 0 0 0-1 14z"
            fill="currentColor"
            stroke="none"
            opacity="0.85"
          />
        </svg>
      )
    case 'CLOUDY':
    case 'FOGGY':
      return (
        <svg {...common}>
          <path
            d="M15 32h18a7 7 0 0 0 0-14 9 9 0 0 0-17-2 6 6 0 0 0-1 16z"
            fill="currentColor"
            stroke="none"
            opacity="0.85"
          />
          {code === 'FOGGY' ? (
            <g opacity="0.6">
              <line x1="12" y1="38" x2="32" y2="38" />
              <line x1="16" y1="42" x2="36" y2="42" />
            </g>
          ) : null}
        </svg>
      )
    case 'RAINY':
    case 'HEAVY_RAIN':
      return (
        <svg {...common}>
          <path
            d="M15 26h18a7 7 0 0 0 0-14 9 9 0 0 0-17-2 6 6 0 0 0-1 16z"
            fill="currentColor"
            stroke="none"
            opacity="0.85"
          />
          <line x1="17" y1="32" x2="15" y2="40" />
          <line x1="24" y1="32" x2="22" y2="40" />
          <line x1="31" y1="32" x2="29" y2="40" />
          {code === 'HEAVY_RAIN' ? (
            <>
              <line x1="20" y1="34" x2="18" y2="42" />
              <line x1="27" y1="34" x2="25" y2="42" />
            </>
          ) : null}
        </svg>
      )
    case 'SNOWY':
    case 'HEAVY_SNOW':
      return (
        <svg {...common}>
          <path
            d="M15 26h18a7 7 0 0 0 0-14 9 9 0 0 0-17-2 6 6 0 0 0-1 16z"
            fill="currentColor"
            stroke="none"
            opacity="0.85"
          />
          <circle cx="18" cy="36" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="24" cy="40" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="30" cy="36" r="1.6" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'THUNDERSTORM':
      return (
        <svg {...common}>
          <path
            d="M15 26h18a7 7 0 0 0 0-14 9 9 0 0 0-17-2 6 6 0 0 0-1 16z"
            fill="currentColor"
            stroke="none"
            opacity="0.85"
          />
          <path
            d="M25 30l-6 8h5l-2 6 7-9h-5z"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      )
    case 'YELLOW_DUST':
      return (
        <svg {...common}>
          <circle
            cx="24"
            cy="20"
            r="8"
            fill="currentColor"
            stroke="none"
            opacity="0.7"
          />
          <g opacity="0.6">
            <line x1="12" y1="34" x2="36" y2="34" />
            <line x1="14" y1="39" x2="34" y2="39" />
            <line x1="16" y1="44" x2="32" y2="44" />
          </g>
        </svg>
      )
    case 'TYPHOON':
      return (
        <svg {...common}>
          <path d="M24 10a14 14 0 1 1-13 9c2 6 9 8 14 5s6-10 1-13a8 8 0 0 0-9 2" />
          <circle cx="24" cy="24" r="3" fill="currentColor" stroke="none" />
        </svg>
      )
    default:
      return null
  }
}
