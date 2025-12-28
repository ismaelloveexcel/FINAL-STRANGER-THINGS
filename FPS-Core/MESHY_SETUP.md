# Meshy AI Asset Generation Guide

This guide will help you generate professional 3D models for your Stranger Things game using Meshy AI.

## 🎯 What Will Be Generated

### Enemy Models
- **Demogorgon** - Terrifying creature with petal-like head (Level 1)
- **Mind Flayer** - Massive shadowy tentacled monster (Level 2)
- **Vecna** - Burned humanoid villain with vines (Level 3)

### Environment Assets
- **Upside Down Vines** - Organic creeping tendrils
- **Creel House Debris** - Destroyed house pieces
- **Portal** - Glowing interdimensional gateway

### Weapons
- **Energy Gun** - Futuristic sci-fi pistol
- **Nail Bat** - Steve's iconic weapon from the show

## 📋 Prerequisites

1. **Meshy AI Account**
   - Sign up at: https://meshy.ai
   - Get your API key from the dashboard

2. **Node.js & npm**
   - Already installed with your project

## 🚀 Step-by-Step Setup

### Step 1: Get Your Meshy API Key

1. Go to https://meshy.ai
2. Sign in to your account
3. Navigate to **Settings** → **API Keys**
4. Click **Create New API Key**
5. Copy the key (it looks like: `msy_xxxxxxxxxxxxx`)

### Step 2: Set Environment Variable

**On Windows (PowerShell):**
```powershell
$env:MESHY_API_KEY="your-api-key-here"
```

**On Windows (Command Prompt):**
```cmd
set MESHY_API_KEY=your-api-key-here
```

**On Mac/Linux:**
```bash
export MESHY_API_KEY="your-api-key-here"
```

**Permanent Setup (.env file):**
Create a `.env` file in the project root:
```
MESHY_API_KEY=your-api-key-here
```

### Step 3: Run Asset Generator

```bash
npm run generate-assets
```

This will:
1. Create 8-10 generation tasks on Meshy
2. Wait for processing (5-15 minutes per model)
3. Download completed models to `public/models/`

### Step 4: Monitor Progress

You'll see output like:
```
🎮 STRANGER THINGS GAME - MESHY AI ASSET GENERATOR

📤 Creating generation tasks...

✓ Task created: abc123 for "Demogorgon monster..."
✓ Task created: def456 for "Mind Flayer shadow monster..."
...

⏳ Waiting for completions (this may take several minutes)...

🔄 Processing: enemies/demogorgon
  Status: IN_PROGRESS (45%)
  Status: IN_PROGRESS (78%)
  Status: SUCCEEDED
✓ Complete: demogorgon
```

## 📁 Output Structure

After generation, models will be saved to:

```
public/models/
├── enemies/
│   ├── demogorgon.glb
│   ├── mindFlayer.glb
│   └── vecna.glb
├── environment/
│   ├── upsideDownVine.glb
│   ├── creelHouseDebris.glb
│   └── portal.glb
└── weapons/
    ├── energyGun.glb
    └── nailBat.glb
```

## 🎨 Customizing Prompts

Edit `scripts/meshy-generator.ts` to customize the prompts:

```typescript
const ASSET_PROMPTS = {
  enemies: {
    demogorgon: {
      prompt: "Your custom prompt here",
      targetPolycount: 10000,  // Lower = better performance
      artStyle: "realistic",    // realistic, scifi, horror, etc.
    }
  }
}
```

### Art Style Options:
- `realistic` - Photorealistic style
- `horror` - Dark, scary aesthetic
- `scifi` - Futuristic sci-fi look
- `cartoon` - Stylized, cartoony
- `anime` - Anime/manga style

### Polycount Guide:
- **5,000-8,000** - Simple props, mobile games
- **10,000-15,000** - Standard game assets
- **20,000-30,000** - Hero assets, detailed enemies
- **50,000+** - Cinematic quality (slower)

## 🔧 Integration into Game

After generating models, update the Enemy components:

### Example: Using Demogorgon Model

```tsx
import { useGLTF } from '@react-three/drei';

export function Enemy({ type }: { type: EnemyType }) {
  const { scene } = useGLTF(`/models/enemies/${type}.glb`);

  return (
    <primitive
      object={scene.clone()}
      scale={[1, 1, 1]}
      position={position}
    />
  );
}
```

## 💰 Meshy Pricing

- **Free Tier**: 200 credits (good for ~4-8 models)
- **Preview Mode**: 20 credits per model (faster, lower quality)
- **Refine Mode**: 50 credits per model (slower, higher quality)

The script uses **Preview Mode** by default. To use Refine Mode, edit:

```typescript
const data = JSON.stringify({
  mode: 'refine',  // Change from 'preview' to 'refine'
  // ...
});
```

## 🐛 Troubleshooting

### "API Key not set" Error
- Make sure you set the environment variable
- Restart your terminal after setting it
- Check the key starts with `msy_`

### Models Not Downloading
- Check your internet connection
- Verify you have credits remaining on Meshy
- Check the Meshy dashboard for failed tasks

### Model Quality Issues
1. Try Refine mode instead of Preview
2. Increase `targetPolycount`
3. Improve prompt with more details
4. Check example models on Meshy gallery

### Performance Issues in Game
1. Lower `targetPolycount` in prompts
2. Use texture compression
3. Implement LOD (Level of Detail) system
4. Reduce number of enemies on screen

## 🎮 Next Steps After Generation

1. **Preview Models**
   - Use Three.js editor: https://threejs.org/editor/
   - Or Blender for detailed inspection

2. **Optimize Models** (if needed)
   - Reduce polygons
   - Compress textures
   - Bake lighting

3. **Add to Game**
   - Update Enemy.tsx, Level.tsx, Weapon.tsx
   - Adjust scale/rotation
   - Test performance

4. **Add Animations** (optional)
   - Use Meshy's animation feature
   - Or animate in Blender
   - Export as .glb with animations

## 📚 Additional Resources

- Meshy Documentation: https://docs.meshy.ai
- Three.js GLB Loader: https://threejs.org/docs/#examples/en/loaders/GLTFLoader
- React Three Fiber: https://docs.pmnd.rs/react-three-fiber
- Stranger Things Reference: https://strangerthings.fandom.com/

## ⚡ Quick Commands Reference

```bash
# Generate all assets
npm run generate-assets

# Generate specific category (edit script first)
npm run generate-assets -- --category enemies

# Preview models in browser
npx serve public/models
# Visit http://localhost:3000
```

---

**Happy Asset Generating!** 🎨🎮

For issues or questions, check the Meshy Discord or documentation.
