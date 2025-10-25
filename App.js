import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native';
import GameCanvas from './src/components/game/GameCanvas';
import useGameStore from './src/features/game/store';
import useCharacterStore from './src/features/characters/store';
import { GAME_CONFIG } from './src/config/game';
import { THEME } from './src/config/theme';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('menu'); // 'menu', 'characters', 'game'
  const { isPlaying, score, level, lives } = useGameStore();
  const { characters, selectedCharacter } = useCharacterStore();

  const startGame = (characterId) => {
    useGameStore.getState().startGame(characterId, 1);
    setCurrentScreen('game');
  };

  const renderMenu = () => (
    <View style={styles.container}>
      <Text style={styles.title}>🎮 Lapsus Somnii</Text>
      <Text style={styles.subtitle}>React Native + Three.js + Zustand</Text>
      <Text style={styles.version}>React 19.1.0 • RN 0.81.5</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => setCurrentScreen('characters')}
      >
        <Text style={styles.buttonText}>Select Character</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => startGame('alex')}
      >
        <Text style={styles.buttonText}>Quick Play (Alex)</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCharacters = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Character</Text>
      
      {characters.map((character) => (
        <TouchableOpacity
          key={character.id}
          style={styles.characterButton}
          onPress={() => startGame(character.id)}
        >
          <Text style={styles.characterName}>{character.name}</Text>
          <Text style={styles.characterDetails}>
            {character.culture} • {character.profession}
          </Text>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setCurrentScreen('menu')}
      >
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGame = () => (
    <View style={styles.container}>
      <View style={styles.hud}>
        <Text style={styles.hudText}>Score: {score}</Text>
        <Text style={styles.hudText}>Level: {level}</Text>
        <Text style={styles.hudText}>Lives: {lives}</Text>
      </View>
      
      <GameCanvas style={styles.gameContainer} />
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setCurrentScreen('menu')}
      >
        <Text style={styles.buttonText}>Back to Menu</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {currentScreen === 'menu' && renderMenu()}
      {currentScreen === 'characters' && renderCharacters()}
      {currentScreen === 'game' && renderGame()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 5,
  },
  version: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    margin: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  characterButton: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    margin: 5,
    minWidth: 250,
    alignItems: 'center',
  },
  characterName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  characterDetails: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 5,
  },
  backButton: {
    backgroundColor: '#666',
    padding: 10,
    borderRadius: 8,
    margin: 10,
    minWidth: 150,
    alignItems: 'center',
  },
  hud: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1000,
  },
  hudText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  gameContainer: {
    width: 300,
    height: 300,
    backgroundColor: '#111',
  },
});