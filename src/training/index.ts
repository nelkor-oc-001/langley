import type { TrainingWord } from '../data/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_DELAY_MS = 60_000      // 1 minute — fresh / reset word interval
const MAX_DELAY_MS  = 3_600_000  // 60 minutes — cap for known words
const KNOWN_DELAY_MS = 600_000   // 10 minutes — extra spacing for known words

// ---------------------------------------------------------------------------
// Session entities
// ---------------------------------------------------------------------------

export interface SessionWord {
  id: string               // unique within session (pool index)
  word: TrainingWord
  knownLevel: number       // 0 = new, 1 = seen, 2 = known, 3 = well-known
  nextShowTime: number     // Unix ms — when the word becomes available
  showCount: number        // how many times this word has been presented
}

export interface ActionRecord {
  cardId: string
  type: 'flip' | 'swipeRight' | 'swipeLeft'
  timestamp: number
}

export interface TrainingSession {
  /** All words in the session pool */
  pool: SessionWord[]
  /** IDs of the three currently visible cards, frontmost first */
  visibleCardIds: [string, string, string]
  /** ID of the currently flipped card (or null) */
  flippedCardId: string | null
  /** History of user actions */
  history: ActionRecord[]
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

let _nextId = 0
const nextId = () => String(++_nextId)

/** Pick the next word from the pool using the reshow algorithm.
 * `skipIds` are word ids already occupying visible slots and are excluded. */
function selectNextWord(pool: SessionWord[], skipIds: Set<string>): SessionWord | null {
  const now = Date.now()
  const candidates = pool.filter(w => w.nextShowTime <= now && !skipIds.has(w.id))
  if (!candidates.length) {
    // Nothing is due among non-visible — pick the earliest from the whole pool
    const fallback = [...pool]
      .filter(w => !skipIds.has(w.id))
      .sort((a, b) => a.nextShowTime - b.nextShowTime)
    return fallback[0] ?? null
  }
  // Among candidates: known words (level >= 2) are deprioritised
  return candidates.sort((a, b) => {
    const aKnown = a.knownLevel >= 2 ? 1 : 0
    const bKnown = b.knownLevel >= 2 ? 1 : 0
    if (aKnown !== bKnown) return aKnown - bKnown
    return a.nextShowTime - b.nextShowTime
  })[0] ?? null
}

/** Compute the updated word after an action. */
function applySwipe(word: SessionWord, direction: 'left' | 'right'): SessionWord {
  const now = Date.now()

  if (direction === 'left') {
    // Known — increase delay, bump knownLevel
    const newLevel = Math.min(word.knownLevel + 1, 3)
    const delay = Math.min(
      (newLevel >= 2 ? KNOWN_DELAY_MS : BASE_DELAY_MS) * Math.pow(2, newLevel - 1),
      MAX_DELAY_MS,
    )
    return {
      ...word,
      knownLevel: newLevel,
      nextShowTime: now + delay,
      showCount: word.showCount + 1,
    }
  } else {
    // Not known — reset to fast cycle
    return {
      ...word,
      knownLevel: Math.max(word.knownLevel - 1, 0),
      nextShowTime: now + BASE_DELAY_MS,
      showCount: word.showCount + 1,
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a new training session from a flat list of training words.
 * The three frontmost cards are filled immediately.
 */
export function createSession(words: TrainingWord[]): TrainingSession {
  _nextId = 0

  const pool: SessionWord[] = words.map(word => ({
    id: nextId(),
    word,
    knownLevel: 0,
    nextShowTime: Date.now(),
    showCount: 0,
  }))

  // Fill the three visible slots — avoid picking the same word twice
  const visibleCardIds: [string, string, string] = ['', '', '']
  const usedIds = new Set<string>()
  for (let i = 0; i < 3; i++) {
    const picked = selectNextWord(pool, usedIds)
    if (!picked) break
    visibleCardIds[i] = picked.id
    usedIds.add(picked.id)
  }

  return {
    pool,
    visibleCardIds,
    flippedCardId: null,
    history: [],
  }
}

/** Flip a card (front ↔ back). */
export function flipCard(session: TrainingSession, cardId: string): TrainingSession {
  const isFlipped = session.flippedCardId === cardId
  return {
    ...session,
    flippedCardId: isFlipped ? null : cardId,
    history: [
      ...session.history,
      { cardId, type: 'flip', timestamp: Date.now() },
    ],
  }
}

/** Swipe left — word is familiar, show it less often. */
export function swipeLeft(session: TrainingSession, cardId: string): TrainingSession {
  const { pool, visibleCardIds } = session

  // Update the word in the pool
  const updatedPool = pool.map(w =>
    w.id === cardId ? applySwipe(w, 'left') : w,
  )

  // Remove the card from visible slots
  const newVisible = visibleCardIds.filter(id => id !== cardId) as string[]

  // Skip currently visible cards when selecting a replacement
  const skipIds = new Set(newVisible)
  const replacement = selectNextWord(updatedPool, skipIds)
  if (replacement) {
    newVisible.unshift(replacement.id)
  }

  return {
    ...session,
    pool: updatedPool,
    visibleCardIds: [
      newVisible[0] ?? '',
      newVisible[1] ?? '',
      newVisible[2] ?? '',
    ] as [string, string, string],
    flippedCardId: null,
    history: [
      ...session.history,
      { cardId, type: 'swipeLeft', timestamp: Date.now() },
    ],
  }
}

/** Swipe right — word needs more practice, show it more often. */
export function swipeRight(session: TrainingSession, cardId: string): TrainingSession {
  const { pool, visibleCardIds } = session

  const updatedPool = pool.map(w =>
    w.id === cardId ? applySwipe(w, 'right') : w,
  )

  const newVisible = visibleCardIds.filter(id => id !== cardId) as string[]

  const skipIds = new Set(newVisible)
  const replacement = selectNextWord(updatedPool, skipIds)
  if (replacement) {
    newVisible.unshift(replacement.id)
  }

  return {
    ...session,
    pool: updatedPool,
    visibleCardIds: [
      newVisible[0] ?? '',
      newVisible[1] ?? '',
      newVisible[2] ?? '',
    ] as [string, string, string],
    flippedCardId: null,
    history: [
      ...session.history,
      { cardId, type: 'swipeRight', timestamp: Date.now() },
    ],
  }
}

/** Return the three currently visible SessionWord objects, frontmost first. */
export function getVisibleCards(session: TrainingSession): [
  SessionWord | null,
  SessionWord | null,
  SessionWord | null,
] {
  const [a, b, c] = session.visibleCardIds
  const map = Object.fromEntries(session.pool.map(w => [w.id, w]))
  return [map[a] ?? null, map[b] ?? null, map[c] ?? null]
}
