/**
 * Characters Store - Zustand
 * Manages character selection and data
 */

import { create } from 'zustand';
import { GAME_CONFIG } from '../../config/game';

const useCharacterStore = create((set, get) => ({
  // Available characters
  characters: GAME_CONFIG.CHARACTERS,
  
  // Selected character
  selectedCharacter: null,
  
  // Character progress
  characterProgress: {},
  
  // Actions
  selectCharacter: (characterId) => {
    const character = GAME_CONFIG.CHARACTERS.find(c => c.id === characterId);
    set({ selectedCharacter: character });
  },
  
  getCharacterProgress: (characterId) => {
    const state = get();
    return state.characterProgress[characterId] || {
      unlockedWorlds: [1], // Start with first world unlocked
      completedLevels: [],
      bestScores: {},
    };
  },
  
  updateCharacterProgress: (characterId, progress) => {
    set((state) => ({
      characterProgress: {
        ...state.characterProgress,
        [characterId]: {
          ...state.characterProgress[characterId],
          ...progress,
        },
      },
    }));
  },
  
  unlockWorld: (characterId, worldId) => {
    const state = get();
    const currentProgress = state.getCharacterProgress(characterId);
    const unlockedWorlds = [...new Set([...currentProgress.unlockedWorlds, worldId])];
    
    state.updateCharacterProgress(characterId, {
      unlockedWorlds,
    });
  },
  
  completeLevel: (characterId, worldId, levelId, score) => {
    const state = get();
    const currentProgress = state.getCharacterProgress(characterId);
    const levelKey = `${worldId}-${levelId}`;
    
    // Add to completed levels
    const completedLevels = [...new Set([...currentProgress.completedLevels, levelKey])];
    
    // Update best score
    const bestScores = {
      ...currentProgress.bestScores,
      [levelKey]: Math.max(currentProgress.bestScores[levelKey] || 0, score),
    };
    
    state.updateCharacterProgress(characterId, {
      completedLevels,
      bestScores,
    });
  },
}));

export default useCharacterStore;
