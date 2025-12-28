#!/usr/bin/env python3
"""
Stranger Things Asset Generator - Python Script
Works without Node.js - just needs Python
"""

import requests
import time
import json
import os
from pathlib import Path

API_KEY = 'msy_TgknSgucpW7n9PSmXXjCvEktvsqEEHCl1U2Y'
API_URL = 'https://api.meshy.ai/v2/text-to-3d'
OUTPUT_DIR = Path(__file__).parent / 'public' / 'models'

ASSETS = {
    'enemies/demogorgon': {
        'prompt': "Demogorgon monster from Stranger Things, terrifying humanoid creature with petal-like head opening to reveal teeth, pale skin, long arms, menacing pose, game-ready low poly model, PBR textures",
        'artStyle': 'realistic',
        'targetPolycount': 10000
    },
    'enemies/mindFlayer': {
        'prompt': "Mind Flayer shadow monster from Stranger Things, massive dark tentacled creature, spider-like legs, shadowy ethereal appearance, ominous presence, game-ready low poly model, dark materials",
        'artStyle': 'realistic',
        'targetPolycount': 15000
    },
    'enemies/vecna': {
        'prompt': "Vecna from Stranger Things season 4, humanoid villain with burned scarred skin, vines integrated into body, menacing pose, detailed face, evil appearance, game-ready model, PBR textures",
        'artStyle': 'realistic',
        'targetPolycount': 20000
    },
    'environment/upsideDownVine': {
        'prompt': "Upside Down vine tendril from Stranger Things, organic creeping plant, dark reddish brown color, slimy texture, twisted shape, game environment asset",
        'artStyle': 'realistic',
        'targetPolycount': 5000
    },
    'environment/creelHouseDebris': {
        'prompt': "Destroyed house debris, broken wooden planks, shattered window frame, old Victorian style, weathered texture, game environment prop",
        'artStyle': 'realistic',
        'targetPolycount': 8000
    },
    'weapons/energyGun': {
        'prompt': "Futuristic energy pistol weapon, sci-fi design, glowing cyan accents, sleek metallic body, game FPS weapon model, first person view optimized",
        'artStyle': 'scifi',
        'targetPolycount': 8000
    }
}

def create_task(prompt, options):
    """Create a text-to-3D generation task"""
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }

    data = {
        'mode': 'preview',
        'prompt': prompt,
        'art_style': options.get('artStyle', 'realistic'),
        'negative_prompt': 'low quality, blurry, distorted, deformed',
        'target_polycount': options.get('targetPolycount', 10000),
        'topology': 'quad'
    }

    response = requests.post(API_URL, headers=headers, json=data)
    return response.json()

def check_status(task_id):
    """Check task status"""
    headers = {
        'Authorization': f'Bearer {API_KEY}'
    }

    response = requests.get(f'{API_URL}/{task_id}', headers=headers)
    return response.json()

def download_file(url, output_path):
    """Download model file"""
    response = requests.get(url, stream=True)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)

def wait_for_completion(task_id, name, max_attempts=120):
    """Wait for task to complete"""
    print(f"\n⏳ Waiting for {name} to complete...")

    for i in range(max_attempts):
        time.sleep(10)  # Wait 10 seconds

        status = check_status(task_id)
        progress = status.get('progress', '')
        current_status = status.get('status', 'UNKNOWN')

        print(f"  {name}: {current_status} {progress}", end='\r')

        if current_status == 'SUCCEEDED':
            print(f"\n✓ {name} completed!")
            return status
        elif current_status == 'FAILED':
            print(f"\n✗ {name} failed")
            return None

    print(f"\n✗ {name} timed out")
    return None

def main():
    print("="*50)
    print("🎮 STRANGER THINGS - MESHY ASSET GENERATOR")
    print("="*50)
    print()

    # Create output directories
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    tasks = []

    # Create all tasks
    print("📤 Creating generation tasks...\n")

    for asset_path, config in ASSETS.items():
        print(f"Creating: {asset_path}")
        try:
            response = create_task(config['prompt'], config)

            if 'id' in response:
                tasks.append({
                    'name': asset_path,
                    'task_id': response['id']
                })
                print(f"  ✓ Task ID: {response['id']}")
            else:
                print(f"  ✗ Failed: {response.get('message', 'Unknown error')}")
        except Exception as e:
            print(f"  ✗ Error: {str(e)}")

    print(f"\n✓ Created {len(tasks)} tasks")
    print("\n⏳ Waiting for completions (this may take 30-60 minutes)...\n")

    # Wait for all tasks
    completed = []
    for task in tasks:
        try:
            result = wait_for_completion(task['task_id'], task['name'])
            if result and 'model_urls' in result and 'glb' in result['model_urls']:
                completed.append({
                    'name': task['name'],
                    'url': result['model_urls']['glb']
                })
        except Exception as e:
            print(f"\n✗ Error processing {task['name']}: {str(e)}")

    # Download all models
    print("\n\n📥 Downloading models...\n")

    for model in completed:
        output_path = OUTPUT_DIR / f"{model['name']}.glb"
        print(f"Downloading: {model['name']}")
        try:
            download_file(model['url'], output_path)
            print(f"  ✓ Saved to: {output_path}")
        except Exception as e:
            print(f"  ✗ Error: {str(e)}")

    print("\n" + "="*50)
    print("✅ GENERATION COMPLETE!")
    print("="*50)
    print(f"\nModels saved to: {OUTPUT_DIR}")
    print("\nNext steps:")
    print("1. Check the models in public/models/")
    print("2. Enable models in game")
    print("3. Run: npm run dev\n")

if __name__ == '__main__':
    main()
