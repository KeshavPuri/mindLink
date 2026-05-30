"use client";

import { useState, useEffect } from "react";
import {
  setSoundEnabled,
  setMusicEnabled,
  getSoundEnabled,
  getMusicEnabled,
  loadPreferences,
  playSound,
} from "@/lib/soundEngine";

export default function SoundControls() {
  const [sound, setSound] = useState(true);
  const [music, setMusic] = useState(true);

  useEffect(() => {
    loadPreferences();
    setSound(getSoundEnabled());
    setMusic(getMusicEnabled());
  }, []);

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    setSoundEnabled(next);
    if (next) playSound("click");
  };

  const toggleMusic = () => {
    const next = !music;
    setMusic(next);
    setMusicEnabled(next);
    playSound("click");
  };

  return (
    <div className="flex items-center gap-1.5">

      {/* Sound effects button */}
      <button
        onClick={toggleSound}
        title={sound ? "Mute sound effects" : "Enable sound effects"}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] tracking-[0.2em] uppercase transition-all duration-300 ${
          sound
            ? "border-white/20 text-slate-300 bg-white/5 hover:bg-white/10"
            : "border-white/10 text-slate-600 bg-transparent hover:border-white/15"
        }`}
      >
        {/* Sound icon */}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {sound ? (
            <>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </>
          ) : (
            <>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </>
          )}
        </svg>
        SFX
      </button>

      {/* Music button */}
      <button
        onClick={toggleMusic}
        title={music ? "Mute music" : "Enable music"}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] tracking-[0.2em] uppercase transition-all duration-300 ${
          music
            ? "border-white/20 text-slate-300 bg-white/5 hover:bg-white/10"
            : "border-white/10 text-slate-600 bg-transparent hover:border-white/15"
        }`}
      >
        {/* Music icon */}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
          {!music && <line x1="2" y1="2" x2="22" y2="22" />}
        </svg>
        MUSIC
      </button>

    </div>
  );
}