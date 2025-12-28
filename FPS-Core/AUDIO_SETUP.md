# 🎵 HOW TO ADD YOUR "TURN AROUND" SONG

## Quick Setup Guide

Your game is now configured to play "Turn Around" during the dedication screen. You just need to add the audio file!

---

## 📁 FILE LOCATION

The game expects the audio file at:
```
FPS-Core/client/public/music/turn-around.mp3
```

---

## 🚀 SETUP STEPS

### Option 1: Add to Local Project (Recommended)

1. **Create the music folder:**
   ```bash
   mkdir -p FPS-Core/client/public/music
   ```

2. **Copy your turn-around song:**
   - Find your `turn-around.mp3` file
   - Copy it to: `FPS-Core/client/public/music/turn-around.mp3`

3. **That's it!** The game will automatically play it during the dedication screen.

---

### Option 2: Add to Replit (When Deployed)

1. **Open your Replit project**

2. **In the Files panel, navigate to:**
   ```
   FPS-Core/client/public/
   ```

3. **Create a new folder:**
   - Click the "+" button
   - Select "Create folder"
   - Name it: `music`

4. **Upload your audio file:**
   - Click on the `music` folder
   - Click the "Upload file" button (or drag and drop)
   - Upload your `turn-around.mp3` file

5. **Verify the path:**
   ```
   FPS-Core/client/public/music/turn-around.mp3
   ```

6. **Refresh the game** - The song will now play!

---

## 🎼 SUPPORTED AUDIO FORMATS

The game supports these formats:
- ✅ **MP3** (recommended - best compatibility)
- ✅ **WAV** (high quality, larger file size)
- ✅ **OGG** (good compression)
- ✅ **M4A** (Apple format)

**If you have a different format**, rename the file extension or use the code below.

---

## 🔧 IF YOUR FILE HAS A DIFFERENT NAME

If your audio file is named differently (e.g., `my-song.mp3`, `turn_around.wav`), you have two options:

### Option A: Rename Your File (Easiest)
Just rename your file to: `turn-around.mp3`

### Option B: Update the Code
Edit `client/src/game/IntroSequence.tsx` line 27:

**Change from:**
```typescript
const audio = new Audio('/music/turn-around.mp3');
```

**To (example):**
```typescript
const audio = new Audio('/music/my-song.mp3');  // Your filename here
```

---

## 🎮 HOW IT WORKS

### When the Song Plays:
1. ✅ User starts the game
2. ✅ Dedication screen appears
3. ✅ "Turn Around" starts playing automatically
4. ✅ Song shows: "🎵 Now playing: Turn Around 🎵"

### When the Song Stops:
1. ✅ User clicks "CONTINUE TO ADVENTURE"
2. ✅ Music stops immediately
3. ✅ Story screen appears (no music)
4. ✅ User continues to gameplay

**The song ONLY plays during the dedication screen!**

---

## 🔊 VOLUME CONTROL

The default volume is set to 50%. To change it:

Edit `client/src/game/IntroSequence.tsx` line 28:

```typescript
audio.volume = 0.5;  // Change this (0.0 = silent, 1.0 = max)
```

**Examples:**
- `audio.volume = 0.3;` - 30% volume (quieter)
- `audio.volume = 0.7;` - 70% volume (louder)
- `audio.volume = 1.0;` - 100% volume (maximum)

---

## 🛠️ TROUBLESHOOTING

### Problem: No sound plays

**Check 1:** File path is correct
```
FPS-Core/client/public/music/turn-around.mp3
```

**Check 2:** Browser console (F12 → Console tab)
Look for errors like:
- `Failed to load resource` - File not found
- `Audio autoplay blocked` - Normal, click the button to start

**Check 3:** File format
- Make sure it's a valid audio file
- Try converting to MP3 if it's a different format

### Problem: Song plays during story/gameplay

This shouldn't happen! The code stops the music when you click continue.

If it does, check `client/src/game/IntroSequence.tsx` line 50-56 is correct:
```typescript
if (step === 'dedication') {
  // STOP MUSIC when leaving dedication screen
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }
  setStep('story');
}
```

### Problem: Song doesn't loop

This is intentional! The song plays once during the dedication.

To make it loop, edit `client/src/game/IntroSequence.tsx` line 29:
```typescript
audio.loop = true;  // Change false to true
```

---

## 📊 CURRENT CONFIGURATION

```typescript
File Location: /music/turn-around.mp3
Volume: 50% (0.5)
Loop: No (plays once)
Autoplay: Yes (during dedication only)
Stop Trigger: "CONTINUE TO ADVENTURE" button
```

---

## ✅ VERIFICATION CHECKLIST

After adding the file, verify:

- [ ] File exists at `FPS-Core/client/public/music/turn-around.mp3`
- [ ] Start the game
- [ ] Dedication screen shows
- [ ] Music plays automatically (or after clicking if blocked)
- [ ] Text shows: "🎵 Now playing: Turn Around 🎵"
- [ ] Click "CONTINUE TO ADVENTURE"
- [ ] Music stops
- [ ] Story screen is silent

---

## 🎉 ALL SET!

Once you add the audio file, the dedication will play beautifully with music!

**Features:**
- ✅ Song plays only during dedication
- ✅ "From Ismael" dedication message
- ✅ Stranger Things red/orange theme
- ✅ Mobile-friendly design
- ✅ Auto-stops when continuing

**Perfect for a heartfelt tribute to Awesome Aidan!** 💫

---

*Need help? Check the browser console (F12) for error messages.*
