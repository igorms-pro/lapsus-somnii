/**
 * Game Configuration
 * Core game settings and constants
 */

export const GAME_CONFIG = {
  // Game Mechanics
  GRAVITY: 0.5,
  MAX_FALL_SPEED: 15,
  PLAYER_SIZE: 50,
  
  // Difficulty
  INITIAL_SPEED: 3,
  SPEED_INCREMENT: 0.1,
  MAX_SPEED: 10,
  
  // Worlds (Life Stages)
  WORLDS: [
    { id: 1, name: 'Enfance', levels: 8, minAge: 3, maxAge: 10 },
    { id: 2, name: 'Adolescence', levels: 12, minAge: 11, maxAge: 18 },
    { id: 3, name: 'Études', levels: 10, minAge: 18, maxAge: 23 },
    { id: 4, name: 'Vie Adulte', levels: 12, minAge: 25, maxAge: 65 },
    { id: 5, name: 'Sagesse', levels: 15, minAge: 65, maxAge: null },
  ],
  
  // Characters
  CHARACTERS: [
    { id: 'alex', name: 'Alex', culture: 'Européen', profession: 'Artiste' },
    { id: 'amara', name: 'Amara', culture: 'Africaine', profession: 'Entrepreneure' },
    { id: 'marcus', name: 'Marcus', culture: 'Afro-Américain', profession: 'Musicien' },
    { id: 'yuki', name: 'Yuki', culture: 'Asiatique', profession: 'Étudiante en médecine' },
    { id: 'hassan', name: 'Hassan', culture: 'Musulman', profession: 'Ingénieur' },
    { id: 'layla', name: 'Layla', culture: 'Musulmane', profession: 'Architecte' },
    { id: 'diego', name: 'Diego', culture: 'Latino', profession: 'Cuisinier' },
    { id: 'kofi', name: 'Kofi', culture: 'Africain', profession: 'Médecin' },
  ],
  
  // Screen
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
};

export default GAME_CONFIG;

