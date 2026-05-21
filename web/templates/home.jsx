// ─────────────────────────────────────────────────────────────────────────────
// Movie Agent — Home Screen (v5 · vertical poster columns bg)
// ─────────────────────────────────────────────────────────────────────────────

// ⭐ CURATED FILM LIBRARY (30 Films)
// Bu 30 film backend'in Layer 5'inde guarantee garantili seçilmektedir.
// Backend (app.py) AI'nin önerdiği herhangi bir filmi bu listeden eşleştirerek hallüsinasyon önler.
// POSTER_DATA frontend'de poster gösterileri için, FILM_LIBRARY backend'de filtering için kullanılır.

const TMDB_BASE = 'https://image.tmdb.org/t/p/w185';
const POSTER_DATA = [
  { title:'Inception',       year:'2010', tmdb:'/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', svg:'inception.svg' },
  { title:'The Dark Knight', year:'2008', tmdb:'/qJ2tW6WMUDux911r6m7haRef0WH.jpg', svg:'dark-knight.svg' },
  { title:'Interstellar',    year:'2014', tmdb:'/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', svg:'interstellar.svg' },
  { title:'Pulp Fiction',    year:'1994', tmdb:'/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', svg:'pulp-fiction.svg' },
  { title:'The Godfather',   year:'1972', tmdb:'/3bhkrj58Vtu7enYsLegHzr4gBco.jpg', svg:'the-godfather.svg' },
  { title:'La La Land',      year:'2016', tmdb:'/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg', svg:'la-la-land.svg' },
  { title:'Parasite',        year:'2019', tmdb:'/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', svg:'parasite.svg' },
  { title:'Whiplash',        year:'2014', tmdb:'/7fn624j5lj3xTme2SgiLCeuedmO.jpg', svg:'whiplash.svg' },
  { title:'The Matrix',      year:'1999', tmdb:'/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', svg:'the-matrix.svg' },
  { title:'Joker',           year:'2019', tmdb:'/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg', svg:'joker.svg' },
  { title:'Blade Runner',    year:'1982', tmdb:'/aMpyrCizvSdc0UIMblJ1srVgAEF.jpg', svg:'blade-runner.svg' },
  { title:'Her',             year:'2013', tmdb:'/eCOtqtfvn7mxGGGuLioiNDCHRGP.jpg', svg:'her.svg' },
  { title:'Fight Club',      year:'1999', tmdb:'/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', svg:'fight-club.svg' },
  { title:'Shawshank',       year:'1994', tmdb:'/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', svg:'shawshank.svg' },
  { title:'Spirited Away',   year:'2001', tmdb:'/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', svg:'spirited-away.svg' },
  { title:'Cinema Paradiso', year:'1988', tmdb:'/8SRUfRUi6x4O68n0VCbDNRa6iGL.jpg', svg:'paradiso.svg' },
  { title:"Schindler's",     year:'1993', tmdb:'/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg', svg:'schindler.svg' },
  { title:'Silence Lambs',   year:'1991', tmdb:'/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg', svg:'silence.svg' },
  { title:'Forrest Gump',    year:'1994', tmdb:'/saHP97rTPS5eLmrLQEcANmKrsFl.jpg', svg:'forrest-gump.svg' },
  { title:'Mad Max',         year:'2015', tmdb:'/kqjL17yufvn9OVLyXYpvtyrFfak.jpg', svg:'mad-max.svg' },
  { title:'1917',            year:'2019', tmdb:'/iZf0KyrE25z1sage4SYQLs1aMJf.jpg', svg:'nineteen17.svg' },
  { title:'No Country',      year:'2007', tmdb:'/6d5XOczc7reT3rYMQB9RnHVUrMJ.jpg', svg:'no-country.svg' },
  { title:'Get Out',         year:'2017', tmdb:'/tFXcEccSjH17mUIs4uRqDwEABPJ.jpg', svg:'get-out.svg' },
  { title:'The Revenant',    year:'2015', tmdb:'/ji3ecJphATlVgV8pA4T5JBFRhZx.jpg', svg:'revenant.svg' },
  { title:'Goodfellas',      year:'1990', tmdb:'/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg', svg:'goodfellas.svg' },
  { title:'Titanic',         year:'1997', tmdb:'/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg', svg:'titanic.svg' },
  { title:'Black Swan',      year:'2010', tmdb:'/pGcmGBjD0o6H2pxrBuKOCJVNbgR.jpg', svg:'black-swan.svg' },
  { title:'Social Network',  year:'2010', tmdb:'/n0ybibhJtQ5icDqTp8eRytcIHso.jpg', svg:'social-net.svg' },
  { title:'Avengers',        year:'2019', tmdb:'/or06FN3Dka5tukK1e9sl16pB3iy.jpg', svg:'avengers.svg' },
  { title:'American Beauty', year:'1999', tmdb:'/wby9315QzGJkFRsTzSRi6GQnp0a.jpg', svg:'am-beauty.svg' },
];

// Split 30 films into 5 columns of 6
const COLUMNS_DATA = [
  { films: POSTER_DATA.slice(0,  6),  dur: 38, delay:  0  },
  { films: POSTER_DATA.slice(6,  12), dur: 52, delay: -18 },
  { films: POSTER_DATA.slice(12, 18), dur: 44, delay: -8  },
  { films: POSTER_DATA.slice(18, 24), dur: 60, delay: -28 },
  { films: POSTER_DATA.slice(24, 30), dur: 48, delay: -14 },
];

// ── Poster card — TMDB with SVG/placeholder fallback ────────────────────────
function PosterCard({ film, w, h }) {
  const [stage, setStage] = React.useState('tmdb'); // tmdb → svg → placeholder

  const handleTmdbError = (e) => {
    if (!e.target.dataset.tried) {
      e.target.dataset.tried = '1';
      setStage('svg');
      console.log(`🔴 TMDB 404: ${film.title} → trying SVG...`);
    }
  };

  const handleSvgError = (e) => {
    if (!e.target.dataset.tried) {
      e.target.dataset.tried = '1';
      setStage('placeholder');
      console.log(`🟡 SVG missing: ${film.title} → placeholder`);
    }
  };

  return (
    <div style={{
      width: w, height: h, borderRadius: 'var(--r-sm)',
      overflow: 'hidden', flexShrink: 0,
      background: 'linear-gradient(135deg, #0c0c1b 0%, #1a1a2e 100%)',
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
      position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Stage 1: TMDB real poster */}
      {stage === 'tmdb' && film.tmdb && (
        <img
          src={TMDB_BASE + film.tmdb}
          alt={film.title}
          loading="lazy"
          onError={handleTmdbError}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      )}

      {/* Stage 2: SVG fallback */}
      {stage === 'svg' && film.svg && (
        <img
          src={`/posters/${film.svg}`}
          alt={film.title}
          onError={handleSvgError}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      )}

      {/* Stage 3: Dark placeholder with text */}
      {stage === 'placeholder' && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
          padding: '8px', textAlign: 'center',
          background: 'linear-gradient(135deg, #0c0c1b 0%, #1a1a2e 100%)',
        }}>
          <div style={{
            fontSize: `${Math.max(10, Math.floor(h / 20))}px`,
            fontWeight: '600',
            color: 'var(--accent-text)',
            fontFamily: 'var(--ff-display)',
            lineHeight: '1.2',
            maxWidth: '95%',
          }}>
            {film.title.split(' ').slice(0, 3).join(' ')}
          </div>
          <div style={{
            fontSize: `${Math.max(9, Math.floor(h / 25))}px`,
            color: 'var(--text-3)',
            fontFamily: 'var(--ff-mono)',
            marginTop: '3px',
          }}>
            {film.year}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Single vertical column ─────────────────────────────────────────────────
function PosterColumn({ films, dur, delay }) {
  const W = 110, H = 165, GAP = 12;
  return (
    <div style={{ width: W, flexShrink: 0, overflow: 'hidden', height: '100vh' }}>
      <div style={{
        display: 'flex', flexDirection: 'column', gap: GAP,
        animation: `col-scroll-down ${dur}s ${delay}s linear infinite`,
      }}>
        {films.map((f,i) => <PosterCard key={i}   film={f} w={W} h={H} />)}
        {films.map((f,i) => <PosterCard key={'d'+i} film={f} w={W} h={H} />)}
      </div>
    </div>
  );
}

// ── Full-page poster background ─────────────────────────────────────────────
function FilmColumnsBackground() {
  return (
    <div aria-hidden="true" style={{
      position: 'fixed', inset: 0, zIndex: 0,
      pointerEvents: 'none', overflow: 'hidden',
      opacity: 0.42,
    }}>
      {/* Columns */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', justifyContent: 'space-evenly',
        alignItems: 'flex-start',
        overflow: 'hidden',
      }}>
        {COLUMNS_DATA.map((col, i) => (
          <PosterColumn key={i} films={col.films} dur={col.dur} delay={col.delay} />
        ))}
      </div>

      {/* Top + bottom gradient fade — softer so posters stay visible */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, var(--bg-base) 0%, rgba(7,7,15,0.35) 12%, rgba(7,7,15,0) 30%, rgba(7,7,15,0) 70%, rgba(7,7,15,0.35) 88%, var(--bg-base) 100%)' }} />

      {/* Center radial darkener so hero content stays readable — lighter than before */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 55% at 50% 50%, rgba(7,7,15,0.62) 0%, rgba(7,7,15,0.18) 65%, transparent 100%)' }} />
    </div>
  );
}

// ── Home Screen ───────────────────────────────────────────────────────────────
function HomeScreen({ onSelectMode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'auto' }}>

      {/* Poster columns background */}
      <FilmColumnsBackground />

      {/* Atmosphere blobs on top */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,135,26,0.06) 0%, transparent 65%)', top: '-15%', left: '-8%', animation: 'blob-drift-1 22s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(80,128,220,0.04) 0%, transparent 60%)', bottom: '-5%', right: '-6%', animation: 'blob-drift-2 28s ease-in-out infinite' }} />
      </div>

      {/* Navbar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 'var(--nav-h)', borderBottom: '1px solid var(--bdr-subtle)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(7,7,15,0.88)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-1)' }}>
          <div style={{ color: 'var(--accent)' }}><FilmIcon size={17} /></div>
          <span style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 'var(--fs-16)', letterSpacing: '-0.01em' }}>Movie Agent</span>
        </div>
        <OfflineBadge />
      </nav>

      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '88px 24px 220px', textAlign: 'center', position: 'relative', zIndex: 2 }}>

        {/* Eyebrow */}
        <div style={{ fontSize: 'var(--fs-11)', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent-text)', marginBottom: '32px', fontFamily: 'var(--ff-mono)', opacity: mounted ? 1 : 0, filter: mounted ? 'blur(0)' : 'blur(6px)', transition: 'opacity 0.7s, filter 0.7s' }}>
          Llama 3.1 8B · Fine-tuned · Ollama · Offline
        </div>

        {/* Title — word-rise */}
        <h1 style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: 'clamp(42px,6.5vw,78px)', lineHeight: 1.05, letterSpacing: '-0.04em', color: 'var(--text-1)', marginBottom: '28px', maxWidth: '820px' }}>
          <Word mounted={mounted} delay={0}>Bugün</Word>&nbsp;
          <Word mounted={mounted} delay={70}>nasıl</Word>&nbsp;
          <Word mounted={mounted} delay={140} style={{ color: 'var(--accent-text)' }}>
            <span style={{ position: 'relative' }}>
              hissediyorsun?
              <span aria-hidden="true" style={{ position: 'absolute', bottom: '-5px', left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,var(--accent),transparent)', opacity: mounted?1:0, transition:'opacity 0.8s 0.75s' }} />
            </span>
          </Word>
        </h1>

        {/* Subtitle */}
        <p style={{ fontSize: 'var(--fs-16)', color: 'var(--text-2)', maxWidth: '480px', lineHeight: 1.68, marginBottom: '56px', opacity: mounted?1:0, transform: mounted?'translateY(0)':'translateY(14px)', filter: mounted?'blur(0)':'blur(5px)', transition: 'opacity 0.65s 0.3s var(--ease-out), transform 0.65s 0.3s var(--ease-out), filter 0.65s 0.3s var(--ease-out)' }}>
          Ruh halini yaz, yapay zeka sana uygun bir film önerir. Yerel çalışır, veri göndermez.
        </p>

        {/* Single mode card */}
        <div style={{ width:'100%', maxWidth:'460px', opacity: mounted?1:0, transform: mounted?'translateY(0)':'translateY(22px)', filter: mounted?'blur(0)':'blur(8px)', transition: 'opacity 0.7s 0.38s var(--ease-out), transform 0.7s 0.38s var(--ease-out), filter 0.7s 0.38s var(--ease-out)' }}>
          <MoodEntryCard onSelect={() => onSelectMode('recommend')} />
        </div>

        {/* Stack badges */}
        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', justifyContent:'center', marginTop:'36px', opacity: mounted?1:0, transition:'opacity 0.6s 0.52s' }}>
          {['Ollama','Unsloth LoRA','Flask','GGUF Q4_K_M','Offline'].map(tag => (
            <span key={tag} style={{ fontSize:'var(--fs-11)', fontFamily:'var(--ff-mono)', color:'var(--text-3)', padding:'3px 10px', border:'1px solid var(--bdr-subtle)', borderRadius:'var(--r-full)' }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ textAlign:'center', padding:'20px', borderTop:'1px solid var(--bdr-subtle)', color:'var(--text-3)', fontSize:'var(--fs-11)', fontFamily:'var(--ff-mono)', letterSpacing:'0.04em', flexShrink:0, position:'relative', zIndex:2 }}>
        Llama 3.1 8B (fine-tuned · MPST 8000 samples) · Unsloth LoRA r=16 · Ollama GGUF Q4_K_M · Flask
      </footer>
    </div>
  );
}

// ── MoodEntryCard ──────────────────────────────────────────────────────────────
function MoodEntryCard({ onSelect }) {
  const [hover, setHover]  = React.useState(false);
  const [tilt, setTilt]    = React.useState({ x:0, y:0 });
  const [mouse, setMouse]  = React.useState({ x:50, y:50 });
  const [pulse, setPulse]  = React.useState(0);
  const cardRef = React.useRef(null);

  const onMove = (e) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const nx = (e.clientX-r.left)/r.width, ny = (e.clientY-r.top)/r.height;
    setMouse({x:nx*100, y:ny*100});
    setTilt({x:-(ny-.5)*14, y:(nx-.5)*14});
  };
  const onEnter = () => { setHover(true); setPulse(p=>p+1); };
  const onLeave = () => { setHover(false); setTilt({x:0,y:0}); };

  const spotBg = hover
    ? `radial-gradient(circle at ${mouse.x}% ${mouse.y}%, rgba(200,135,26,0.18) 0%, var(--bg-elevated) 62%)`
    : 'var(--bg-surface)';
  const cardT  = hover
    ? `perspective(1100px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-6px) scale(1.03)`
    : 'perspective(1100px) rotateX(0) rotateY(0) translateY(0) scale(1)';

  return (
    <div ref={cardRef} onClick={onSelect}
      onMouseEnter={onEnter} onMouseLeave={onLeave} onMouseMove={onMove}
      role="button" tabIndex={0}
      onKeyDown={e=>(e.key==='Enter'||e.key===' ')&&onSelect()}
      style={{
        background:spotBg,
        border:`1px solid ${hover?'rgba(200,135,26,0.45)':'var(--bdr-default)'}`,
        borderRadius:'var(--r-2xl)', padding:'36px 32px 30px',
        cursor:'pointer', textAlign:'left',
        transform:cardT,
        transition: hover
          ? 'transform 0.07s linear, box-shadow 0.25s, border-color 0.2s, background 0.1s'
          : 'transform 0.55s var(--ease-spring), box-shadow 0.35s, border-color 0.3s, background 0.3s',
        boxShadow: hover
          ? '0 28px 70px rgba(0,0,0,0.75), 0 0 0 1px rgba(200,135,26,0.18), inset 0 1px 0 rgba(255,255,255,0.07)'
          : '0 10px 40px rgba(0,0,0,0.5)',
        outline:'none', userSelect:'none', position:'relative', overflow:'hidden',
      }}
    >
      {hover && <div aria-hidden="true" style={{ position:'absolute', left:0, right:0, height:'1px', background:'linear-gradient(90deg,transparent,rgba(200,135,26,0.7),transparent)', animation:'scan-sweep 1.8s ease-in-out infinite', pointerEvents:'none' }} />}

      {/* Mood dots */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'24px' }}>
        {Object.entries(MOOD_META).map(([key,m]) => (
          <div key={key} style={{ position:'relative' }}>
            {hover && key==='comfort' && <div key={pulse} style={{ position:'absolute', inset:'-6px', borderRadius:'50%', border:`1px solid ${m.color}`, animation:'shockwave 0.7s cubic-bezier(0.15,0,0.7,1) forwards', pointerEvents:'none' }} />}
            <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:`${m.color}1A`, border:`1px solid ${m.color}35`, display:'flex', alignItems:'center', justifyContent:'center', transition:'transform var(--d-slow) var(--ease-spring), box-shadow var(--d-base)', transform:hover?'scale(1.12)':'scale(1)', boxShadow:hover?`0 4px 16px ${m.color}28`:'none' }}>
              <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:m.color, display:'block' }} />
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ fontFamily:'var(--ff-display)', fontWeight:700, fontSize:'var(--fs-24)', letterSpacing:'-0.02em', color:'var(--text-1)', marginBottom:'10px', lineHeight:1.2 }}>
        Ruh Haline Göre Film
      </h3>
      <p style={{ fontSize:'var(--fs-14)', color:'var(--text-2)', lineHeight:1.7, marginBottom:'24px' }}>
        Nasıl hissettiğini ve ne tür bir şey izlemek istediğini yaz. AI sana özel gerçek bir film veya dizi önerir.
      </p>
      <div style={{ fontSize:'var(--fs-11)', color:'var(--text-3)', fontFamily:'var(--ff-mono)', marginBottom:'26px', lineHeight:1.55 }}>
        fun · adrenaline · emotional · comfort · thought-provoking
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'var(--accent)', fontSize:'var(--fs-15)', fontWeight:600, fontFamily:'var(--ff-display)' }}>
        <span>Başla</span>
        <span style={{ fontSize:'18px', transition:`transform var(--d-base) var(--ease-spring)`, transform:hover?'translateX(8px)':'translateX(0)' }}>→</span>
      </div>
    </div>
  );
}

// Keep FilmStripBg name for backward compat (now just empty)
function FilmStripBg() { return null; }

Object.assign(window, { HomeScreen, MoodEntryCard, FilmColumnsBackground, PosterCard, PosterColumn, FilmStripBg });
