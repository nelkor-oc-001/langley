import { create } from 'zustand'
import { createSession, flipCard, swipeLeft, swipeRight, getVisibleCards } from '../training/index.ts'
import type { TrainingSession } from '../training/index.ts'
import type { Language, SetId } from '../setup/SetupStore.ts'
import { getWordPool } from '../data/service.ts'

interface TrainingState {
  session: TrainingSession | null
  isLoading: boolean
  error: string | null

  initSession: (nativeLang: Language, learningLang: Language, setIds: SetId[]) => Promise<void>
  flipCard: (cardId: string) => void
  swipeLeft: (cardId: string) => void
  swipeRight: (cardId: string) => void
  reset: () => void
}

export const useTrainingStore = create<TrainingState>((set) => ({
  session: null,
  isLoading: false,
  error: null,

  initSession: async (nativeLang, learningLang, setIds) => {
    set({ isLoading: true, error: null })
    try {
      const words = await getWordPool(setIds, nativeLang, learningLang)
      if (words.length === 0) {
        set({ error: 'Нет слов для выбранной языковой пары', isLoading: false })
        return
      }
      const session = createSession(words)
      set({ session, isLoading: false })
    } catch (err) {
      set({ error: 'Не удалось загрузить слова', isLoading: false })
    }
  },

  flipCard: (cardId) =>
    set((state) => {
      if (!state.session) return state
      return { session: flipCard(state.session, cardId) }
    }),

  swipeLeft: (cardId) =>
    set((state) => {
      if (!state.session) return state
      return { session: swipeLeft(state.session, cardId) }
    }),

  swipeRight: (cardId) =>
    set((state) => {
      if (!state.session) return state
      return { session: swipeRight(state.session, cardId) }
    }),

  reset: () => set({ session: null, isLoading: false, error: null }),
}))

export { getVisibleCards }
