import { create } from 'zustand'

export type Language = 'en' | 'ru' | 'es'
export type SetId = 'nouns' | 'verbs'

export interface SetupState {
  nativeLanguage: Language | null
  learningLanguage: Language | null
  selectedSets: SetId[]
  isLoading: boolean
  error: string | null

  setNativeLanguage: (lang: Language) => void
  setLearningLanguage: (lang: Language) => void
  toggleSet: (setId: SetId) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  nativeLanguage: null,
  learningLanguage: null,
  selectedSets: [] as SetId[],
  isLoading: false,
  error: null,
}

export const useSetupStore = create<SetupState>((set) => ({
  ...initialState,

  setNativeLanguage: (lang) =>
    set((state) => ({
      nativeLanguage: lang,
      learningLanguage:
        state.learningLanguage === lang ? null : state.learningLanguage,
    })),

  setLearningLanguage: (lang) =>
    set((state) => ({
      learningLanguage: lang,
      nativeLanguage:
        state.nativeLanguage === lang ? null : state.nativeLanguage,
    })),

  toggleSet: (setId) =>
    set((state) => ({
      selectedSets: state.selectedSets.includes(setId)
        ? state.selectedSets.filter((s) => s !== setId)
        : [...state.selectedSets, setId],
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}))

export const isConfigValid = (state: SetupState): boolean => {
  return (
    state.nativeLanguage !== null &&
    state.learningLanguage !== null &&
    state.nativeLanguage !== state.learningLanguage &&
    state.selectedSets.length > 0
  )
}
