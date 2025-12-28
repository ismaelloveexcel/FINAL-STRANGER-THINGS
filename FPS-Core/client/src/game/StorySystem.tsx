/**
 * Story System - Narrative and dialogue
 *
 * Provides:
 * - Level introductions
 * - Mid-level hints
 * - Victory narr

atives
 * - Character dialogue
 */

export const STORY_TEXT = {
  intro: {
    title: "HAWKINS, INDIANA - 1986",
    text: [
      "The gate to the Upside Down has reopened...",
      "Strange creatures are pouring through.",
      "You're humanity's last line of defense.",
      "",
      "Good luck, and don't let them reach Hawkins."
    ]
  },

  level1: {
    intro: {
      title: "LEVEL 1: THE UPSIDE DOWN",
      threat: "DEMOGORGON",
      text: [
        "The Demogorgons have breached containment.",
        "These predators hunt by sound and smell.",
        "They're fast, aggressive, and deadly.",
        "",
        "Eliminate 15 creatures to seal this sector."
      ],
      tip: "💡 TIP: Aim for the head when their faces open!"
    },
    progress: {
      halfway: "Dustin (Radio): 'You're doing great! Keep it up!'",
      almostDone: "Steve (Radio): 'Just a few more! You've got this!'"
    },
    victory: {
      title: "SECTOR CLEARED",
      text: [
        "The immediate threat is neutralized.",
        "But something darker stirs in the shadows...",
        "",
        "The Mind Flayer is coming."
      ]
    }
  },

  level2: {
    intro: {
      title: "LEVEL 2: THE SHADOW",
      threat: "MIND FLAYER'S ARMY",
      text: [
        "The Mind Flayer has sent its shadow creatures.",
        "They move as one - a hive mind of pure malevolence.",
        "Coordinated. Relentless. Unstoppable.",
        "",
        "Destroy 25 shadow minions to weaken its hold."
      ],
      tip: "💡 TIP: Watch for their coordinated attacks!"
    },
    progress: {
      halfway: "Joyce (Radio): 'The storm is getting worse! Stay focused!'",
      almostDone: "Hopper (Radio): 'Almost there! Don't give up now!'"
    },
    victory: {
      title: "MIND FLAYER WEAKENED",
      text: [
        "The shadow army has been decimated.",
        "But the Mind Flayer was just a distraction...",
        "",
        "Vecna has been waiting. Planning. Growing stronger.",
        "The final battle begins now."
      ]
    }
  },

  level3: {
    intro: {
      title: "LEVEL 3: THE CREEL HOUSE",
      threat: "VECNA",
      text: [
        "Victor Creel's cursed mansion stands before you.",
        "Inside waits Vecna - the source of all this horror.",
        "He's powerful beyond measure.",
        "His curse has claimed countless victims.",
        "",
        "This ends now. One way or another."
      ],
      tip: "💡 TIP: Vecna is STRONG. This will take everything you've got!"
    },
    progress: {
      phase1: "Eleven (Radio): 'I can feel his presence... He's watching you!'",
      phase2: "Nancy (Radio): 'Keep shooting! You're hurting him!'",
      phase3: "Mike (Radio): 'He's weakening! Don't stop now!'"
    },
    victory: {
      title: "HAWKINS SAVED",
      text: [
        "Vecna's reign of terror is over.",
        "The gate is sealed.",
        "The Upside Down retreats into darkness.",
        "",
        "Hawkins is safe... for now.",
        "",
        "The Party thanks you for your service.",
        "- Eleven, Mike, Dustin, Lucas, Max, Steve, Nancy, and the rest"
      ]
    }
  },

  death: {
    demogorgon: [
      "The Demogorgon's claws found their mark.",
      "You fought bravely, but the Upside Down claims another victim."
    ],
    mindFlayer: [
      "The shadow consumed you.",
      "The Mind Flayer's power was too great."
    ],
    vecna: [
      "Vecna's curse took hold.",
      "You saw your darkest memories... and couldn't escape.",
      "",
      "But you went down fighting."
    ]
  },

  hints: [
    "Dustin: 'Remember, headshots do more damage!'",
    "Steve: 'Keep moving! Don't let them surround you!'",
    "Nancy: 'Conserve your shots. Make each one count.'",
    "Hopper: 'Stay focused. One target at a time.'",
    "Joyce: 'You're doing great! Don't give up!'",
    "Eleven: 'I believe in you. You can do this.'",
    "Max: 'Running UP that hill... I mean, keep running!'",
    "Lucas: 'Think like a ranger. Strategy over brute force.'"
  ]
};

export function getRandomHint(): string {
  return STORY_TEXT.hints[Math.floor(Math.random() * STORY_TEXT.hints.length)];
}

export function getLevelStory(level: number, section: 'intro' | 'victory') {
  switch (level) {
    case 1:
      return STORY_TEXT.level1[section];
    case 2:
      return STORY_TEXT.level2[section];
    case 3:
      return STORY_TEXT.level3[section];
    default:
      return STORY_TEXT.level1[section];
  }
}

export function getProgressDialogue(level: number, killCount: number, required: number) {
  const progress = killCount / required;

  if (level === 1) {
    if (progress >= 0.9) return STORY_TEXT.level1.progress.almostDone;
    if (progress >= 0.5) return STORY_TEXT.level1.progress.halfway;
  } else if (level === 2) {
    if (progress >= 0.9) return STORY_TEXT.level2.progress.almostDone;
    if (progress >= 0.5) return STORY_TEXT.level2.progress.halfway;
  } else if (level === 3) {
    if (progress >= 0.8) return STORY_TEXT.level3.progress.phase3;
    if (progress >= 0.5) return STORY_TEXT.level3.progress.phase2;
    if (progress >= 0.2) return STORY_TEXT.level3.progress.phase1;
  }

  return null;
}
