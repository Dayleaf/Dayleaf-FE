// src/components/main/TodayProgress.tsx
//
// 오늘 기준 루틴+투두 진행률 패널.
//
// 설계 의도:
//   - 체크박스 토글에 로컬 상태가 필요하므로 이 컴포넌트만 'use client'로 분리한다.
//   - ProgressItem의 source 필드로 루틴(ROUTINE)과 투두(TODO)를 구분해 태그 표시.
//   - BE 연동 후에는 done 상태 토글 시 TodoExecution API를 호출하는 로직을 추가한다.
//     (현재는 로컬 상태만 변경)

'use client'

import { useMemo, useState } from 'react'
import type { ProgressItem } from '@/types/main'
import styles from './main.module.css'

type TodayProgressProps = {
  items: ProgressItem[]
}

// BE의 SourceType(MANUAL | SCHEDULE | REPEAT)에서 파생.
// 표시용 한국어 라벨.
const SOURCE_LABEL: Record<ProgressItem['source'], string> = {
  ROUTINE: '루틴',
  TODO: '투두',
}

export default function TodayProgress({ items }: TodayProgressProps) {
  const [progress, setProgress] = useState<ProgressItem[]>(items)

  const { doneCount, rate } = useMemo(() => {
    const done = progress.filter((item: ProgressItem) => item.done).length
    const total = progress.length
    return {
      doneCount: done,
      rate: total === 0 ? 0 : Math.round((done / total) * 100),
    }
  }, [progress])

  const toggleItem = (id: string) => {
    setProgress((current: ProgressItem[]) =>
      current.map((item: ProgressItem) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    )
    // TODO: BE TodoExecution API 연동 후 완료 상태 서버 동기화 추가
    //   ex) await apiClient.patch(`/api/todo-executions/${id}/toggle`)
  }

  return (
    <section className={styles.card} aria-label="오늘 기준 루틴과 투두 진행률">
      <div className={styles.progressHeader}>
        <p className={styles.cardLabel}>오늘 기준 루틴+투두 진행률</p>
        <span className={styles.progressRate}>{rate}%</span>
      </div>

      <div
        className={styles.progressBar}
        role="progressbar"
        aria-valuenow={rate}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`완료 ${doneCount}건 / 전체 ${progress.length}건`}
      >
        <span className={styles.progressFill} style={{ width: `${rate}%` }} />
      </div>

      <div className={styles.progressList}>
        {progress.map((item: ProgressItem) => (
          <button
            key={item.id}
            type="button"
            className={styles.progressItem}
            onClick={() => toggleItem(item.id)}
            aria-pressed={item.done}
          >
            <span
              className={`${styles.checkbox} ${item.done ? styles.checkboxChecked : ''}`}
              aria-hidden="true"
            >
              {item.done ? '✓' : ''}
            </span>
            <span
              className={`${styles.progressItemTitle} ${item.done ? styles.progressItemDone : ''}`}
            >
              {item.title}
            </span>
            <span className={styles.sourceTag}>
              {SOURCE_LABEL[item.source]}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
