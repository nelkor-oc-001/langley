import { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { SessionWord } from './index.ts'

interface CardProps {
  sessionWord: SessionWord
  isFlipped: boolean
  onFlip: () => void
  onSwipeLeft: () => void
  onSwipeRight: () => void
  /** Stack position: 0 = front (interactive), 1 = middle, 2 = back */
  position: 0 | 1 | 2
}

const SWIPE_THRESHOLD = 80

export function Card({
  sessionWord,
  isFlipped,
  onFlip,
  onSwipeLeft,
  onSwipeRight,
  position,
}: CardProps) {
  const [offsetX, setOffsetX] = useState(0)
  const dragStartX = useRef(0)
  const hasDragged = useRef(false)

  const stackStyles: Record<number, { y: number; scale: number; zIndex: number }> = {
    0: { y: 0,    scale: 1,    zIndex: 3 },
    1: { y: 12,   scale: 0.96, zIndex: 2 },
    2: { y: 24,   scale: 0.92, zIndex: 1 },
  }
  const { y, scale, zIndex } = stackStyles[position]

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (position !== 0) return
    dragStartX.current = e.clientX
    hasDragged.current = false
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [position])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (position !== 0) return
    const delta = e.clientX - dragStartX.current
    if (Math.abs(delta) > 5) {
      hasDragged.current = true
    }
    setOffsetX(delta)
  }, [position])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (position !== 0) return
    const delta = e.clientX - dragStartX.current
    setOffsetX(0)

    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      if (delta < 0) {
        onSwipeLeft()
      } else {
        onSwipeRight()
      }
    } else if (!hasDragged.current) {
      onFlip()
    }
    hasDragged.current = false
  }, [position, onFlip, onSwipeLeft, onSwipeRight])

  return (
    <motion.div
      style={{
        y,
        scale,
        zIndex,
        x: offsetX,
        touchAction: 'pan-y',
        cursor: position === 0 ? (isFlipped ? 'pointer' : 'grab') : 'default',
        userSelect: 'none',
        width: '100%',
        height: '100%',
        minHeight: 220,
      }}
      animate={{
        x: offsetX,
        opacity: Math.abs(offsetX) > SWIPE_THRESHOLD ? 0 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div style={{ width: '100%', height: '100%', perspective: 800, position: 'relative' }}>
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            rotateY: isFlipped ? 180 : 0,
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          {/* Front */}
          <div
            className="training-card__face training-card__face--front"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              position: 'absolute',
              inset: 0,
            }}
          >
            <span className="training-card__word">{sessionWord.word.learning}</span>
            <span className="training-card__hint">tap to flip</span>
          </div>

          {/* Back */}
          <div
            className="training-card__face training-card__face--back"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              position: 'absolute',
              inset: 0,
              transform: 'rotateY(180deg)',
            }}
          >
            <span className="training-card__word training-card__word--native">
              {sessionWord.word.native}
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
