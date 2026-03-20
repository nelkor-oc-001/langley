import { useNavigate } from 'react-router-dom'
import { useSetupStore, isConfigValid, type Language, type SetId } from './SetupStore'

const LANGUAGES: { id: Language; label: string; flag: string }[] = [
  { id: 'en', label: 'English', flag: '🇬🇧' },
  { id: 'ru', label: 'Русский', flag: '🇷🇺' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
]

const SETS: { id: SetId; label: string; description: string }[] = [
  { id: 'nouns', label: 'Существительные', description: '100 наиболее употребимых' },
  { id: 'verbs', label: 'Глаголы', description: '100 наиболее употребимых' },
]

function LoadingState() {
  return (
    <div className="setup-loading">
      <div className="setup-loading-spinner" />
      <p>Загрузка данных…</p>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="setup-error">
      <p>{message}</p>
      <button className="btn-secondary" onClick={() => useSetupStore.getState().setError(null)}>
        Попробовать снова
      </button>
    </div>
  )
}

export function SetupScreen() {
  const navigate = useNavigate()
  const {
    nativeLanguage,
    learningLanguage,
    selectedSets,
    isLoading,
    error,
    setNativeLanguage,
    setLearningLanguage,
    toggleSet,
  } = useSetupStore()

  const valid = isConfigValid(useSetupStore.getState())

  if (isLoading) {
    return (
      <div className="page-setup">
        <LoadingState />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-setup">
        <ErrorState message={error} />
      </div>
    )
  }

  return (
    <div className="page-setup">
      <div className="setup-container">

        <h1>Настройка тренировки</h1>

        {/* Language selection */}
        <section className="setup-section">
          <h2>Языки</h2>

          <div className="language-group">
            <div className="language-selector">
              <span className="selector-label">Я знаю</span>
              <div className="language-options">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    className={`language-btn ${nativeLanguage === lang.id ? 'selected' : ''}`}
                    onClick={() => setNativeLanguage(lang.id)}
                    disabled={learningLanguage === lang.id}
                    title={lang.label}
                  >
                    <span className="lang-flag">{lang.flag}</span>
                    <span className="lang-label">{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="language-arrow">→</div>

            <div className="language-selector">
              <span className="selector-label">Изучаю</span>
              <div className="language-options">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    className={`language-btn ${learningLanguage === lang.id ? 'selected' : ''}`}
                    onClick={() => setLearningLanguage(lang.id)}
                    disabled={nativeLanguage === lang.id}
                    title={lang.label}
                  >
                    <span className="lang-flag">{lang.flag}</span>
                    <span className="lang-label">{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {nativeLanguage && learningLanguage && nativeLanguage === learningLanguage && (
            <p className="setup-hint error">Языки не должны совпадать</p>
          )}
        </section>

        {/* Sets selection */}
        <section className="setup-section">
          <h2>Наборы слов</h2>

          <div className="sets-options">
            {SETS.map((set) => (
              <button
                key={set.id}
                className={`set-btn ${selectedSets.includes(set.id) ? 'selected' : ''}`}
                onClick={() => toggleSet(set.id)}
              >
                <span className="set-check">
                  {selectedSets.includes(set.id) ? '✓' : ''}
                </span>
                <span className="set-info">
                  <span className="set-name">{set.label}</span>
                  <span className="set-desc">{set.description}</span>
                </span>
              </button>
            ))}
          </div>

          {selectedSets.length === 0 && (
            <p className="setup-hint">Выберите хотя бы один набор</p>
          )}
        </section>

        {/* Start button */}
        <div className="setup-actions">
          <button
            className="btn-primary btn-start"
            disabled={!valid}
            onClick={() => navigate('/training')}
          >
            Начать тренировку
          </button>
        </div>

      </div>
    </div>
  )
}
