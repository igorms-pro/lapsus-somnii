/**
 * Game Store - Zustand
 * Manages game state, score, level progression
 */

import { create } from 'zustand';

const useGameStore = create((set, get) => ({
  // Game State
  isPlaying: false,
  isPaused: false,
  gameOver: false,
  
  // Score & Progress
  score: 0,
  level: 1,
  world: 1,
  lives: 3,
  
  // Character & World
  selectedCharacter: null,
  selectedWorld: null,
  
  // Game Actions
  startGame: (character, world) => set({
    isPlaying: true,
    isPaused: false,
    gameOver: false,
    selectedCharacter: character,
    selectedWorld: world,
    score: 0,
    level: 1,
    lives: 3,
  }),
  
  pauseGame: () => set({ isPaused: true }),
  
  resumeGame: () => set({ isPaused: false }),
  
  endGame: () => set({
    isPlaying: false,
    gameOver: true,
  }),
  
  updateScore: (points) => set((state) => ({
    score: state.score + points,
  })),
  
  setGameState: (gameState) => set({
    isPlaying: gameState.isPlaying,
    isPaused: gameState.isPaused,
    gameOver: gameState.gameOver,
    score: gameState.score,
    level: gameState.level,
    lives: gameState.lives,
  }),
  
  nextLevel: () => set((state) => ({
    level: state.level + 1,
  })),
  
  loseLife: () => set((state) => ({
    lives: Math.max(0, state.lives - 1),
    gameOver: state.lives <= 1,
  })),
  
  resetGame: () => set({
    isPlaying: false,
    isPaused: false,
    gameOver: false,
    score: 0,
    level: 1,
    lives: 3,
  }),
}));

export default useGameStore;
