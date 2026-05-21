// ─────────────────────────────────────────────────────────────────────────────
// Movie Agent — Result Detail Modal
// ─────────────────────────────────────────────────────────────────────────────

function ResultModal({ result, onClose }) {
  const [copiedJson, setCopiedJson] = React.useState(false);
  const [copiedText, setCopiedText] = React.useState(false);

  // Close on Escape
  React.useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!result) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(result.json, null, 2)).then(() => {
      setCopiedJson(true); setTimeout(() => setCopiedJson(false), 2000);
    });
  };
  const handleCopyText = () => {
    const t = `${result.title} (${result.year}) — ${result.contentType}\n\n${result.reason}\n\nTürler: ${result.genres.join(', ')}`;
    navigator.clipboard.writeText(t).then(() => {
      setCopiedText(true); setTimeout(() => setCopiedText(false), 2000);
    });
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(7,7,15,0.82)',
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        animation: 'backdrop-in var(--d-base) var(--ease-out)',
      }}
    >
      <div style={{
        width: '100%', maxWidth: '520px', maxHeight: '92vh',
        overflow: 'auto', background: 'var(--bg-surface)',
        border: '1px solid var(--bdr-default)',
        borderRadius: 'var(--r-2xl)',
        boxShadow: 'var(--sh-lg)',
        animation: 'modal-in var(--d-slow) var(--ease-spring)',
      }}>

        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: '1px solid var(--bdr-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FilmIcon size={14} />
            <span style={{ fontSize: 'var(--fs-11)', fontFamily: 'var(--ff-mono)', color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Öneri Kartı
            </span>
          </div>
          <button onClick={onClose} style={{
            width: '28px', height: '28px', borderRadius: 'var(--r-sm)',
            background: 'var(--bg-hover)', border: 'none', cursor: 'pointer',
            color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background var(--d-fast)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-active)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          >
            <XIcon size={14} />
          </button>
        </div>

        {/* Poster placeholder */}
        <div style={{
          margin: '18px 18px 0', aspectRatio: '16 / 7', overflow: 'hidden',
          background: 'var(--bg-elevated)', border: '1px solid var(--bdr-subtle)',
          borderRadius: 'var(--r-lg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          {/* Decorative gradient */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(200,135,26,0.07) 0%, transparent 65%)' }} />
          {/* Film strip perforations */}
          <FilmStripDecor />
          <div style={{ textAlign: 'center', color: 'var(--text-3)', position: 'relative', zIndex: 1 }}>
            <FilmIcon size={28} />
            <div style={{ fontSize: 'var(--fs-11)', marginTop: '8px', fontFamily: 'var(--ff-mono)' }}>poster yok · yerel model</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 18px 24px' }}>
          {/* Badges */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--fs-10)', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-3)', background: 'var(--bg-elevated)', padding: '3px 9px', borderRadius: 'var(--r-full)', border: '1px solid var(--bdr-subtle)', fontFamily: 'var(--ff-mono)' }}>
              {result.contentType}
            </span>
            <MoodBadge mood={result.moodCategory} />
          </div>

          {/* Title */}
          <h2 style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: 'var(--fs-32)', letterSpacing: '-0.03em', lineHeight: 1.06, color: 'var(--text-1)', marginBottom: '5px' }}>
            {result.title}
          </h2>
          <div style={{ fontSize: 'var(--fs-13)', color: 'var(--text-3)', fontFamily: 'var(--ff-mono)', marginBottom: '18px' }}>
            {result.year}
          </div>

          {/* Reason block */}
          <div style={{ padding: '14px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', borderLeft: '3px solid var(--accent)', marginBottom: '18px' }}>
            <p style={{ fontSize: 'var(--fs-14)', color: 'var(--text-2)', lineHeight: 1.72 }}>
              {result.reason}
            </p>
          </div>

          {/* Genre chips */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {result.genres.map((g, i) => <GenreChip key={g} label={g} index={i} />)}
          </div>

          {/* Dev Notes */}
          <ModalDevNotes result={result} />

          {/* Action bar */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '18px', flexWrap: 'wrap' }}>
            <Button variant="primary" size="md" onClick={handleCopyJson} style={{ flex: 1 }}>
              {copiedJson ? '✓ Kopyalandı' : 'JSON Kopyala'}
            </Button>
            <Button variant="secondary" size="md" onClick={handleCopyText} style={{ flex: 1 }}>
              {copiedText ? '✓ Kopyalandı' : 'Metni Kopyala'}
            </Button>
          </div>

          {/* Offline note */}
          <div style={{ marginTop: '16px', textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
            <OfflineBadge />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Film strip decorative ─────────────────────────────────────────────────────
function FilmStripDecor() {
  const perf = Array.from({ length: 10 });
  const perfStyle = { width: '10px', height: '14px', borderRadius: '2px', background: 'var(--bg-base)', border: '1px solid var(--bdr-subtle)', flexShrink: 0 };
  const rowStyle  = { position: 'absolute', left: 0, right: 0, display: 'flex', gap: '12px', padding: '0 16px', alignItems: 'center' };
  return (
    <>
      <div style={{ ...rowStyle, top: '10px' }}>{perf.map((_, i) => <div key={i} style={perfStyle} />)}</div>
      <div style={{ ...rowStyle, bottom: '10px' }}>{perf.map((_, i) => <div key={i} style={perfStyle} />)}</div>
    </>
  );
}

// ── Modal Dev Notes ───────────────────────────────────────────────────────────
function ModalDevNotes({ result }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ marginBottom: '4px' }}>
      <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 'var(--fs-11)', fontFamily: 'var(--ff-mono)', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 0' }}>
        <span style={{ display: 'inline-block', transition: `transform var(--d-fast)`, transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
        DEV NOTES
      </button>
      {open && (
        <div style={{ background: 'var(--bg-base)', border: '1px solid var(--bdr-subtle)', borderRadius: 'var(--r-md)', padding: '14px 16px', marginTop: '6px', fontSize: 'var(--fs-12)', fontFamily: 'var(--ff-mono)', color: 'var(--text-2)', lineHeight: 1.75 }}>
          <div style={{ color: 'var(--accent-text)', fontWeight: 600, marginBottom: '8px' }}>ResultModal · RecommendResult · v1.0</div>
          <div><span style={{ color: 'var(--text-3)' }}>Component:</span>  ResultModal → ModalDevNotes</div>
          <div><span style={{ color: 'var(--text-3)' }}>Animation:</span>  modal-in · var(--ease-spring) · 350ms</div>
          <div><span style={{ color: 'var(--text-3)' }}>Backdrop:</span>  rgba(7,7,15,0.82) + blur(10px)</div>
          <div><span style={{ color: 'var(--text-3)' }}>Tokens:</span>  --bg-surface, --r-2xl, --sh-lg, --bdr-default</div>
          <div><span style={{ color: 'var(--text-3)' }}>Poster:</span>  placeholder — image-slot.js ile değiştirilebilir</div>
          <div><span style={{ color: 'var(--text-3)' }}>Close:</span>  Esc key + backdrop click + × button</div>
          <div><span style={{ color: 'var(--text-3)' }}>API:</span>  POST /api/recommend · {'{ mood, preferences }'}</div>
          <div><span style={{ color: 'var(--text-3)' }}>Erişilebilirlik:</span>  focus-trap gerekli (üretim için)</div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ResultModal, FilmStripDecor, ModalDevNotes });
