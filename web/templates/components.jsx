// ─────────────────────────────────────────────────────────────────────────────
// Movie Agent — Shared Components
// All exports assigned to window at the bottom
// ─────────────────────────────────────────────────────────────────────────────

// ── Button ────────────────────────────────────────────────────────────────────
function Button({ children, variant = 'primary', size = 'md', disabled, loading, onClick, style, fullWidth, type = 'button' }) {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  const variants = {
    primary:     { bg: hover ? '#D99A28' : 'var(--accent)', color: 'var(--bg-base)', border: 'none', shadow: hover ? 'var(--sh-acc)' : 'none' },
    secondary:   { bg: hover ? 'var(--bg-hover)' : 'transparent', color: 'var(--text-1)', border: '1px solid var(--bdr-default)', shadow: 'none' },
    ghost:       { bg: hover ? 'var(--bg-hover)' : 'transparent', color: hover ? 'var(--text-1)' : 'var(--text-2)', border: 'none', shadow: 'none' },
    destructive: { bg: 'var(--error-bg)', color: 'var(--error)', border: '1px solid var(--error-bdr)', shadow: 'none' },
  };
  const sizes = {
    sm: { padding: '5px 12px', fontSize: 'var(--fs-13)', height: '28px', borderRadius: 'var(--r-sm)', gap: '5px' },
    md: { padding: '8px 18px', fontSize: 'var(--fs-14)', height: '36px', borderRadius: 'var(--r-md)', gap: '6px' },
    lg: { padding: '11px 26px', fontSize: 'var(--fs-15)', height: '44px', borderRadius: 'var(--r-md)', gap: '8px' },
    xl: { padding: '14px 34px', fontSize: 'var(--fs-16)', height: '52px', borderRadius: 'var(--r-lg)', gap: '8px' },
  };
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;
  return (
    <button
      type={type} disabled={disabled || loading} onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: s.gap, fontWeight: 500, letterSpacing: '0.01em',
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.42 : 1,
        transform: pressed ? 'scale(0.965)' : 'scale(1)',
        transition: `all var(--d-fast) var(--ease-out)`,
        width: fullWidth ? '100%' : undefined,
        backgroundColor: v.bg, color: v.color,
        border: v.border || 'none', boxShadow: v.shadow,
        ...s, ...style,
      }}
    >
      {loading ? <LoadingDots /> : children}
    </button>
  );
}

// ── LoadingDots ───────────────────────────────────────────────────────────────
function LoadingDots({ size = 4 }) {
  return (
    <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: size, height: size, borderRadius: '50%',
          background: 'currentColor', display: 'inline-block',
          animation: `dot-bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
        }} />
      ))}
    </span>
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────────
function Textarea({ placeholder, value, onChange, rows = 5, label, hint, error, maxLength, style }) {
  const [focused, setFocused] = React.useState(false);
  const chars = value ? value.length : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
      {label && (
        <label style={{ fontSize: 'var(--fs-11)', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <textarea
          value={value} rows={rows} maxLength={maxLength}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', resize: 'vertical',
            background: 'var(--bg-base)',
            border: `1px solid ${error ? 'var(--error-bdr)' : focused ? 'var(--bdr-focus)' : 'var(--bdr-default)'}`,
            borderRadius: 'var(--r-md)', color: 'var(--text-1)',
            fontSize: 'var(--fs-14)', lineHeight: 1.65,
            padding: '12px 14px',
            paddingBottom: maxLength ? '28px' : '12px',
            outline: 'none',
            boxShadow: focused ? '0 0 0 3px var(--accent-mute)' : 'none',
            transition: `border-color var(--d-base) var(--ease-out), box-shadow var(--d-base) var(--ease-out)`,
            ...style,
          }}
        />
        {maxLength && (
          <span style={{
            position: 'absolute', bottom: '9px', right: '11px',
            fontSize: 'var(--fs-11)', fontFamily: 'var(--ff-mono)',
            color: chars > maxLength * 0.85 ? 'var(--warn)' : 'var(--text-3)',
            pointerEvents: 'none',
          }}>
            {chars}/{maxLength}
          </span>
        )}
      </div>
      {(hint || error) && (
        <span style={{ fontSize: 'var(--fs-12)', color: error ? 'var(--error)' : 'var(--text-3)', lineHeight: 1.4 }}>
          {error || hint}
        </span>
      )}
    </div>
  );
}

// ── GenreChip — blur + spring stagger on mount ───────────────────────────────
function GenreChip({ label, index = 0 }) {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80 + index * 110);
    return () => clearTimeout(t);
  }, []);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: 'var(--accent-mute)', border: '1px solid var(--accent-glow)',
      color: 'var(--accent-text)', borderRadius: 'var(--r-full)',
      padding: '5px 13px', fontSize: 'var(--fs-12)', fontWeight: 500,
      fontFamily: 'var(--ff-mono)', letterSpacing: '0.02em',
      opacity: visible ? 1 : 0,
      transform: visible ? 'scale(1) translateY(0)' : 'scale(0.72) translateY(8px)',
      filter: visible ? 'blur(0px)' : 'blur(4px)',
      transition: [
        `opacity var(--d-slow) var(--ease-out)`,
        `transform var(--d-slow) var(--ease-spring)`,
        `filter var(--d-slow) var(--ease-out)`,
      ].join(', '),
    }}>
      {label}
    </span>
  );
}

// ── MoodChip — selectable ─────────────────────────────────────────────────────
const MOOD_META = {
  fun:                { label: 'Eğlenceli',      color: '#FDB940' },
  adrenaline:         { label: 'Adrenalin',      color: '#E05252' },
  emotional:          { label: 'Duygusal',       color: '#5080DC' },
  comfort:            { label: 'Rahatlatıcı',    color: '#3CB87A' },
  'thought-provoking':{ label: 'Derin / Felsefi', color: '#9060E0' },
};

function MoodChip({ mood, selected, onClick }) {
  const [hover, setHover] = React.useState(false);
  const m = MOOD_META[mood] || { label: mood, color: 'var(--accent)' };
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '7px',
        padding: '7px 14px', borderRadius: 'var(--r-full)',
        border: `1.5px solid ${selected ? m.color : hover ? 'var(--bdr-strong)' : 'var(--bdr-default)'}`,
        background: selected ? `${m.color}1A` : hover ? 'var(--bg-hover)' : 'transparent',
        color: selected ? m.color : hover ? 'var(--text-1)' : 'var(--text-2)',
        fontSize: 'var(--fs-13)', fontWeight: 500, cursor: 'pointer', outline: 'none',
        transition: `all var(--d-base) var(--ease-out)`,
        boxShadow: selected ? `0 0 16px ${m.color}28` : 'none',
      }}
    >
      <span style={{ width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0, background: selected ? m.color : 'var(--text-3)', transition: 'background var(--d-base)' }} />
      {m.label}
    </button>
  );
}

// ── MoodBadge — result display ────────────────────────────────────────────────
function MoodBadge({ mood }) {
  const m = MOOD_META[mood] || { label: mood, color: 'var(--accent)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 11px', borderRadius: 'var(--r-full)',
      background: `${m.color}18`, border: `1px solid ${m.color}40`,
      color: m.color, fontSize: 'var(--fs-12)', fontWeight: 500,
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: m.color, flexShrink: 0 }} />
      {m.label}
    </span>
  );
}

// ── Word — animated word reveal (overflow mask) ─────────────────────────────
function Word({ children, mounted, delay = 0, style }) {
  return (
    <span style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', ...style }}>
      <span style={{
        display: 'inline-block',
        transform: mounted ? 'translateY(0) skewY(0deg)' : 'translateY(115%) skewY(4deg)',
        transition: `transform 0.62s ${delay}ms var(--ease-spring)`,
      }}>
        {children}
      </span>
    </span>
  );
}

// ── MatchBadge — shockwave rings ──────────────────────────────────────────────
function MatchBadge({ match, visible }) {
  const [wave, setWave] = React.useState(false);
  React.useEffect(() => {
    if (visible) { setWave(false); const t = setTimeout(() => setWave(true), 80); return () => clearTimeout(t); }
  }, [visible]);

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {wave && [0, 1, 2].map(i => (
        <div key={i} aria-hidden="true" style={{
          position: 'absolute', inset: '-10px', borderRadius: 'var(--r-xl)',
          border: `1.5px solid ${match ? 'var(--success)' : 'var(--error)'}`,
          animation: `shockwave 0.95s ${i * 0.16}s cubic-bezier(0.15,0,0.7,1) forwards`,
          pointerEvents: 'none',
        }} />
      ))}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'inline-flex', alignItems: 'center', gap: '10px',
        padding: '12px 24px', borderRadius: 'var(--r-xl)',
        background: match ? 'var(--success-bg)' : 'var(--error-bg)',
        border: `1.5px solid ${match ? 'var(--success-bdr)' : 'var(--error-bdr)'}`,
        color: match ? 'var(--success)' : 'var(--error)',
        fontSize: 'var(--fs-15)', fontWeight: 600, fontFamily: 'var(--ff-display)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1) translateY(0)' : 'scale(0.78) translateY(14px)',
        transition: `all var(--d-slow) var(--ease-spring)`,
        boxShadow: visible ? (match ? '0 6px 32px rgba(60,184,122,0.25)' : '0 6px 32px rgba(224,82,82,0.25)') : 'none',
      }}>
        <span style={{ fontSize: '22px', lineHeight: 1, fontFamily: 'sans-serif' }}>{match ? '✓' : '✗'}</span>
        {match ? 'Ruh halinize uygun' : 'Ruh halinize uygun değil'}
      </div>
    </div>
  );
}

// ── JsonViewer ────────────────────────────────────────────────────────────────
function JsonViewer({ data, visible }) {
  const [copied, setCopied] = React.useState(false);
  const [open, setOpen] = React.useState(true);
  const json = JSON.stringify(data, null, 2);

  const highlighted = json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}\[\],])/g,
    match => {
      if (/^"/.test(match)) return /:$/.test(match) ? `<span class="json-key">${match}</span>` : `<span class="json-str">${match}</span>`;
      if (/true|false/.test(match)) return `<span class="json-bool">${match}</span>`;
      if (/null/.test(match)) return `<span class="json-null">${match}</span>`;
      if (/[{}\[\]]/.test(match)) return `<span class="json-punc">${match}</span>`;
      if (/,/.test(match)) return `<span class="json-punc">${match}</span>`;
      return `<span class="json-num">${match}</span>`;
    }
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(json).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  };

  return (
    <div style={{ background: '#030308', border: '1px solid var(--bdr-subtle)', borderRadius: 'var(--r-md)', overflow: 'hidden', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(10px)', transition: `all var(--d-slow) var(--ease-out)` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 14px', borderBottom: '1px solid var(--bdr-subtle)', background: 'var(--bg-surface)' }}>
        <button onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 'var(--fs-11)', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <span style={{ display: 'inline-block', transition: `transform var(--d-fast)`, transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▾</span>
          JSON ÇIKTI
        </button>
        <button onClick={handleCopy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--success)' : 'var(--text-3)', fontSize: 'var(--fs-12)', padding: '2px 8px', borderRadius: 'var(--r-sm)', transition: 'color var(--d-fast)' }}>
          {copied ? '✓ Kopyalandı' : 'Kopyala'}
        </button>
      </div>
      {open && (
        <pre style={{ fontFamily: 'var(--ff-mono)', fontSize: 'var(--fs-13)', lineHeight: 1.75, padding: '14px 18px', margin: 0, overflow: 'auto', maxHeight: '230px', color: 'var(--text-1)' }}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      )}
    </div>
  );
}

// ── SkeletonBlock ──────────────────────────────────────────────────────────────
function SkeletonBlock({ width = '100%', height = '16px', style }) {
  return (
    <div style={{
      width, height, borderRadius: 'var(--r-sm)',
      background: 'linear-gradient(90deg, var(--bg-elevated) 0%, var(--bg-overlay) 50%, var(--bg-elevated) 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.6s linear infinite',
      ...style,
    }} />
  );
}

// ── EmptyState ─────────────────────────────────────────────────────────────────
function EmptyState({ title = 'Analiz bekleniyor', subtitle }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', padding: '48px 32px', textAlign: 'center' }}>
      <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--bdr-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
        <FilmIcon size={28} />
      </div>
      <div>
        <div style={{ color: 'var(--text-2)', fontSize: 'var(--fs-15)', fontWeight: 500, marginBottom: '6px' }}>{title}</div>
        <div style={{ color: 'var(--text-3)', fontSize: 'var(--fs-13)', maxWidth: '240px', lineHeight: 1.6, margin: '0 auto' }}>{subtitle || 'Sol panelden giriş yapın ve analiz başlatın.'}</div>
      </div>
    </div>
  );
}

// ── OfflineBadge ───────────────────────────────────────────────────────────────
function OfflineBadge() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 11px', borderRadius: 'var(--r-full)', background: 'var(--success-bg)', border: '1px solid var(--success-bdr)', fontSize: 'var(--fs-11)', fontWeight: 500, color: 'var(--success)', letterSpacing: '0.02em', userSelect: 'none' }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', flexShrink: 0, animation: 'pulse-ring 2.5s ease-in-out infinite' }} />
      Yerel · Veri göndermez
    </div>
  );
}

// ── SVG Icons ──────────────────────────────────────────────────────────────────
function FilmIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2"/>
      <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/>
      <line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/>
    </svg>
  );
}
function ArrowLeftIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
}
function TagIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  );
}
function HeartIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}
function StarIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}
function XIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

// ── Exports ────────────────────────────────────────────────────────────────────

// ── Movie Poster Data ─────────────────────────────────────────────────────────
const POSTER_FILMS = [
  { id:'inception',    title:'Inception',       year:'2010', c1:'#0c1825', ac:'#4fc3f7', shape:'rings'     },
  { id:'darkknight',   title:'Dark Knight',     year:'2008', c1:'#080808', ac:'#f6c90e', shape:'bars'      },
  { id:'interstellar', title:'Interstellar',    year:'2014', c1:'#07070f', ac:'#e8c56d', shape:'planet'    },
  { id:'pulpfiction',  title:'Pulp Fiction',    year:'1994', c1:'#1a0800', ac:'#f5c842', shape:'cross'     },
  { id:'godfather',    title:'The Godfather',   year:'1972', c1:'#0d0505', ac:'#c03030', shape:'triangle'  },
  { id:'laland',       title:'La La Land',      year:'2016', c1:'#180830', ac:'#f8b4ff', shape:'star'      },
  { id:'parasite',     title:'Parasite',        year:'2019', c1:'#030d04', ac:'#7dbc6b', shape:'lines'     },
  { id:'whiplash',     title:'Whiplash',        year:'2014', c1:'#140000', ac:'#ff4040', shape:'circle'    },
  { id:'matrix',       title:'The Matrix',      year:'1999', c1:'#010801', ac:'#00e676', shape:'grid'      },
  { id:'joker',        title:'Joker',           year:'2019', c1:'#100800', ac:'#ff6b00', shape:'diamond'   },
  { id:'bladerunner',  title:'Blade Runner',    year:'1982', c1:'#0a0215', ac:'#ff8c00', shape:'wave'      },
  { id:'her',          title:'Her',             year:'2013', c1:'#1a0a05', ac:'#ff6b6b', shape:'arch'      },
  { id:'fightclub',    title:'Fight Club',      year:'1999', c1:'#100505', ac:'#ff9500', shape:'cross'     },
  { id:'shawshank',    title:'Shawshank',       year:'1994', c1:'#0a0d18', ac:'#e8b84b', shape:'window'    },
  { id:'spirited',     title:'Spirited Away',   year:'2001', c1:'#0d1522', ac:'#ff9eb5', shape:'rings'     },
  { id:'paradiso',     title:'Cinema Paradiso', year:'1988', c1:'#0f0b00', ac:'#ffd700', shape:'projector' },
];

// ── PosterSVG — generates minimal poster art ──────────────────────────────────
function PosterSVG({ film, w = 56, h = 80 }) {
  if (!film) return null;
  const { c1, ac, title, year, shape } = film;
  const cx = w / 2, cy = h * 0.40, r = Math.min(w, h) * 0.22;

  const shapes = {
    rings: <>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={ac} strokeWidth="1.5" opacity="0.85"/>
      <circle cx={cx} cy={cy} r={r*.6} fill="none" stroke={ac} strokeWidth="1" opacity="0.6"/>
      <circle cx={cx} cy={cy} r={r*.22} fill={ac} opacity="0.75"/>
    </>,
    circle: <>
      <circle cx={cx} cy={cy} r={r} fill={ac+'18'} stroke={ac} strokeWidth="1.5" opacity="0.85"/>
      <circle cx={cx} cy={cy} r={r*.4} fill={ac} opacity="0.25"/>
    </>,
    bars: <>
      {[-1,0,1].map(i => <rect key={i} x={cx-7+i*7} y={cy-r*.9} width="4.5" height={r*1.8} fill={ac} opacity={0.45+Math.abs(i)*0.18} rx="1"/>)}
    </>,
    diamond: <rect x={cx-r*.78} y={cy-r*.78} width={r*1.56} height={r*1.56} fill={ac+'14'} stroke={ac} strokeWidth="1.5" opacity="0.85" transform={`rotate(45,${cx},${cy})`} rx="1"/>,
    triangle: <polygon points={`${cx},${cy-r} ${cx+r*.87},${cy+r*.5} ${cx-r*.87},${cy+r*.5}`} fill={ac+'14'} stroke={ac} strokeWidth="1.5" opacity="0.85"/>,
    lines: <>
      {[-2,-1,0,1,2].map(i => <line key={i} x1={cx-r+i*r*.55} y1={cy-r} x2={cx-r+i*r*.55+r*.4} y2={cy+r} stroke={ac} strokeWidth="1.2" opacity={0.65-Math.abs(i)*.1} strokeLinecap="round"/>)}
    </>,
    planet: <>
      <circle cx={cx} cy={cy} r={r*.54} fill={ac+'14'} stroke={ac} strokeWidth="1.3" opacity="0.85"/>
      <ellipse cx={cx} cy={cy} rx={r} ry={r*.33} fill="none" stroke={ac} strokeWidth="1" opacity="0.6" transform={`rotate(-18,${cx},${cy})`}/>
    </>,
    cross: <>
      <line x1={cx} y1={cy-r*.88} x2={cx} y2={cy+r*.88} stroke={ac} strokeWidth="2.2" opacity="0.82" strokeLinecap="round"/>
      <line x1={cx-r*.88} y1={cy} x2={cx+r*.88} y2={cy} stroke={ac} strokeWidth="2.2" opacity="0.82" strokeLinecap="round"/>
    </>,
    wave: <>
      {[-1,0,1].map(i => <path key={i} d={`M ${cx-r} ${cy+i*6} Q ${cx-r*.4} ${cy+i*6-7} ${cx} ${cy+i*6} Q ${cx+r*.4} ${cy+i*6+7} ${cx+r} ${cy+i*6}`} fill="none" stroke={ac} strokeWidth="1.2" opacity={.85-Math.abs(i)*.28}/>)}
    </>,
    star: <polygon points={[0,45,90,135,180,225,270,315].map(a => { const rad=a*Math.PI/180, rr=a%90===0?r:r*.42; return `${cx+rr*Math.sin(rad)},${cy-rr*Math.cos(rad)}`; }).join(' ')} fill={ac+'14'} stroke={ac} strokeWidth="1.3" opacity="0.85"/>,
    grid: <>{[0,1,2].flatMap(row=>[0,1,2].map(col=><circle key={row+'-'+col} cx={cx-r*.65+col*r*.65} cy={cy-r*.5+row*r*.5} r="2.2" fill={ac} opacity={0.4+row*.1+col*.07}/>))}</>,
    arch: <path d={`M ${cx-r} ${cy+r*.6} Q ${cx-r} ${cy-r*.6} ${cx} ${cy-r} Q ${cx+r} ${cy-r*.6} ${cx+r} ${cy+r*.6}`} fill="none" stroke={ac} strokeWidth="1.5" opacity="0.85" strokeLinecap="round"/>,
    projector: <>
      <rect x={cx-r*.48} y={cy-r*.34} width={r*.96} height={r*.68} rx="3" fill={ac+'14'} stroke={ac} strokeWidth="1.3" opacity="0.85"/>
      <circle cx={cx} cy={cy} r={r*.16} fill={ac} opacity="0.65"/>
      <polygon points={`${cx+r*.46},${cy-r*.18} ${cx+r*.92},${cy-r*.55} ${cx+r*.92},${cy+r*.55} ${cx+r*.46},${cy+r*.18}`} fill={ac} opacity="0.16"/>
    </>,
    window: <>
      <rect x={cx-r*.88} y={cy-r} width={r*1.76} height={r*2.1} rx="2" fill={ac+'10'} stroke={ac} strokeWidth="1.3" opacity="0.85"/>
      <line x1={cx} y1={cy-r} x2={cx} y2={cy+r*1.1} stroke={ac} strokeWidth="0.8" opacity="0.45"/>
      <line x1={cx-r*.88} y1={cy} x2={cx+r*.88} y2={cy} stroke={ac} strokeWidth="0.8" opacity="0.45"/>
    </>,
  };

  return (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%',display:'block'}}>
      {shapes[shape] || shapes.circle}
      {/* Horizontal divider line */}
      <line x1="6" y1={h-14} x2={w-6} y2={h-14} stroke={ac} strokeWidth="0.5" opacity="0.22"/>
      {/* Title */}
      <text x={cx} y={h-8} textAnchor="middle" fill={ac} fontSize="4.8" fontFamily="monospace" opacity="0.88" letterSpacing="0.5">
        {title.slice(0,12).toUpperCase()}
      </text>
      <text x={cx} y={h-3} textAnchor="middle" fill="rgba(255,255,255,0.28)" fontSize="3.2" fontFamily="monospace">
        {year}
      </text>
    </svg>
  );
}

// ── Platform data ──────────────────────────────────────────────────────────────
const PLATFORMS = {
  netflix: { name: 'Netflix',     color: '#E50914', bg: 'rgba(229,9,20,0.13)'   },
  prime:   { name: 'Prime Video', color: '#00A8E1', bg: 'rgba(0,168,225,0.11)'  },
  disney:  { name: 'Disney+',     color: '#1E5EFF', bg: 'rgba(30,94,255,0.11)'  },
  apple:   { name: 'Apple TV+',   color: '#E8E8E8', bg: 'rgba(232,232,232,0.08)'},
  mubi:    { name: 'MUBI',        color: '#2DCEC8', bg: 'rgba(45,206,200,0.11)' },
};

const PLATFORM_KEYS = ['netflix', 'prime', 'mubi', 'disney', 'apple'];

function getPlatform(title) {
  // Deterministic: hash title to pick a platform
  const sum = [...(title||'')].reduce((a,c) => a + c.charCodeAt(0), 0);
  return PLATFORM_KEYS[sum % PLATFORM_KEYS.length];
}

function getPosterFilm(title) {
  const key = (title||'').toLowerCase().replace(/[^a-z]/g,'');
  return POSTER_FILMS.find(f => key.includes(f.id.slice(0,5))) ||
         POSTER_FILMS.find(f => key.includes(f.title.toLowerCase().replace(/[^a-z]/g,'').slice(0,5))) ||
         POSTER_FILMS[0];
}

Object.assign(window, {
  Button, LoadingDots, Textarea, Word,
  GenreChip, MoodChip, MoodBadge, MatchBadge,
  JsonViewer, SkeletonBlock, EmptyState, OfflineBadge,
  FilmIcon, ArrowLeftIcon, TagIcon, HeartIcon, StarIcon, XIcon,
  MOOD_META, POSTER_FILMS, PosterSVG, PLATFORMS, getPlatform, getPosterFilm,
});
