# 🎵 HOW TO ADD "TURN AROUND" MUSIC

## Quick Setup (3 steps)

### Step 1: Get the Song
Download "Turn Around" as an MP3 file. You can:
- Use a YouTube to MP3 converter
- Purchase from iTunes/Amazon
- Use any legal music source

### Step 2: Add to Project
1. Create the music folder:
   ```bash
   mkdir public/music
   ```

2. Copy your MP3 file:
   - Rename it to: `turn-around.mp3`
   - Place it in: `public/music/turn-around.mp3`

### Step 3: Done!
The game will automatically play the song during the intro sequence!

---

## Alternative: Use a Different Song

If you want to use a different song or don't have "Turn Around":

1. **Use any MP3 file**:
   - Just name it `turn-around.mp3`
   - Put in `public/music/`

2. **Or disable music temporarily**:
   - The intro will still show without music
   - No errors will appear

---

## File Structure

Your project should look like this:
```
FPS-Core/
├── public/
│   ├── music/
│   │   └── turn-around.mp3  ← Add this file
│   └── models/
│       ├── enemies/
│       └── environment/
├── client/
└── ...
```

---

## Testing

1. Run the game: `npm run dev`
2. The intro sequence will:
   - Show "DEDICATED TO AWESOME AIDAN" message
   - Play the song automatically
   - Transition to story
   - Then start game

3. If music doesn't play:
   - Check browser console (F12)
   - Some browsers block autoplay
   - Click anywhere on the screen to enable audio

---

## Volume Control

To adjust volume, edit `IntroSequence.tsx`:
```typescript
audio.volume = 0.5;  // Change from 0.0 (silent) to 1.0 (max)
```

---

## Note About Mobile

- Music autoplay might be blocked on mobile browsers
- Users will need to interact with screen first
- This is a browser security feature
- The intro will still show perfectly!

---

That's it! Enjoy your personalized game intro! 🎮🎵
