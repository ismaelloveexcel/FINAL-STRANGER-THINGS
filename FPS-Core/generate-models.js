/**
 * Standalone Meshy Model Generator
 * Run with: node generate-models.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const MESHY_API_KEY = 'msy_TgknSgucpW7n9PSmXXjCvEktvsqEEHCl1U2Y';
const OUTPUT_DIR = path.join(__dirname, 'public', 'models');

// Asset definitions
const ASSETS = {
  'enemies/demogorgon': {
    prompt: "Demogorgon monster from Stranger Things, terrifying humanoid creature with petal-like head opening to reveal teeth, pale skin, long arms, menacing pose, game-ready low poly model, PBR textures",
    artStyle: 'realistic',
    targetPolycount: 10000
  },
  'enemies/mindFlayer': {
    prompt: "Mind Flayer shadow monster from Stranger Things, massive dark tentacled creature, spider-like legs, shadowy ethereal appearance, ominous presence, game-ready low poly model, dark materials",
    artStyle: 'realistic',
    targetPolycount: 15000
  },
  'enemies/vecna': {
    prompt: "Vecna from Stranger Things season 4, humanoid villain with burned scarred skin, vines integrated into body, menacing pose, detailed face, evil appearance, game-ready model, PBR textures",
    artStyle: 'realistic',
    targetPolycount: 20000
  },
  'environment/upsideDownVine': {
    prompt: "Upside Down vine tendril from Stranger Things, organic creeping plant, dark reddish brown color, slimy texture, twisted shape, game environment asset",
    artStyle: 'realistic',
    targetPolycount: 5000
  },
  'environment/creelHouseDebris': {
    prompt: "Destroyed house debris, broken wooden planks, shattered window frame, old Victorian style, weathered texture, game environment prop",
    artStyle: 'realistic',
    targetPolycount: 8000
  },
  'weapons/energyGun': {
    prompt: "Futuristic energy pistol weapon, sci-fi design, glowing cyan accents, sleek metallic body, game FPS weapon model, first person view optimized",
    artStyle: 'scifi',
    targetPolycount: 8000
  }
};

console.log('🎮 STRANGER THINGS - MESHY ASSET GENERATOR\n');

// Create output directories
Object.keys(ASSETS).forEach(assetPath => {
  const dir = path.join(OUTPUT_DIR, path.dirname(assetPath));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Create task
function createTask(prompt, options) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      mode: 'preview',
      prompt: prompt,
      art_style: options.artStyle || 'realistic',
      negative_prompt: 'low quality, blurry, distorted, deformed',
      target_polycount: options.targetPolycount || 10000,
      topology: 'quad'
    });

    const req = https.request({
      hostname: 'api.meshy.ai',
      path: '/v2/text-to-3d',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MESHY_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
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
    req.write(data);
    req.end();
  });
}

// Check task status
function checkStatus(taskId) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.meshy.ai',
      path: `/v2/text-to-3d/${taskId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MESHY_API_KEY}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Download file
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

// Wait for completion
async function waitForCompletion(taskId, name) {
  for (let i = 0; i < 120; i++) {
    const status = await checkStatus(taskId);

    const progress = status.progress ? ` (${status.progress}%)` : '';
    process.stdout.write(`\r  ${name}: ${status.status}${progress}     `);

    if (status.status === 'SUCCEEDED') {
      console.log('');
      return status;
    } else if (status.status === 'FAILED') {
      console.log(' - FAILED');
      throw new Error('Generation failed');
    }

    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s
  }
  throw new Error('Timeout');
}

// Main execution
(async () => {
  try {
    console.log('📤 Creating generation tasks...\n');

    const tasks = [];
    for (const [assetPath, config] of Object.entries(ASSETS)) {
      console.log(`Creating: ${assetPath}`);
      const response = await createTask(config.prompt, config);

      if (response.id) {
        tasks.push({ name: assetPath, taskId: response.id });
        console.log(`  ✓ Task ID: ${response.id}`);
      } else {
        console.log(`  ✗ Failed: ${response.message || 'Unknown error'}`);
      }
    }

    console.log(`\n✓ Created ${tasks.length} tasks`);
    console.log('\n⏳ Waiting for completions...\n');

    // Wait for all tasks
    for (const task of tasks) {
      try {
        const result = await waitForCompletion(task.taskId, task.name);

        if (result.model_urls && result.model_urls.glb) {
          const outputPath = path.join(OUTPUT_DIR, `${task.name}.glb`);
          console.log(`  Downloading to: ${outputPath}`);
          await downloadFile(result.model_urls.glb, outputPath);
          console.log(`  ✓ Downloaded!\n`);
        }
      } catch (err) {
        console.log(`  ✗ Error: ${err.message}\n`);
      }
    }

    console.log('\n✅ Generation complete!');
    console.log(`\nModels saved to: ${OUTPUT_DIR}`);
    console.log('\nNext steps:');
    console.log('1. Check the models in the public/models/ directory');
    console.log('2. Replace Enemy component with EnemyEnhanced');
    console.log('3. Restart your dev server\n');

  } catch (err) {
    console.error('\n❌ Fatal error:', err.message);
    process.exit(1);
  }
})();
