/**
 * Language codes supported by the app.
 */
export type Language = 'en' | 'ru' | 'es'

/**
 * IDs of the built-in word sets.
 */
export type SetId = 'nouns' | 'verbs'

/**
 * A single word entry with translations across all supported languages.
 * Any language may be null if the translation is not available.
 */
export interface WordEntry {
  en: string | null
  ru: string | null
  es: string | null
}

/**
 * A collection of word entries that can be used in training.
 */
export interface WordSet {
  id: SetId
  name: string
  description: string
  entries: WordEntry[]
}

/**
 * A set descriptor returned by the "list sets" endpoint.
 */
export interface SetDescriptor {
  id: SetId
  name: string
  description: string
}

/**
 * A word ready to be presented in a training session.
 * Contains the word in the learning language and its translation
 * in the native language.
 */
export interface TrainingWord {
  id: number
  learning: string
  native: string
}
