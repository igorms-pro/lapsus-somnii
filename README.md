# Lapsus Somnii - Le Rêve Infini

![Lapsus Somnii](https://img.shields.io/badge/Status-En%20Développement-gold)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 🌙 Concept

**Lapsus Somnii** plonge le joueur dans un univers onirique où il chute à travers des paysages de rêve en constante évolution. Le joueur doit naviguer à travers des obstacles mystiques et des illusions qui bloquent sa descente, tout en collectant des fragments de souvenirs et des pouvoirs éphémères pour prolonger la chute.

## 🎮 Gameplay

- **Chute verticale contrôlée** avec mouvements latéraux pour éviter obstacles et pièges
- **Obstacles thématiques** : illusions, fragments de rêve, créatures oniriques
- **Power-ups interactifs** : ralentir le temps, inverser la gravité, créer des chemins temporaires
- **Progression infinie** avec scoring basé sur la durée de la chute et les collectibles

## 🎨 Direction Artistique

- **Univers poétique et surréaliste** inspiré du symbolisme grec et latin
- **Palette de couleurs douces** mais contrastées avec effets de lumière éthérés
- **Bande-son immersive** et évolutive qui accompagne la chute et l'intensité du gameplay

## 🚀 Installation et Lancement

### Prérequis
- Navigateur web moderne (Chrome, Firefox, Safari, Edge)
- Serveur web local (optionnel mais recommandé)

### Installation

1. **Cloner le repository**
   ```bash
   git clone https://github.com/votre-username/lapsus-somnii.git
   cd lapsus-somnii
   ```

2. **Lancer le jeu**

   **Option 1 : Serveur local (recommandé)**
   ```bash
   # Avec Python 3
   python -m http.server 8000
   
   # Avec Node.js (si vous avez http-server installé)
   npx http-server
   
   # Avec PHP
   php -S localhost:8000
   ```

   **Option 2 : Ouverture directe**
   - Ouvrir `index.html` directement dans votre navigateur
   - ⚠️ Certaines fonctionnalités peuvent ne pas fonctionner sans serveur

3. **Accéder au jeu**
   - Ouvrir votre navigateur
   - Aller à `http://localhost:8000` (ou le port de votre serveur)

## 🎯 Contrôles

### Desktop
- **Flèches gauche/droite** ou **A/D** : Navigation latérale
- **Espace** ou **W** : Utiliser un pouvoir
- **Échap** : Pause/Reprendre
- **F11** : Plein écran

### Mobile/Tactile
- **Glisser gauche/droite** : Navigation latérale
- **Tap** : Utiliser un pouvoir

## 🏗️ Architecture Technique

### Structure du Projet
```
lapsus-somnii/
├── index.html          # Point d'entrée principal
├── styles.css          # Styles et thème visuel
├── manifest.json       # Configuration PWA
├── sw.js              # Service Worker
├── js/
│   ├── game.js        # Moteur de jeu principal
│   ├── player.js      # Logique du joueur
│   ├── obstacles.js   # Système d'obstacles et power-ups
│   ├── particles.js   # Système de particules
│   ├── audio.js       # Gestion audio
│   └── main.js        # Point d'entrée JavaScript
└── README.md          # Documentation
```

### Technologies Utilisées
- **HTML5 Canvas** : Rendu graphique
- **Web Audio API** : Sons procéduraux
- **Service Worker** : Capacités PWA
- **CSS3** : Animations et effets visuels
- **JavaScript ES6+** : Logique de jeu

## 🎵 Système Audio

Le jeu utilise l'**Web Audio API** pour générer des sons procéduraux :
- **Sons de collection** : Cloches éthérées
- **Sons de collision** : Impacts sourds
- **Sons de power-ups** : Effets magiques
- **Ambiance** : Drone onirique

## 📱 PWA (Progressive Web App)

Lapsus Somnii est conçu comme une PWA :
- **Installable** sur mobile et desktop
- **Fonctionnement hors-ligne** grâce au Service Worker
- **Interface adaptative** pour tous les écrans
- **Performance optimisée**

## 🎨 Personnalisation

### Modifier les Couleurs
Éditer `styles.css` pour changer la palette de couleurs :
```css
:root {
    --primary-color: #ffd700;
    --secondary-color: #1a1a2e;
    --accent-color: #00ff88;
}
```

### Ajuster la Difficulté
Modifier `js/game.js` :
```javascript
this.speed = 2;           // Vitesse initiale
this.maxSpeed = 8;        // Vitesse maximale
this.obstacleSpawnTimer = 2000; // Fréquence d'apparition
```

## 🐛 Débogage

### Console du Navigateur
Ouvrir les outils de développement (F12) pour voir :
- Logs de performance
- Erreurs JavaScript
- Statistiques FPS

### Mode Développement
Le jeu affiche automatiquement les FPS en mode localhost.

## 🚀 Déploiement

### GitHub Pages
1. Pousser le code sur GitHub
2. Aller dans Settings > Pages
3. Sélectionner la branche main
4. Le jeu sera disponible à `https://votre-username.github.io/lapsus-somnii`

### Netlify
1. Connecter votre repository GitHub
2. Configurer le build (pas de build nécessaire)
3. Déployer automatiquement

### Vercel
```bash
npm install -g vercel
vercel --prod
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. **Fork** le projet
2. **Créer** une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

## 📝 Roadmap

### Version 1.0 (Actuelle)
- [x] Gameplay de base
- [x] Système d'obstacles
- [x] Power-ups
- [x] Interface utilisateur
- [x] Audio procédural

### Version 1.1 (Prochaine)
- [ ] Niveaux thématiques
- [ ] Système de sauvegarde
- [ ] Leaderboards
- [ ] Effets visuels avancés

### Version 1.2 (Future)
- [ ] Mode multijoueur
- [ ] Éditeur de niveaux
- [ ] Mods et personnalisation
- [ ] Version mobile native

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- Inspiration : Symbolisme grec et latin
- Polices : Google Fonts (Cinzel, Cormorant Garamond)
- Icônes : SVG personnalisées
- Audio : Web Audio API

## 📞 Contact

- **Développeur** : [Votre Nom]
- **Email** : [votre.email@example.com]
- **GitHub** : [@votre-username]

---

*"Dans le rêve infini, chaque chute est une nouvelle aventure..."* 🌙✨
