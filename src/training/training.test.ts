import { describe, it, expect } from 'vitest'
import {
  createSession,
  flipCard,
  swipeLeft,
  swipeRight,
  getVisibleCards,
} from './index.ts'
import type { TrainingWord } from '../data/types.ts'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeWord = (id: number, learning: string, native: string): TrainingWord => ({
  id,
  learning,
  native,
})

const words5: TrainingWord[] = [
  makeWord(1, 'cat', 'кот'),
  makeWord(2, 'dog', 'собака'),
  makeWord(3, 'bird', 'птица'),
  makeWord(4, 'fish', 'рыба'),
  makeWord(5, 'tree', 'дерево'),
]

// ---------------------------------------------------------------------------
// Session initialisation
// ---------------------------------------------------------------------------

describe('createSession — initialisation', () => {
  it('creates a session from a list of words', () => {
    const session = createSession(words5)
    expect(session.pool).toHaveLength(5)
    expect(session.history).toHaveLength(0)
    expect(session.flippedCardId).toBeNull()
  })

  it('each word in the pool has a unique session id', () => {
    const session = createSession(words5)
    const ids = session.pool.map(w => w.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all words start with knownLevel 0 and showCount 0', () => {
    const session = createSession(words5)
    for (const w of session.pool) {
      expect(w.knownLevel).toBe(0)
      expect(w.showCount).toBe(0)
    }
  })
})

// ---------------------------------------------------------------------------
// Three visible cards
// ---------------------------------------------------------------------------

describe('createSession — visible cards', () => {
  it('fills three visible card slots when pool has 3+ words', () => {
    const session = createSession(words5)
    expect(session.visibleCardIds).toHaveLength(3)
    expect(session.visibleCardIds.every(id => id !== '')).toBe(true)
  })

  it('visible cards are distinct', () => {
    const session = createSession(words5)
    const ids = session.visibleCardIds
    expect(new Set(ids).size).toBe(3)
  })

  it('visible card ids correspond to words in the pool', () => {
    const session = createSession(words5)
    const poolIds = new Set(session.pool.map(w => w.id))
    for (const id of session.visibleCardIds) {
      expect(poolIds.has(id)).toBe(true)
    }
  })

  it('fills fewer slots when pool has fewer than 3 words', () => {
    const tiny = [makeWord(1, 'a', 'а')]
    const session = createSession(tiny)
    expect(session.visibleCardIds[0]).not.toBe('')
    expect(session.visibleCardIds[1]).toBe('')
    expect(session.visibleCardIds[2]).toBe('')
  })
})

// ---------------------------------------------------------------------------
// Flip
// ---------------------------------------------------------------------------

describe('flipCard', () => {
  it('flips an un-flipped card to flipped state', () => {
    const session = createSession(words5)
    const cardId = session.visibleCardIds[0]

    const next = flipCard(session, cardId)
    expect(next.flippedCardId).toBe(cardId)
  })

  it('flipping the same card again un-flips it', () => {
    const session = createSession(words5)
    const cardId = session.visibleCardIds[0]
    const flipped = flipCard(session, cardId)

    const unFlipped = flipCard(flipped, cardId)
    expect(unFlipped.flippedCardId).toBeNull()
  })

  it('does not mutate the original session', () => {
    const session = createSession(words5)
    const cardId = session.visibleCardIds[0]
    flipCard(session, cardId)

    expect(session.flippedCardId).toBeNull()
  })

  it('records a flip in history', () => {
    const session = createSession(words5)
    const cardId = session.visibleCardIds[0]

    const next = flipCard(session, cardId)
    expect(next.history).toHaveLength(1)
    expect(next.history[0].type).toBe('flip')
    expect(next.history[0].cardId).toBe(cardId)
  })
})

// ---------------------------------------------------------------------------
// Swipe Left (known)
// ---------------------------------------------------------------------------

describe('swipeLeft — known word', () => {
  it('removes the swiped card from visible slots', () => {
    const session = createSession(words5)
    const cardId = session.visibleCardIds[0]

    const next = swipeLeft(session, cardId)
    expect(next.visibleCardIds).not.toContain(cardId)
  })

  it('does not mutate the original session', () => {
    const session = createSession(words5)
    const cardId = session.visibleCardIds[0]
    swipeLeft(session, cardId)

    expect(session.visibleCardIds).toContain(cardId)
    expect(session.pool.find(w => w.id === cardId)?.knownLevel).toBe(0)
  })

  it('increments knownLevel of the swiped word', () => {
    const session = createSession(words5)
    const cardId = session.visibleCardIds[0]

    const next = swipeLeft(session, cardId)
    const updated = next.pool.find(w => w.id === cardId)
    expect(updated?.knownLevel).toBe(1)
  })

  it('increments showCount of the swiped word', () => {
    const session = createSession(words5)
    const cardId = session.visibleCardIds[0]

    const next = swipeLeft(session, cardId)
    const updated = next.pool.find(w => w.id === cardId)
    expect(updated?.showCount).toBe(1)
  })

  it('records swipeLeft in history', () => {
    const session = createSession(words5)
    const cardId = session.visibleCardIds[0]

    const next = swipeLeft(session, cardId)
    expect(next.history).toHaveLength(1)
    expect(next.history[0].type).toBe('swipeLeft')
  })

  it('fills the freed slot with a new card', () => {
    const session = createSession(words5)
    const cardId = session.visibleCardIds[0]

    const next = swipeLeft(session, cardId)
    // One of the visible slots must now be a different card
    const newIds = next.visibleCardIds.filter(id => id !== '' && !session.visibleCardIds.includes(id))
    expect(newIds.length).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// Swipe Right (not known)
// ---------------------------------------------------------------------------

describe('swipeRight — not known word', () => {
  it('removes the swiped card from visible slots', () => {
    const session = createSession(words5)
    const cardId = session.visibleCardIds[0]

    const next = swipeRight(session, cardId)
    expect(next.visibleCardIds).not.toContain(cardId)
  })

  it('resets knownLevel to 0', () => {
    // First swipeLeft to raise knownLevel, then swipeRight resets it
    const session = createSession(words5)
    const cardId = session.visibleCardIds[0]
    const afterLeft = swipeLeft(session, cardId)

    const next = swipeRight(afterLeft, cardId)
    const updated = next.pool.find(w => w.id === cardId)
    expect(updated?.knownLevel).toBe(0)
  })

  it('records swipeRight in history', () => {
    const session = createSession(words5)
    const cardId = session.visibleCardIds[0]

    const next = swipeRight(session, cardId)
    expect(next.history).toHaveLength(1)
    expect(next.history[0].type).toBe('swipeRight')
  })
})

// ---------------------------------------------------------------------------
// Next card arrival
// ---------------------------------------------------------------------------

describe('next card arrival after swipe', () => {
  it('a new card is pushed to the front of the stack after swipeLeft', () => {
    const session = createSession(words5)
    const frontId = session.visibleCardIds[0]

    const next = swipeLeft(session, frontId)
    expect(next.visibleCardIds[0]).not.toBe(frontId)
  })

  it('a new card is pushed to the front of the stack after swipeRight', () => {
    const session = createSession(words5)
    const frontId = session.visibleCardIds[0]

    const next = swipeRight(session, frontId)
    expect(next.visibleCardIds[0]).not.toBe(frontId)
  })
})

// ---------------------------------------------------------------------------
// Reshow algorithm
// ---------------------------------------------------------------------------

describe('reshowAlgorithm — delay increases for known words', () => {
  it('known word (swipeLeft × 1) gets a larger delay than a fresh word', () => {
    const session = createSession(words5)
    const cardId = session.visibleCardIds[0]

    // swipeLeft makes word "known"
    const afterLeft = swipeLeft(session, cardId)
    const knownWord = afterLeft.pool.find(w => w.id === cardId)!

    // A fresh word has delay = BASE_DELAY_MS (60s)
    // known word: delay is at least BASE_DELAY_MS * 2
    const knownDelay = knownWord.nextShowTime - Date.now()
    const freshWord = afterLeft.pool.find(w => w.id !== cardId)!
    const freshDelay = freshWord.nextShowTime - Date.now()

    expect(knownDelay).toBeGreaterThan(freshDelay)
  })

  it('repeated swipeLeft on the same word raises knownLevel to 3', () => {
    // Use exactly 3 words so the same card must cycle back after 3 swipes
    const threeWords: TrainingWord[] = [
      makeWord(1, 'a', 'а'),
      makeWord(2, 'b', 'б'),
      makeWord(3, 'c', 'в'),
    ]
    let session = createSession(threeWords)
    let cardId = session.visibleCardIds[0]

    // Swipe the same physical card 4 times (it cycles back)
    session = swipeLeft(session, cardId)
    cardId = session.visibleCardIds[0]
    session = swipeLeft(session, cardId)
    cardId = session.visibleCardIds[0]
    session = swipeLeft(session, cardId)
    cardId = session.visibleCardIds[0]
    session = swipeLeft(session, cardId)

    const word = session.pool.find(w => w.id === cardId)!
    expect(word.knownLevel).toBe(3)
  })

  it('known word delay does not exceed MAX_DELAY_MS', () => {
    let session = createSession(words5)
    let cardId = session.visibleCardIds[0]

    // Raise to max level by swiping the same card repeatedly
    const threeWords: TrainingWord[] = [
      makeWord(1, 'a', 'а'),
      makeWord(2, 'b', 'б'),
      makeWord(3, 'c', 'в'),
    ]
    session = createSession(threeWords)
    cardId = session.visibleCardIds[0]

    for (let i = 0; i < 10; i++) {
      session = swipeLeft(session, cardId)
      cardId = session.visibleCardIds[0]
    }

    const word = session.pool.find(w => w.id === cardId)!
    const delay = word.nextShowTime - Date.now()
    // Should be capped at MAX_DELAY_MS (3_600_000)
    expect(delay).toBeLessThanOrEqual(3_600_000)
  })
})

// ---------------------------------------------------------------------------
// Infinite training
// ---------------------------------------------------------------------------

describe('infinite training — pool exhaustion', () => {
  it('after swiping all words, new cards still appear', () => {
    let session = createSession(words5)

    // Keep swiping all cards away
    for (let i = 0; i < 10; i++) {
      const frontId = session.visibleCardIds[0]
      if (!frontId) break
      session = swipeLeft(session, frontId)
    }

    // We should still have visible cards (words loop back)
    const visibleNonEmpty = session.visibleCardIds.filter(id => id !== '')
    expect(visibleNonEmpty.length).toBeGreaterThan(0)
  })

  it('the same word can reappear after being swiped away', () => {
    let session = createSession(words5)
    const firstFrontId = session.visibleCardIds[0]

    // Remove it
    session = swipeLeft(session, firstFrontId)

    // The word should still be somewhere in the pool
    const word = session.pool.find(w => w.id === firstFrontId)
    expect(word).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// getVisibleCards helper
// ---------------------------------------------------------------------------

describe('getVisibleCards', () => {
  it('returns three items', () => {
    const session = createSession(words5)
    const cards = getVisibleCards(session)
    expect(cards).toHaveLength(3)
  })

  it('first item is the frontmost card', () => {
    const session = createSession(words5)
    const cards = getVisibleCards(session)
    const frontId = session.visibleCardIds[0]
    expect(cards[0]?.id).toBe(frontId)
  })

  it('returns null for empty slots when pool is smaller than 3', () => {
    const tiny = [makeWord(1, 'a', 'а')]
    const session = createSession(tiny)
    const cards = getVisibleCards(session)
    expect(cards[0]).not.toBeNull()
    expect(cards[1]).toBeNull()
    expect(cards[2]).toBeNull()
  })
})
