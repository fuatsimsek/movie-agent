// ─────────────────────────────────────────────────────────────────────────────
// Movie Agent — Tweaks Configuration
// Uses TweaksPanel, useTweaks from tweaks-panel.jsx
// ─────────────────────────────────────────────────────────────────────────────

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentPreset": "amber",
  "bgTone":       "dark",
  "fontStyle":    "modern",
  "animSpeed":    "normal",
  "showDevNotes": false
}/*EDITMODE-END*/;

const ACCENT_PRESETS = {
  amber:   { accent: '#C8871A', accentLt: '#E4A840', accentText: '#DEAB52', accentMute: 'rgba(200,135,26,0.10)', accentGlow: 'rgba(200,135,26,0.22)' },
  teal:    { accent: '#20A080', accentLt: '#38C49A', accentText: '#5CDBB8', accentMute: 'rgba(32,160,128,0.10)', accentGlow: 'rgba(32,160,128,0.20)' },
  crimson: { accent: '#C83838', accentLt: '#E05050', accentText: '#F07070', accentMute: 'rgba(200,56,56,0.10)',  accentGlow: 'rgba(200,56,56,0.20)'  },
  violet:  { accent: '#8050D0', accentLt: '#9C6EE8', accentText: '#B896FF', accentMute: 'rgba(128,80,208,0.10)', accentGlow: 'rgba(128,80,208,0.20)' },
};

const BG_PRESETS = {
  dark:  { base: '#07070F', surface: '#0C0C1B', elevated: '#111127', overlay: '#181834' },
  warm:  { base: '#0C0A07', surface: '#161210', elevated: '#1C1814', overlay: '#221E18' },
  cool:  { base: '#070B12', surface: '#0C1020', elevated: '#111828', overlay: '#162030' },
};

const FONT_PRESETS = {
  modern:    { display: "'Syne', sans-serif",        body: "'Space Grotesk', sans-serif"   },
  editorial: { display: "'Playfair Display', serif",  body: "'DM Sans', sans-serif"         },
};

const SPEED_PRESETS = {
  fast:   { fast: '70ms',   base: '120ms', slow: '200ms', slower: '320ms' },
  normal: { fast: '120ms',  base: '200ms', slow: '350ms', slower: '560ms' },
  slow:   { fast: '200ms',  base: '340ms', slow: '580ms', slower: '900ms' },
};

function applyTweaks(t) {
  const r = document.documentElement.style;
  const a = ACCENT_PRESETS[t.accentPreset] || ACCENT_PRESETS.amber;
  const b = BG_PRESETS[t.bgTone] || BG_PRESETS.dark;
  const f = FONT_PRESETS[t.fontStyle] || FONT_PRESETS.modern;
  const s = SPEED_PRESETS[t.animSpeed] || SPEED_PRESETS.normal;

  // Accent
  r.setProperty('--accent',      a.accent);
  r.setProperty('--accent-lt',   a.accentLt);
  r.setProperty('--accent-text', a.accentText);
  r.setProperty('--accent-mute', a.accentMute);
  r.setProperty('--accent-glow', a.accentGlow);
  r.setProperty('--bdr-focus',   a.accent + 'AA');

  // Background
  r.setProperty('--bg-base',     b.base);
  r.setProperty('--bg-surface',  b.surface);
  r.setProperty('--bg-elevated', b.elevated);
  r.setProperty('--bg-overlay',  b.overlay);

  // Fonts
  r.setProperty('--ff-display', f.display);
  r.setProperty('--ff-body',    f.body);

  // Speed
  r.setProperty('--d-fast',   s.fast);
  r.setProperty('--d-base',   s.base);
  r.setProperty('--d-slow',   s.slow);
  r.setProperty('--d-slower', s.slower);

  // Google Fonts injection for editorial
  if (t.fontStyle === 'editorial') {
    const id = 'tweak-fonts';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id; link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap';
      document.head.appendChild(link);
    }
  }
}

function MovieAgentTweaks() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  React.useEffect(() => applyTweaks(tweaks), [tweaks]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Accent">
        <TweakRadio
          id="accentPreset" label="Renk"
          value={tweaks.accentPreset}
          onChange={v => setTweak('accentPreset', v)}
          options={[
            { label: 'Amber',   value: 'amber'   },
            { label: 'Teal',    value: 'teal'    },
            { label: 'Crimson', value: 'crimson' },
            { label: 'Violet',  value: 'violet'  },
          ]}
        />
      </TweakSection>

      <TweakSection label="Zemin">
        <TweakRadio
          id="bgTone" label="Ton"
          value={tweaks.bgTone}
          onChange={v => setTweak('bgTone', v)}
          options={[
            { label: 'Siyah', value: 'dark' },
            { label: 'Sıcak', value: 'warm' },
            { label: 'Soğuk', value: 'cool' },
          ]}
        />
      </TweakSection>

      <TweakSection label="Tipografi">
        <TweakRadio
          id="fontStyle" label="Stil"
          value={tweaks.fontStyle}
          onChange={v => setTweak('fontStyle', v)}
          options={[
            { label: 'Modern',    value: 'modern'    },
            { label: 'Editorial', value: 'editorial' },
          ]}
        />
      </TweakSection>

      <TweakSection label="Animasyon">
        <TweakRadio
          id="animSpeed" label="Hız"
          value={tweaks.animSpeed}
          onChange={v => setTweak('animSpeed', v)}
          options={[
            { label: 'Hızlı',  value: 'fast'   },
            { label: 'Normal', value: 'normal' },
            { label: 'Yavaş',  value: 'slow'   },
          ]}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

Object.assign(window, { MovieAgentTweaks, applyTweaks, TWEAK_DEFAULTS });
