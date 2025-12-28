# 🎮 STRANGER THINGS: HAWKINS DEFENSE - SETUP GUIDE

## ✅ ALL ENHANCEMENTS INTEGRATED!

Your game is now fully enhanced with:
- ✅ 3D Meshy models (Demogorgon, Mind Flayer, Vecna)
- ✅ Complete audio system with synthetic sounds
- ✅ Visual effects (explosions, muzzle flash, damage vignette, particles)
- ✅ Full story integration with narrative text
- ✅ Enhanced weapon with recoil and effects
- ✅ Progressive 3-level system

---

## 🚀 HOW TO RUN THE GAME

### Step 1: Install Node.js (if not already installed)

1. Download Node.js from: https://nodejs.org/
2. Install it (use the LTS version)
3. Verify installation by opening Command Prompt and typing:
   ```
   node --version
   npm --version
   ```

### Step 2: Install Dependencies

Open Command Prompt in the `FPS-Core` folder and run:

```bash
npm install
```

This will install all required packages.

### Step 3: Start the Development Server

```bash
npm run dev
```

The game will start at: **http://localhost:5173**

### Step 4: Play!

1. Open your browser to http://localhost:5173
2. Click "START MISSION"
3. Use WASD to move, SPACE to jump, MOUSE to look/shoot
4. Fight through all 3 levels!

---

## 🎯 GAME STRUCTURE

### Level 1: Demogorgon Hunt
- **Enemy**: Demogorgon (using your Meshy model)
- **Objective**: Kill 15 Demogorgons
- **Environment**: Red/orange flickering lights, Upside Down atmosphere
- **Story**: Breach containment, stop the predators

### Level 2: Mind Flayer Invasion
- **Enemy**: Mind Flayer (using your Meshy model)
- **Objective**: Kill 25 Shadow creatures
- **Environment**: Purple storm, coordinated attacks
- **Story**: Weaken the Mind Flayer's hold

### Level 3: Vecna's Curse
- **Enemy**: Vecna BOSS (using your Meshy model)
- **Objective**: Defeat Vecna
- **Environment**: Red dramatic lighting, Creel House
- **Story**: Final battle to save Hawkins

---

## 🔧 FILES THAT WERE ENHANCED

### Core Game Files (Modified):
- `client/src/game/Enemy.tsx` - Now uses Meshy 3D models
- `client/src/game/Weapon.tsx` - Enhanced with recoil and audio
- `client/src/pages/Game.tsx` - Integrated audio and story
- `client/src/game/ModelLoader.tsx` - Updated to load your GLB files

### New Enhancement Files:
- `client/src/game/AudioManager.tsx` - Audio system
- `client/src/game/VisualEffects.tsx` - Particle effects
- `client/src/game/StorySystem.tsx` - Narrative content

### 3D Models (From Meshy):
- `public/models/enemies/demogorgon.glb` ✅
- `public/models/enemies/mindflayer.glb` ✅
- `public/models/enemies/vecna2.glb` ✅

---

## 🎨 FEATURES

### Audio System (Web Audio API - No files needed!)
- Synthetic gunshot sounds
- Hit markers
- Kill explosions
- Level complete/game over sounds
- Ambient audio per level

### Visual Effects
- Blood splatter particles on hit
- Enemy death explosions
- Muzzle flash when shooting
- Damage vignette (screen turns red when hurt)
- Screen shake on explosions

### Story Integration
- Game intro narrative
- Level introductions with threat descriptions
- Victory screens with story progression
- Character dialogue from The Party
- Final victory message

### Enhanced Weapon
- Weapon bob and sway
- Recoil animation
- Muzzle flash effect
- Audio feedback for every action

---

## 🐛 TROUBLESHOOTING

### Models not showing?
- Make sure all 3 GLB files are in `public/models/enemies/`
- Check browser console (F12) for loading errors
- Models should auto-load when enemies spawn

### No sound?
- Make sure your browser allows audio
- Check volume settings in AudioManager.tsx
- Audio is generated synthetically, no files needed

### Game not starting?
- Install dependencies: `npm install`
- Make sure port 5173 is not in use
- Try `npm run dev` again

### Performance issues?
- Lower the enemy count in `store.ts` LEVEL_CONFIGS
- Disable some visual effects in VisualEffects.tsx
- Your Meshy models might be high-poly - they have ~1M faces

---

## 🎮 CONTROLS

- **WASD** - Move around
- **SPACE** - Jump
- **MOUSE** - Look around
- **LEFT CLICK** - Shoot
- **ESC** - Release mouse lock

---

## 📊 SCORING SYSTEM

- Each kill: +100 points (configured in LEVEL_CONFIGS)
- Complete Level 1: Bonus score
- Complete Level 2: Bonus score
- Complete Level 3: Final victory!

High scores are saved to the leaderboard!

---

## 🌟 NEXT STEPS (OPTIONAL ENHANCEMENTS)

Want to add more? Here are ideas:

1. **Power-ups**
   - Eggo Waffles for health
   - Flashlight for visibility
   - Shield from Eleven's powers

2. **Better Enemy AI**
   - Chase player
   - Dodge bullets
   - Group tactics

3. **More Levels**
   - Starcourt Mall
   - Hawkins Lab
   - The Void

4. **Multiplayer**
   - Co-op mode
   - Competitive scoring

---

## 🎉 YOU'RE ALL SET!

Everything is ready to go. Just run:

```bash
npm install
npm run dev
```

Then open http://localhost:5173 and start playing!

**Good luck saving Hawkins!** 🎮🔥

---

## 📞 NEED HELP?

Check the browser console (F12) for any errors. Most issues are:
1. Missing dependencies (run `npm install`)
2. Models not in the right folder
3. Port already in use (change in vite.config.ts)

Enjoy the game! 🌙✨
