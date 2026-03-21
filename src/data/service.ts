import type { Language, SetId, SetDescriptor, TrainingWord, WordSet } from './types.ts'
import { nouns } from './words/nouns.ts'
import { verbs } from './words/verbs.ts'

/**
 * All available word sets keyed by their ID.
 */
const WORD_SETS: Record<SetId, WordSet> = {
  nouns: {
    id: 'nouns',
    name: 'Существительные',
    description: '100 наиболее употребимых',
    entries: nouns,
  },
  verbs: {
    id: 'verbs',
    name: 'Глаголы',
    description: '100 наиболее употребимых',
    entries: verbs,
  },
}

/**
 * Artificial delay to simulate network latency.
 */
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * Returns the list of all available word sets (metadata only, no words).
 */
export async function getAvailableSets(): Promise<SetDescriptor[]> {
  await delay(100)
  return Object.values(WORD_SETS).map(({ id, name, description }) => ({
    id,
    name,
    description,
  }))
}

/**
 * Returns the list of all word sets (full data, for internal use).
 */
export async function getAllSets(): Promise<WordSet[]> {
  await delay(100)
  return Object.values(WORD_SETS)
}

/**
 * Builds a training pool from the given sets and language pair.
 *
 * - Filters out any word that has a null value for either language.
 * - Merges entries from all requested sets.
 * - Assigns stable numeric IDs.
 */
export async function getWordPool(
  setIds: SetId[],
  nativeLanguage: Language,
  learningLanguage: Language,
): Promise<TrainingWord[]> {
  await delay(150)

  const pool: TrainingWord[] = []

  for (const setId of setIds) {
    const set = WORD_SETS[setId]
    if (!set) continue

    for (const entry of set.entries) {
      const native = entry[nativeLanguage]
      const learning = entry[learningLanguage]

      if (native === null || learning === null) continue

      pool.push({
        id: pool.length + 1,
        native,
        learning,
      })
    }
  }

  return pool
}
