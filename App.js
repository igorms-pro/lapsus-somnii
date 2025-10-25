import React from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>🎮 Lapsus Somnii</Text>
      <Text style={styles.subtitle}>React Native + Three.js</Text>
      
      <GLView
        style={styles.gameContainer}
        onContextCreate={(gl) => {
          // Three.js setup
          const renderer = new Renderer({ gl });
          renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
          renderer.setClearColor(0x000000, 1.0);

          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(
            75,
            gl.drawingBufferWidth / gl.drawingBufferHeight,
            0.1,
            1000
          );
          camera.position.z = 5;

          // Create a simple cube (placeholder for game)
          const geometry = new THREE.BoxGeometry();
          const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
          const cube = new THREE.Mesh(geometry, material);
          scene.add(cube);

          // Animation loop
          const animate = () => {
            requestAnimationFrame(animate);
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            renderer.render(scene, camera);
            gl.endFrameEXP();
          };
          animate();
        }}
      />
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
    marginBottom: 20,
  },
  gameContainer: {
    width: 300,
    height: 300,
    backgroundColor: '#111',
  },
});
