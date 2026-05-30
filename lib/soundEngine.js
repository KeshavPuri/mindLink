// ── MindLink Sound Engine ────────────────────────────────────────────

const sounds = {};
let ambientTrack = null;
let soundEnabled = true;
let musicEnabled = true;

// ── Preload all sounds ───────────────────────────────────────────────
export function initSounds() {
  if (typeof window === "undefined") return;

  const files = {
    click:  "/sounds/click.mp3",
    enter:  "/sounds/enter.mp3",
    node:   "/sounds/node.mp3",
    exit:   "/sounds/exit.mp3",
  };

  Object.entries(files).forEach(([key, src]) => {
    const audio = new Audio(src);
    audio.preload = "auto";
    sounds[key] = audio;
  });
}

// ── Play a one-shot sound ────────────────────────────────────────────
export function playSound(name) {
  if (!soundEnabled) return;
  if (typeof window === "undefined") return;

  try {
    const original = sounds[name];
    if (!original) return;
    // Clone so overlapping sounds work
    const clone = original.cloneNode();
    clone.volume = 0.5;
    clone.play().catch(() => {});
  } catch {}
}

// ── Start ambient/music loop ─────────────────────────────────────────
export function playAmbient(src = "/sounds/ambient.mp3") {
  if (typeof window === "undefined") return;

  // Already playing same track — do nothing
  if (ambientTrack && !ambientTrack.paused && ambientTrack.src.includes(src)) return;

  stopAmbient();

  ambientTrack = new Audio(src);
  ambientTrack.loop   = true;
  ambientTrack.volume = musicEnabled ? 0.15 : 0;

  if (musicEnabled) {
    ambientTrack.play().catch(() => {});
  }
}

// ── Stop ambient ─────────────────────────────────────────────────────
export function stopAmbient() {
  if (ambientTrack) {
    ambientTrack.pause();
    ambientTrack.currentTime = 0;
    ambientTrack = null;
  }
}

// ── Fade ambient volume smoothly ─────────────────────────────────────
function fadeVolume(audio, targetVol, duration = 1000) {
  if (!audio) return;
  const steps     = 30;
  const interval  = duration / steps;
  const startVol  = audio.volume;
  const diff      = targetVol - startVol;
  let step        = 0;

  const timer = setInterval(() => {
    step++;
    audio.volume = Math.max(0, Math.min(1, startVol + (diff * step) / steps));
    if (step >= steps) clearInterval(timer);
  }, interval);
}

// ── Toggle sound effects ─────────────────────────────────────────────
export function setSoundEnabled(val) {
  soundEnabled = val;
  if (typeof window !== "undefined") {
    localStorage.setItem("ml_sound", val ? "1" : "0");
  }
}

// ── Toggle music ─────────────────────────────────────────────────────
export function setMusicEnabled(val) {
  musicEnabled = val;
  if (typeof window !== "undefined") {
    localStorage.setItem("ml_music", val ? "1" : "0");
  }
  if (ambientTrack) {
    if (val) {
      ambientTrack.volume = 0;
      ambientTrack.play().catch(() => {});
      fadeVolume(ambientTrack, 0.15, 1500);
    } else {
      fadeVolume(ambientTrack, 0, 800);
      setTimeout(() => {
        if (ambientTrack) ambientTrack.pause();
      }, 800);
    }
  }
}

// ── Get current state ────────────────────────────────────────────────
export function getSoundEnabled() { return soundEnabled; }
export function getMusicEnabled() { return musicEnabled; }

// ── Load saved preferences ───────────────────────────────────────────
export function loadPreferences() {
  if (typeof window === "undefined") return;
  const s = localStorage.getItem("ml_sound");
  const m = localStorage.getItem("ml_music");
  if (s !== null) soundEnabled = s === "1";
  if (m !== null) musicEnabled = m === "1";
}