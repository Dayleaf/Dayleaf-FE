// src/components/main/PlantPot.tsx
//
// 활동량(growth)에 따라 새싹이 자라는 화분 SVG.
// growth(0.0~1.0)에 비례해 줄기 높이와 잎 단계(1~3쌍)가 달라진다.
// 서버 컴포넌트로 사용 가능 (순수 표시용).

import type { BookshelfPot } from '@/types/main'

type PlantPotProps = {
  pot: BookshelfPot
}

export default function PlantPot({ pot }: PlantPotProps) {
  // 줄기 높이: 최소 12, 최대 56 (대비를 키워 성장 차이를 또렷하게)
  const stemHeight = 12 + Math.round(pot.growth * 44)
  const stemTopY = 70 - stemHeight

  // 잎 단계: growth 구간에 따라 1~3쌍
  const leafStage = pot.growth >= 0.66 ? 3 : pot.growth >= 0.33 ? 2 : 1

  return (
    <svg
      width="84"
      height="104"
      viewBox="0 0 84 104"
      fill="none"
      aria-hidden="true"
    >
      {/* 줄기 */}
      <line
        x1="42"
        y1="70"
        x2="42"
        y2={stemTopY}
        stroke="var(--color-routine)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* 잎: 단계별로 좌우 한 쌍씩 추가 */}
      {Array.from({ length: leafStage }).map((_, index) => {
        const y = stemTopY + 8 + index * ((stemHeight - 8) / leafStage)
        return (
          <g key={index}>
            <path
              d={`M42 ${y} q -14 -6 -18 -16 q 14 2 18 12`}
              fill="var(--color-routine)"
              opacity={0.85}
            />
            <path
              d={`M42 ${y + 4} q 14 -6 18 -16 q -14 2 -18 12`}
              fill="var(--color-brand)"
              opacity={0.85}
            />
          </g>
        )
      })}

      {/* 새싹 꼭대기 잎 */}
      <path
        d={`M42 ${stemTopY} q -5 -8 0 -14 q 5 6 0 14`}
        fill="var(--color-brand-strong)"
      />

      {/* 화분 본체 (사다리꼴) */}
      <path
        d="M26 70 h32 l-4 26 a4 4 0 0 1 -4 3 h-16 a4 4 0 0 1 -4 -3 z"
        fill="var(--color-personal)"
        opacity="0.9"
      />
      {/* 화분 테두리(흙 라인) */}
      <rect
        x="24"
        y="66"
        width="36"
        height="8"
        rx="3"
        fill="var(--color-important)"
        opacity="0.55"
      />
    </svg>
  )
}
