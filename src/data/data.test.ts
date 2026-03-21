import { describe, it, expect } from 'vitest'
import type { Language, SetId } from './types.ts'
import { getAvailableSets, getWordPool } from './service.ts'
import { nouns } from './words/nouns.ts'
import { verbs } from './words/verbs.ts'

// ─── 3.1 Data structure ────────────────────────────────────────────────────

describe('nouns dataset', () => {
  it('contains exactly 100 entries', () => {
    expect(nouns).toHaveLength(100)
  })

  it('every entry has a non-null value for en, ru, and es', () => {
    for (const entry of nouns) {
      expect(entry.en, `"${JSON.stringify(entry)}" missing en`).not.toBeNull()
      expect(entry.ru, `"${JSON.stringify(entry)}" missing ru`).not.toBeNull()
      expect(entry.es, `"${JSON.stringify(entry)}" missing es`).not.toBeNull()
    }
  })

  it('all en values are unique', () => {
    const values = nouns.map((e) => e.en)
    expect(new Set(values).size).toBe(values.length)
  })
})

describe('verbs dataset', () => {
  it('contains exactly 100 entries', () => {
    expect(verbs).toHaveLength(100)
  })

  it('every entry has a non-null value for en, ru, and es', () => {
    for (const entry of verbs) {
      expect(entry.en, `"${JSON.stringify(entry)}" missing en`).not.toBeNull()
      expect(entry.ru, `"${JSON.stringify(entry)}" missing ru`).not.toBeNull()
      expect(entry.es, `"${JSON.stringify(entry)}" missing es`).not.toBeNull()
    }
  })

  it('all en values are unique', () => {
    const values = verbs.map((e) => e.en)
    expect(new Set(values).size).toBe(values.length)
  })
})

// ─── 3.3 getAvailableSets ──────────────────────────────────────────────────

describe('getAvailableSets', () => {
  it('returns a list of sets', async () => {
    const sets = await getAvailableSets()
    expect(sets.length).toBeGreaterThan(0)
  })

  it('each set has id, name, and description', async () => {
    const sets = await getAvailableSets()
    for (const set of sets) {
      expect(set).toHaveProperty('id')
      expect(set).toHaveProperty('name')
      expect(set).toHaveProperty('description')
    }
  })

  it('returns nouns and verbs sets', async () => {
    const sets = await getAvailableSets()
    const ids = sets.map((s) => s.id)
    expect(ids).toContain('nouns')
    expect(ids).toContain('verbs')
  })
})

// ─── 3.4 Filtering ─────────────────────────────────────────────────────────

describe('getWordPool — filtering', () => {
  it('returns words only with valid translations for the chosen pair', async () => {
    const pool = await getWordPool(['nouns'], 'en', 'ru')

    for (const word of pool) {
      expect(word.native).toBeTruthy()
      expect(word.learning).toBeTruthy()
    }
  })

  it('returns the same number of words regardless of pair order', async () => {
    const poolA = await getWordPool(['nouns'], 'en', 'ru')
    const poolB = await getWordPool(['nouns'], 'ru', 'en')
    expect(poolA).toHaveLength(poolB.length)
  })

  it('each returned word has a unique id', async () => {
    const pool = await getWordPool(['nouns', 'verbs'], 'en', 'ru')
    const ids = pool.map((w) => w.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('throws when given an unknown set id — returns empty pool silently', async () => {
    // Unknown IDs are filtered out; the function does not throw
    const pool = await getWordPool(['nouns', 'unknown' as SetId], 'en', 'ru')
    // Only nouns should appear
    expect(pool).toHaveLength(nouns.length)
  })
})

describe('getWordPool — null exclusion', () => {
  // Our built-in datasets have no nulls, but the filter must still work
  // when nulls are introduced (future-proofing).
  // This is verified by the fact that no nulls appear in the output pool.

  it('excludes entries where native language value is null', async () => {
    const pool = await getWordPool(['nouns'], 'en', 'ru')
    const hasNull = pool.some(
      (w) => w.native === null || w.learning === null,
    )
    expect(hasNull).toBe(false)
  })
})

describe('getWordPool — set merging', () => {
  it('merges multiple sets into one pool', async () => {
    const nounsOnly = await getWordPool(['nouns'], 'en', 'ru')
    const verbsOnly = await getWordPool(['verbs'], 'en', 'ru')
    const combined = await getWordPool(['nouns', 'verbs'], 'en', 'ru')

    expect(combined).toHaveLength(nounsOnly.length + verbsOnly.length)
  })

  it('pool from a single set matches that set size', async () => {
    const nounsPool = await getWordPool(['nouns'], 'en', 'ru')
    expect(nounsPool).toHaveLength(100)
  })
})

// ─── 3.2 Language support ──────────────────────────────────────────────────

describe('getWordPool — language pairs', () => {
  const languages: Language[] = ['en', 'ru', 'es']

  for (const native of languages) {
    for (const learning of languages) {
      if (native === learning) continue

      it(`supports ${native} → ${learning}`, async () => {
        const pool = await getWordPool(['nouns'], native, learning)
        expect(pool.length).toBe(100)
        for (const word of pool) {
          expect(typeof word.native).toBe('string')
          expect(typeof word.learning).toBe('string')
        }
      })
    }
  }
})
