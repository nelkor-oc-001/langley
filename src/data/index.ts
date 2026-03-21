/**
 * Data layer: word sets, types, and access to the training pool.
 *
 * Public interface:
 *   - types: Language, SetId, WordEntry, WordSet, SetDescriptor, TrainingWord
 *   - getAvailableSets(): returns descriptors for all word sets
 *   - getWordPool(setIds, nativeLanguage, learningLanguage): returns filtered
 *     training words ready for a session
 */
export type {
  Language,
  SetId,
  WordEntry,
  WordSet,
  SetDescriptor,
  TrainingWord,
} from './types.ts'

export { getAvailableSets, getWordPool } from './service.ts'
