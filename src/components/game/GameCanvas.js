/**
 * GameCanvas - Three.js Game Canvas
 * Main game rendering component with 3D game engine
 */

import React, { useRef, useEffect } from 'react';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { GameEngine3D } from '../../features/game/engine/GameEngine3D';
import useGameStore from '../../features/game/store';

const GameCanvas = ({ style }) => {
  const { isPlaying, isPaused, gameOver, startGame, pauseGame, resumeGame, endGame } = useGameStore();
  const gameEngineRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  const onContextCreate = (gl) => {
    // Create 3D game engine
    const gameEngine = new GameEngine3D(
      gl, 
      gl.drawingBufferWidth, 
      gl.drawingBufferHeight
    );
    gameEngineRef.current = gameEngine;
    
    // Start game
    gameEngine.startGame();
    
    // Game loop
    const animate = (currentTime) => {
      if (gameEngineRef.current) {
        if (isPlaying && !isPaused && !gameOver) {
          gameEngineRef.current.update(currentTime);
        }
        
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    animate(0);
  };
  
  // Handle game state changes
  useEffect(() => {
    if (gameEngineRef.current) {
      if (isPaused) {
        gameEngineRef.current.pauseGame();
      } else if (isPlaying && !gameOver) {
        gameEngineRef.current.resumeGame();
      } else if (gameOver) {
        gameEngineRef.current.endGame();
      }
    }
  }, [isPlaying, isPaused, gameOver]);
  
  // Handle input
  const handleTouch = (event) => {
    if (!gameEngineRef.current || !isPlaying) return;
    
    const { locationX, locationY } = event.nativeEvent;
    const centerX = style.width / 2;
    
    if (locationX < centerX) {
      gameEngineRef.current.handleInput('left');
    } else {
      gameEngineRef.current.handleInput('right');
    }
  };
  
  const handleTouchEnd = () => {
    if (!gameEngineRef.current || !isPlaying) return;
    gameEngineRef.current.handleInput('jump');
  };
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (gameEngineRef.current) {
        gameEngineRef.current.dispose();
      }
    };
  }, []);
  
  return (
    <GLView
      style={style}
      onContextCreate={onContextCreate}
      onTouchStart={handleTouch}
      onTouchEnd={handleTouchEnd}
    />
  );
};

export default GameCanvas;
