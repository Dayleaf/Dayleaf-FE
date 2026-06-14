// src/components/main/Bookshelf.tsx
//
// 기록 책장 (시그니처 영역).
//  - 상단: growth에 따라 자라는 화분 4개 (전체/루틴/일기/투두)
//  - 하단: 과거 기록이 책으로 꽂힘. completion이 낮을수록 "빛바랜 종이"처럼 옅게.
//
// 정적 표시이므로 서버 컴포넌트로 유지한다.
// 추후 DailySummary API가 생기면 props를 서버에서 패칭해 주입한다.

import type { CSSProperties } from 'react'
import type { ArchivedBook, BookshelfPot } from '@/types/main'
import PlantPot from './PlantPot'
import styles from './main.module.css'

type BookshelfProps = {
  pots: BookshelfPot[]
  books: ArchivedBook[]
}

// 책 높이: completion에 비례 (최소 44, 최대 84px)
function bookHeight(completion: number): number {
  return 44 + Math.round(completion * 40)
}

// 책등 색: completion이 높을수록 진한 브랜드색, 낮을수록 옅어진다("빛바램")
function bookColor(completion: number): string {
  const mix = Math.round(completion * 100)
  return `color-mix(in srgb, var(--color-brand) ${mix}%, var(--color-surface-muted))`
}

export default function Bookshelf({ pots, books }: BookshelfProps) {
  return (
    <section className={styles.bookshelf} aria-label="기록 책장">
      <div className={styles.bookshelfHeader}>
        <h2 className={styles.bookshelfTitle}>나의 기록 책장</h2>
        <span className={styles.bookshelfHint}>
          매일의 기록이 모여 한 권의 책이 됩니다
        </span>
      </div>

      {/* 화분 줄 */}
      <div className={styles.shelfTop}>
        {pots.map((pot) => (
          <div key={pot.id} className={styles.pot}>
            <span className={styles.potArt}>
              <PlantPot pot={pot} />
            </span>
            <span className={styles.potLabel}>{pot.label}</span>
            <span className={styles.potGrowth}>
              {Math.round(pot.growth * 100)}%
            </span>
          </div>
        ))}
      </div>

      {/* 선반 판자 */}
      <div className={styles.shelfPlank} aria-hidden="true" />

      {/* 과거 기록 책들 */}
      <div className={styles.shelfBooks}>
        {books.map((book) => (
          <span
            key={book.date}
            className={styles.book}
            title={`${book.date} · 완료율 ${Math.round(book.completion * 100)}%`}
            style={
              {
                height: `${bookHeight(book.completion)}px`,
                '--book-color': bookColor(book.completion),
              } as CSSProperties
            }
          >
            <span className={styles.bookSpine}>{book.spineLabel}</span>
          </span>
        ))}
      </div>
    </section>
  )
}
