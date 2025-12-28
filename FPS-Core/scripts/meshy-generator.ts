/**
 * Meshy AI 3D Model Generator
 *
 * This script generates 3D models for the Stranger Things game using Meshy API
 *
 * Usage:
 * 1. Set your MESHY_API_KEY environment variable
 * 2. Run: npm run generate-assets
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const MESHY_API_KEY = process.env.MESHY_API_KEY || '';
const MESHY_API_URL = 'https://api.meshy.ai/v2/text-to-3d';
const OUTPUT_DIR = path.join(__dirname, '../public/models');

// Asset definitions for Stranger Things game
const ASSET_PROMPTS = {
  enemies: {
    demogorgon: {
      prompt: "Demogorgon monster from Stranger Things, terrifying humanoid creature with petal-like head opening to reveal teeth, pale skin, long arms, menacing pose, game-ready low poly model, PBR textures",
      style: "realistic",
      artStyle: "horror",
      targetPolycount: 10000,
      topology: "quad"
    },
    mindFlayer: {
      prompt: "Mind Flayer shadow monster from Stranger Things, massive dark tentacled creature, spider-like legs, shadowy ethereal appearance, ominous presence, game-ready low poly model, dark materials",
      style: "realistic",
      artStyle: "horror",
      targetPolycount: 15000,
      topology: "quad"
    },
    vecna: {
      prompt: "Vecna from Stranger Things season 4, humanoid villain with burned scarred skin, vines integrated into body, menacing pose, detailed face, evil appearance, game-ready model, PBR textures",
      style: "realistic",
      artStyle: "horror",
      targetPolycount: 20000,
      topology: "quad"
    }
  },
  environment: {
    upsideDownVine: {
      prompt: "Upside Down vine tendril from Stranger Things, organic creeping plant, dark reddish brown color, slimy texture, twisted shape, game environment asset, tileable",
      style: "realistic",
      artStyle: "horror",
      targetPolycount: 5000,
      topology: "quad"
    },
    creelHouseDebris: {
      prompt: "Destroyed house debris, broken wooden planks, shattered window frame, old Victorian style, weathered texture, game environment prop",
      style: "realistic",
      artStyle: "realistic",
      targetPolycount: 8000,
      topology: "quad"
    },
    portal: {
      prompt: "Upside Down portal gate, organic membrane-like surface, glowing red edges, pulsating texture, circular opening, Stranger Things style, game-ready effect",
      style: "realistic",
      artStyle: "scifi",
      targetPolycount: 6000,
      topology: "quad"
    }
  },
  weapons: {
    energyGun: {
      prompt: "Futuristic energy pistol weapon, sci-fi design, glowing cyan accents, sleek metallic body, game FPS weapon model, first person view optimized",
      style: "realistic",
      artStyle: "scifi",
      targetPolycount: 8000,
      topology: "quad"
    },
    nailBat: {
      prompt: "Baseball bat with nails hammered through it, Steve Harrington weapon from Stranger Things, worn wood texture, rusty metal nails, game melee weapon",
      style: "realistic",
      artStyle: "realistic",
      targetPolycount: 5000,
      topology: "quad"
    }
  }
};

interface MeshyTaskResponse {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED';
  model_url?: string;
  thumbnail_url?: string;
  progress?: number;
}

/**
 * Create a text-to-3D generation task
 */
async function createMeshyTask(prompt: string, options: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      mode: 'preview', // or 'refine' for higher quality
      prompt: prompt,
      art_style: options.artStyle || 'realistic',
      negative_prompt: 'low quality, blurry, distorted, deformed',
      target_polycount: options.targetPolycount || 10000,
      topology: options.topology || 'quad'
    });

    const requestOptions = {
      hostname: 'api.meshy.ai',
      path: '/v2/text-to-3d',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MESHY_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(requestOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (response.id) {
            console.log(`✓ Task created: ${response.id} for "${prompt.substring(0, 50)}..."`);
            resolve(response.id);
          } else {
            reject(new Error(`Failed to create task: ${body}`));
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Check task status and get model URL when complete
 */
async function checkTaskStatus(taskId: string): Promise<MeshyTaskResponse> {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      hostname: 'api.meshy.ai',
      path: `/v2/text-to-3d/${taskId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MESHY_API_KEY}`
      }
    };

    const req = https.request(requestOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve(response);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Download model file from URL
 */
async function downloadModel(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);

    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded: ${outputPath}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => reject(err));
    });
  });
}

/**
 * Wait for task completion with polling
 */
async function waitForCompletion(taskId: string, maxAttempts = 60): Promise<MeshyTaskResponse> {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await checkTaskStatus(taskId);

    console.log(`  Status: ${status.status}${status.progress ? ` (${status.progress}%)` : ''}`);

    if (status.status === 'SUCCEEDED') {
      return status;
    } else if (status.status === 'FAILED') {
      throw new Error('Task failed');
    }

    // Wait 10 seconds before next check
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  throw new Error('Task timeout');
}

/**
 * Generate all assets
 */
async function generateAllAssets() {
  console.log('🎮 STRANGER THINGS GAME - MESHY AI ASSET GENERATOR\n');

  if (!MESHY_API_KEY) {
    console.error('❌ Error: MESHY_API_KEY environment variable not set');
    console.log('\nTo use this script:');
    console.log('1. Get your API key from https://meshy.ai');
    console.log('2. Set environment variable: export MESHY_API_KEY="your-key-here"');
    console.log('3. Run: npm run generate-assets\n');
    process.exit(1);
  }

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const tasks: { name: string; category: string; taskId: string }[] = [];

  // Create all generation tasks
  console.log('📤 Creating generation tasks...\n');

  for (const [category, assets] of Object.entries(ASSET_PROMPTS)) {
    for (const [name, config] of Object.entries(assets)) {
      try {
        const taskId = await createMeshyTask(config.prompt, config);
        tasks.push({ name, category, taskId });
      } catch (err) {
        console.error(`❌ Failed to create task for ${name}:`, err);
      }
    }
  }

  console.log(`\n✓ Created ${tasks.length} tasks\n`);
  console.log('⏳ Waiting for completions (this may take several minutes)...\n');

  // Wait for all tasks to complete
  const results: { name: string; category: string; url: string }[] = [];

  for (const task of tasks) {
    console.log(`\n🔄 Processing: ${task.category}/${task.name}`);
    try {
      const result = await waitForCompletion(task.taskId);
      if (result.model_url) {
        results.push({
          name: task.name,
          category: task.category,
          url: result.model_url
        });
        console.log(`✓ Complete: ${task.name}`);
      }
    } catch (err) {
      console.error(`❌ Failed: ${task.name}`, err);
    }
  }

  // Download all models
  console.log('\n📥 Downloading models...\n');

  for (const result of results) {
    const categoryDir = path.join(OUTPUT_DIR, result.category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    const outputPath = path.join(categoryDir, `${result.name}.glb`);
    try {
      await downloadModel(result.url, outputPath);
    } catch (err) {
      console.error(`❌ Failed to download ${result.name}:`, err);
    }
  }

  console.log('\n✅ Asset generation complete!\n');
  console.log(`Models saved to: ${OUTPUT_DIR}`);
  console.log('\nNext steps:');
  console.log('1. Review models in Blender or Three.js viewer');
  console.log('2. Update game components to use new models');
  console.log('3. Adjust scale/rotation as needed\n');
}

// Main execution
if (require.main === module) {
  generateAllAssets().catch(err => {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
  });
}

export { generateAllAssets, createMeshyTask, checkTaskStatus, downloadModel };
