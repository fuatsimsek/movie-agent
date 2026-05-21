// ─────────────────────────────────────────────────────────────────────────────
// Movie Agent — Detail Screen
// Full page: film poster + platform + details
// ─────────────────────────────────────────────────────────────────────────────

function DetailScreen({ result, onBack }) {
  const [mounted, setMounted] = React.useState(false);
  const [posterStage, setPosterStage] = React.useState('tmdb'); // tmdb → svg → placeholder
  React.useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  if (!result) return null;

  const platformKey  = result.platform || getPlatform(result.title);
  const platform     = PLATFORMS[platformKey] || PLATFORMS.prime;
  const moodMeta     = MOOD_META[result.moodCategory] || { label: result.moodCategory, color: 'var(--accent)' };

  // Filmi POSTER_DATA'dan bul (home.jsx ile aynı veri)
  const film = POSTER_DATA.find(f => f.title.toLowerCase() === result.title.toLowerCase()) ||
               { title: result.title, year: result.year, tmdb: null, svg: null };

  const TMDB_BASE = 'https://image.tmdb.org/t/p/w342';

  const handleTmdbError = (e) => {
    if (!e.target.dataset.tried) {
      e.target.dataset.tried = '1';
      setPosterStage('svg');
      console.log(`🔴 TMDB 404: ${film.title} → trying SVG...`);
    }
  };

  const handleSvgError = (e) => {
    if (!e.target.dataset.tried) {
      e.target.dataset.tried = '1';
      setPosterStage('placeholder');
      console.log(`🟡 SVG missing: ${film.title} → placeholder`);
    }
  };

  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    const text = `${result.title} (${result.year})\n${result.reason}\nPlatform: ${platform.name}`;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-base)', position: 'relative' }}>

      {/* Atmosphere glow from mood color */}
      <div aria-hidden="true" style={{ position: 'absolute', top: '-10%', left: '-10%', width: '60%', height: '60%', borderRadius: '50%', background: `radial-gradient(circle, ${moodMeta.color}09 0%, transparent 65%)`, pointerEvents: 'none', zIndex: 0, animation: 'blob-drift-1 20s ease-in-out infinite' }} />

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 'var(--nav-h)', borderBottom: '1px solid var(--bdr-subtle)', flexShrink: 0, position: 'relative', zIndex: 10, background: 'rgba(7,7,15,0.9)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}>
        <Button variant="ghost" size="sm" onClick={onBack} style={{ color: 'var(--text-3)', paddingLeft: '4px', gap: '4px' }}>
          <ArrowLeftIcon size={14} /> Geri
        </Button>
        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 'var(--fs-11)', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Öneri Detayı</span>
        <OfflineBadge />
      </nav>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '48px 32px 80px', display: 'flex', gap: '56px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* ── Poster ── */}
          <div style={{ flexShrink: 0, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.94)', filter: mounted ? 'blur(0)' : 'blur(10px)', transition: 'all 0.65s var(--ease-spring)' }}>
            {/* Poster card — 3-stage fallback */}
            <div style={{ width: '260px', height: '390px', borderRadius: 'var(--r-lg)', overflow: 'hidden', background: 'linear-gradient(135deg, #0c0c1b 0%, #1a1a2e 100%)', position: 'relative', boxShadow: `0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.06)`, border: '1px solid var(--bdr-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

              {/* Film strip top */}
              <div style={{ position: 'absolute', top: '10px', left: 0, right: 0, display: 'flex', justifyContent: 'space-around', zIndex: 10 }}>
                {Array.from({length:8}).map((_,i)=>(
                  <div key={i} style={{width:'8px',height:'12px',borderRadius:'1.5px',background:'rgba(0,0,0,0.45)',border:'1px solid rgba(255,255,255,0.06)'}}/>
                ))}
              </div>

              {/* Film strip bottom */}
              <div style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, display: 'flex', justifyContent: 'space-around', zIndex: 10 }}>
                {Array.from({length:8}).map((_,i)=>(
                  <div key={i} style={{width:'8px',height:'12px',borderRadius:'1.5px',background:'rgba(0,0,0,0.45)',border:'1px solid rgba(255,255,255,0.06)'}}/>
                ))}
              </div>

              {/* Stage 1: TMDB Real Poster */}
              {posterStage === 'tmdb' && film.tmdb && (
                <img
                  src={TMDB_BASE + film.tmdb}
                  alt={film.title}
                  onError={handleTmdbError}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              )}

              {/* Stage 2: SVG Fallback */}
              {posterStage === 'svg' && film.svg && (
                <img
                  src={`/posters/${film.svg}`}
                  alt={film.title}
                  onError={handleSvgError}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              )}

              {/* Stage 3: Text Placeholder */}
              {posterStage === 'placeholder' && (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                  padding: '16px', textAlign: 'center',
                  background: 'linear-gradient(135deg, #0c0c1b 0%, #1a1a2e 100%)',
                }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: 'var(--accent-text)',
                    fontFamily: 'var(--ff-display)',
                    lineHeight: '1.2',
                    maxWidth: '95%',
                    marginBottom: '8px',
                  }}>
                    {film.title.split(' ').slice(0, 4).join(' ')}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: 'var(--text-3)',
                    fontFamily: 'var(--ff-mono)',
                  }}>
                    {film.year}
                  </div>
                </div>
              )}
            </div>

            {/* Platform badge below poster */}
            <div style={{ marginTop: '18px', padding: '12px 16px', borderRadius: 'var(--r-md)', background: platform.bg, border: `1px solid ${platform.color}40`, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: platform.color, flexShrink: 0, animation: 'pulse-ring 2.5s ease-in-out infinite' }} />
              <div>
                <div style={{ fontSize: 'var(--fs-11)', color: 'var(--text-3)', fontFamily: 'var(--ff-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>Platform</div>
                <div style={{ fontSize: 'var(--fs-14)', fontWeight: 600, color: platform.color }}>{platform.name}</div>
              </div>
            </div>
          </div>

          {/* ── Info column ── */}
          <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

            {/* Type + mood */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.12s' }}>
              <span style={{ fontSize: 'var(--fs-11)', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-3)', background: 'var(--bg-elevated)', padding: '3px 9px', borderRadius: 'var(--r-full)', border: '1px solid var(--bdr-subtle)', fontFamily: 'var(--ff-mono)' }}>
                {result.contentType || 'Film'}
              </span>
              <MoodBadge mood={result.moodCategory} />
            </div>

            {/* Title */}
            <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)', filter: mounted ? 'blur(0)' : 'blur(6px)', transition: 'all 0.6s 0.18s var(--ease-out)' }}>
              <h1 style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 54px)', letterSpacing: '-0.04em', lineHeight: 1.06, color: 'var(--text-1)', marginBottom: '8px' }}>
                {result.title}
              </h1>
              <div style={{ fontSize: 'var(--fs-16)', color: 'var(--text-3)', fontFamily: 'var(--ff-mono)' }}>
                {result.year}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--bdr-subtle)', opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.28s' }} />

            {/* Reason */}
            <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)', filter: mounted ? 'blur(0)' : 'blur(5px)', transition: 'all 0.6s 0.28s var(--ease-out)' }}>
              <div style={{ fontSize: 'var(--fs-11)', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'var(--ff-mono)', marginBottom: '12px' }}>
                Neden bu film?
              </div>
              <div style={{ padding: '16px 18px', background: 'var(--bg-surface)', borderRadius: 'var(--r-md)', borderLeft: `3px solid var(--accent)` }}>
                <p style={{ fontSize: 'var(--fs-15)', color: 'var(--text-2)', lineHeight: 1.72 }}>
                  {result.reason}
                </p>
              </div>
            </div>

            {/* Genre chips */}
            <div style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.38s' }}>
              <div style={{ fontSize: 'var(--fs-11)', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'var(--ff-mono)', marginBottom: '12px' }}>
                Türler
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(result.genres || []).map((g, i) => <GenreChip key={g} label={g} index={i} />)}
              </div>
            </div>

            {/* Platform detail block */}
            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)', border: '1px solid var(--bdr-default)', padding: '18px 20px', opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.45s' }}>
              <div style={{ fontSize: 'var(--fs-11)', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'var(--ff-mono)', marginBottom: '12px' }}>
                Nereden izlenir
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: 'var(--r-md)', background: platform.bg, border: `1px solid ${platform.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--fs-18)', fontWeight: 800, color: platform.color, fontFamily: 'var(--ff-display)' }}>
                  {platform.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 'var(--fs-15)', fontWeight: 600, color: platform.color, marginBottom: '2px' }}>{platform.name}</div>
                  <div style={{ fontSize: 'var(--fs-12)', color: 'var(--text-3)' }}>Şu anda izlenebilir</div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.52s' }}>
              <Button variant="primary" size="lg" onClick={handleCopy} style={{ flex: 1, minWidth: '140px' }}>
                {copied ? '✓ Kopyalandı' : 'Kopyala'}
              </Button>
              <Button variant="secondary" size="lg" onClick={onBack} style={{ flex: 1, minWidth: '140px' }}>
                Yeni Öneri Al
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DetailScreen });
