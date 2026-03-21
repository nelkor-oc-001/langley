import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrainingStore, getVisibleCards } from './TrainingStore'
import { useSetupStore } from '../setup/SetupStore'
import { Card } from './Card'

export function TrainingScreen() {
  const navigate = useNavigate()
  const { session, isLoading, error, initSession, reset } = useTrainingStore()
  const { nativeLanguage, learningLanguage, selectedSets } = useSetupStore()

  useEffect(() => {
    if (!nativeLanguage || !learningLanguage || selectedSets.length === 0) {
      navigate('/setup')
      return
    }
    initSession(nativeLanguage, learningLanguage, selectedSets)
    return () => reset()
  }, [])

  const handleExit = () => {
    reset()
    navigate('/setup')
  }

  if (isLoading) {
    return (
      <div className="page-training">
        <div className="training-loading">
          <div className="training-loading-spinner" />
          <p>Подготовка слов…</p>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="page-training">
        <div className="training-error">
          <p>{error ?? 'Что-то пошло не так'}</p>
          <button className="btn-secondary" onClick={handleExit}>
            Назад к настройкам
          </button>
        </div>
      </div>
    )
  }

  const [card1, card2, card3] = getVisibleCards(session)

  return (
    <div className="page-training">
      <div className="training-container">
        {/* Header */}
        <div className="training-header">
          <button className="training-exit btn-secondary" onClick={handleExit}>
            ← Настройки
          </button>
          <div className="training-stats">
            <span>{session.pool.length} слов</span>
          </div>
        </div>

        {/* Card stack */}
        <div className="training-cards">
          {card3 && (
            <div className="training-card-wrapper" style={{ zIndex: 1 }}>
              <Card
                key={card3.id}
                sessionWord={card3}
                isFlipped={false}
                onFlip={() => {}}
                onSwipeLeft={() => {}}
                onSwipeRight={() => {}}
                position={2}
              />
            </div>
          )}
          {card2 && (
            <div className="training-card-wrapper" style={{ zIndex: 2 }}>
              <Card
                key={card2.id}
                sessionWord={card2}
                isFlipped={false}
                onFlip={() => {}}
                onSwipeLeft={() => {}}
                onSwipeRight={() => {}}
                position={1}
              />
            </div>
          )}
          {card1 && (
            <div className="training-card-wrapper training-card-wrapper--front" style={{ zIndex: 3 }}>
              <Card
                key={card1.id}
                sessionWord={card1}
                isFlipped={session.flippedCardId === card1.id}
                onFlip={() => useTrainingStore.getState().flipCard(card1.id)}
                onSwipeLeft={() => useTrainingStore.getState().swipeLeft(card1.id)}
                onSwipeRight={() => useTrainingStore.getState().swipeRight(card1.id)}
                position={0}
              />
            </div>
          )}
        </div>

        {/* Swipe hints */}
        <div className="training-hints">
          <span className="training-hint training-hint--left">← знакомо</span>
          <span className="training-hint training-hint--right">не закреплено →</span>
        </div>
      </div>
    </div>
  )
}
