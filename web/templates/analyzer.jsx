// ─────────────────────────────────────────────────────────────────────────────
// Movie Agent — Analyzer Screen
// ─────────────────────────────────────────────────────────────────────────────

const SAMPLE_PLOT = "A retired detective is drawn back into the world of crime when a mysterious painting surfaces at a local auction — a painting connected to a murder case that was closed 20 years ago. As he digs deeper, he unravels dark secrets buried by the town's most respected families.";

const LOADING_STEPS = {
  genre:     ['Model bağlantısı kuruluyor…', 'Metin tokenize ediliyor…', 'Etiketler çıkarılıyor…'],
  mood:      ['Model bağlantısı kuruluyor…', 'Türler sınıflandırılıyor…', 'Ruh hali eşleştiriliyor…'],
  recommend: ['Model bağlantısı kuruluyor…', 'Ruh hali anlaşılıyor…', 'Film önerisi hazırlanıyor…'],
};

function mockAnalyze(mode, inputs) {
  if (mode === 'genre') {
    return {
      type: 'genre',
      genres: ['mystery', 'neo noir', 'suspenseful'],
      json: { genres: ['mystery', 'neo noir', 'suspenseful'] },
    };
  }
  if (mode === 'mood') {
    const userMood = inputs.selectedMood || 'adrenaline';
    const detected = ['adrenaline', 'thought-provoking'];
    const match = detected.includes(userMood);
    return {
      type: 'mood', match,
      reason: match
        ? 'Bu film gizem ve gerilim unsurlarıyla adrenalin arayan izleyiciye mükemmel hitap ediyor. Karanlık atmosferi ve beklenmedik dönüşleriyle izleyiciyi sürekli tetikte tutar.'
        : 'Film ağır noir atmosferi ve gerilim odaklı anlatısıyla hafif veya duygusal bir izleme deneyimi arayanlar için uygun değil.',
      detectedMoods: detected,
      genres: ['mystery', 'neo noir', 'suspenseful'],
      json: {
        match,
        detected_moods: detected,
        genres: ['mystery', 'neo noir', 'suspenseful'],
        reason: match
          ? 'Adrenalin arayan izleyici için uygun — gerilim ve gizem ağır basıyor.'
          : 'Seçilen ruh haliyle örtüşen tür etiketleri bulunamadı.',
      },
    };
  }
  // recommend
  return {
    type: 'recommend',
    title: 'Cinema Paradiso',
    year: 1988,
    contentType: 'Film',
    platform: 'mubi',
    reason: "Nostaljik ve sıcak atmosferiyle yorgun bir akşam için ideal. Tornatore'nin bu başyapıtı sinema sevgisini ve geçmişin özlemini konu alıyor; hafif ama derin bir deneyim sunuyor.",
    moodCategory: 'comfort',
    genres: ['feel-good', 'inspiring', 'sentimental'],
    json: {
      title: 'Cinema Paradiso',
      year: 1988,
      type: 'film',
      mood_category: 'comfort',
      platform: 'mubi',
      reason: "Nostaljik ve sıcak atmosferiyle yorgun bir akşam için ideal.",
    },
  };
}

function msleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── API Integration ────────────────────────────────────────────────────────────
const MOOD_MAP = {
  'fun': 'fun',
  'adrenaline': 'adrenaline',
  'emotional': 'emotional',
  'comfort': 'comfort',
  'thought-provoking': 'thought-provoking',
};

async function callApiFind(moodText) {
  const response = await fetch('/api/find', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: moodText }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'API hatası');
  }
  const data = await response.json();

  // Map Flask response to UI format
  const contentType = data.recommendation?.type === 'dizi' ? 'Dizi' : 'Film';
  const moodCategory = data.detected_moods?.[0] || 'comfort';
  const platform = getPlatform(data.recommendation?.title || '');

  return {
    type: 'recommend',
    title: data.recommendation?.title || '?',
    year: data.recommendation?.year || new Date().getFullYear(),
    contentType,
    platform,
    reason: data.recommendation?.reason || '',
    moodCategory,
    genres: data.genres || [],
    json: {
      title: data.recommendation?.title,
      year: data.recommendation?.year,
      type: data.recommendation?.type,
      reason: data.recommendation?.reason,
      plot: data.recommendation?.plot,
      mood_category: moodCategory,
      platform,
      layers: {
        emotion: data.emotion,
        recommendation: data.recommendation,
        genres: data.genres,
        detected_moods: data.detected_moods,
      },
    },
  };
}

// ── Analyzer Screen ────────────────────────────────────────────────────────────
function AnalyzerScreen({ initialMode, onBack, onShowDetail }) {
  const [mode, setMode]               = React.useState('recommend');
  const [moodText, setMoodText]       = React.useState('');
  const [moodError, setMoodError]     = React.useState('');

  const [analyzing, setAnalyzing]   = React.useState(false);
  const [loadingStep, setStep]      = React.useState('');
  const [loadingPct, setPct]        = React.useState(0);

  const [result, setResult]         = React.useState(null);
  const [resultVisible, setRV]      = React.useState(false);

  // Reset on screen change
  React.useEffect(() => {
    setResult(null); setRV(false);
    setMoodError('');
  }, []);

  const validate = () => {
    if (!moodText.trim()) {
      setMoodError('Nasıl hissettiğinizi yazın.');
      return false;
    }
    if (moodText.trim().length < 10) {
      setMoodError('Biraz daha detay yaz (en az 10 karakter).');
      return false;
    }
    return true;
  };

  const analyze = async () => {
    if (!validate()) return;
    setAnalyzing(true); setResult(null); setRV(false);
    const steps = LOADING_STEPS[mode];

    try {
      for (let i = 0; i < steps.length; i++) {
        setStep(steps[i]);
        setPct(Math.round(((i + 1) / (steps.length + 1)) * 90));
        await msleep(650 + Math.random() * 350);
      }
      setPct(100); await msleep(280);

      let r = await callApiFind(moodText);

      setResult(r); setAnalyzing(false);
      setTimeout(() => setRV(true), 50);
    } catch (error) {
      setMoodError(error.message || 'Bir hata oluştu');
      setAnalyzing(false);
    }
  };

  // Tabs removed — only 'recommend' mode is exposed.
  const TABS = [];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 'var(--nav-h)', flexShrink: 0,
        borderBottom: '1px solid var(--bdr-subtle)',
        background: 'rgba(7,7,15,0.92)', backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)', zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button variant="ghost" size="sm" onClick={onBack}
            style={{ color: 'var(--text-3)', paddingLeft: '6px', gap: '4px' }}>
            <ArrowLeftIcon size={14} />
            <span>Geri</span>
          </Button>
          <span style={{ width: '1px', height: '18px', background: 'var(--bdr-default)' }} />
          <span style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 'var(--fs-14)', color: 'var(--text-2)' }}>
            Movie Agent
          </span>
        </div>
        <OfflineBadge />
      </nav>

      {/* Main split */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left Panel ── */}
        <div style={{
          width: 'var(--sidebar-w)', minWidth: '320px', flexShrink: 0,
          borderRight: '1px solid var(--bdr-subtle)',
          display: 'flex', flexDirection: 'column',
          background: 'var(--bg-surface)', overflow: 'auto',
        }}>
          {/* Mode Tabs — removed; only Recommend remains */}

          {/* Input form */}
          <div style={{ flex: 1, padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <InfoBox text="Ruh halinizi açıklayın — yapay zeka sana uygun bir film önerecek." />
            <Textarea
              label="BUGÜN NASIL HİSSEDİYORSUN?"
              placeholder="Örn: Çok yorucu bir gündü, hem mutsuzum hem yorgunum, biraz dağılmak istiyorum ama kafamı yormayan bir şey olsun…"
              value={moodText} onChange={v => { setMoodText(v); setMoodError(''); }}
              rows={8} maxLength={500} error={moodError}
              hint="Kendi cümlelerinle yaz — AI Türkçe anlıyor"
            />

            {/* Analyze button */}
            <Button variant="primary" size="lg" fullWidth loading={analyzing} onClick={analyze}
              style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, letterSpacing: '0.01em', marginTop: '4px' }}>
              {analyzing ? null : '→ Bana Bir Film Bul'}
            </Button>

            {/* Left panel mini status */}
            {analyzing && (
              <div key={loadingStep} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--bdr-subtle)', borderRadius: 'var(--r-md)', animation: 'fade-blur-up 0.3s var(--ease-out)' }}>
                <span style={{ display: 'inline-flex', gap: '3px' }}><LoadingDots size={3} /></span>
                <span style={{ fontSize: 'var(--fs-12)', color: 'var(--text-3)' }}>{loadingStep}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div style={{ flex: 1, overflow: 'hidden', background: 'var(--bg-base)', position: 'relative', minHeight: 0 }}>
          {/* Empty state */}
          {!analyzing && !result && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmptyState
                title="Analiz bekleniyor"
                subtitle={
                  mode === 'genre'     ? 'Film özetini yapıştırın ve türleri keşfedin.' :
                  mode === 'mood'      ? 'Özeti ve ruh halinizi girin, uyumu kontrol edin.' :
                  'Ruh halinizi ve tercihlerinizi yazın, öneri alın.'
                }
              />
            </div>
          )}
          {/* Cinematic loader — fills panel */}
          {analyzing && !result && <ResultSkeleton step={loadingStep} pct={loadingPct} />}
          {/* Results — scrollable */}
          {result && (
            <div style={{ position: 'absolute', inset: 0, overflow: 'auto', animation: 'float-up-in 0.45s var(--ease-out)' }}>
              {result.type === 'genre'     && <GenreResult result={result} visible={resultVisible} />}
              {result.type === 'mood'      && <MoodResult  result={result} visible={resultVisible} />}
              {result.type === 'recommend' && <RecommendResult result={result} visible={resultVisible} onShowDetail={onShowDetail} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Input Forms ─────────────────────────────────────────────────────────────────

function GenreForm({ plot, setPlot, plotError, setPlotError }) {
  return (
    <>
      <InfoBox text="Film özetini (plot summary) aşağıya yapıştırın. Model 1–3 tür etiketi çıkaracak." />
      <Textarea
        label="FİLM ÖZETİ"
        placeholder={`Örn: "${SAMPLE_PLOT.slice(0, 80)}…"`}
        value={plot} onChange={v => { setPlot(v); setPlotError(''); }}
        rows={11} maxLength={2000} error={plotError}
        hint="İngilizce veya Türkçe · MPST 71-tag sözlüğü"
      />
    </>
  );
}

function MoodForm({ plot, setPlot, plotError, setPlotError, selectedMood, setSelectedMood, moodText, setMoodText, moodError, setMoodError }) {
  return (
    <>
      <Textarea
        label="FİLM ÖZETİ"
        placeholder="Uygunluğunu kontrol etmek istediğiniz filmin özetini yazın…"
        value={plot} onChange={v => { setPlot(v); setPlotError(''); }}
        rows={5} maxLength={2000} error={plotError}
      />
      <div>
        <div style={{ fontSize: 'var(--fs-11)', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '10px' }}>
          RUH HALİNİ SEÇ
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          {Object.keys(MOOD_META).map(m => (
            <MoodChip key={m} mood={m} selected={selectedMood === m}
              onClick={() => { setSelectedMood(selectedMood === m ? null : m); setMoodError(''); }}
            />
          ))}
        </div>
        <Textarea
          placeholder='Veya serbest yaz: "Yorgunum, komedi istiyorum…"'
          value={moodText} onChange={v => { setMoodText(v); setMoodError(''); }}
          rows={2} maxLength={300} error={moodError}
        />
      </div>
    </>
  );
}

function RecommendForm({ moodText, setMoodText, preferences, setPreferences, moodError, setMoodError }) {
  return (
    <>
      <InfoBox text="İki alanı doldurun — AI size özel gerçek bir film veya dizi önerecek." />
      <Textarea
        label="BUGÜN NASIL HİSSEDİYORSUN?"
        placeholder="Örn: Yorgunum, hafif bir şey izlemek istiyorum. Gülmek iyi gelir…"
        value={moodText} onChange={v => { setMoodText(v); setMoodError(''); }}
        rows={4} maxLength={500} error={moodError}
        hint="Kendi cümlelerinle yaz — AI Türkçe anlıyor"
      />
      <Textarea
        label="NASIL BİR FİLM İSTİYORSUN?"
        placeholder="Örn: İtalyan sineması, eğlenceli, 2 saatten kısa, renkli atmosfer…"
        value={preferences} onChange={v => setPreferences(v)}
        rows={4} maxLength={500}
        hint="Tür, atmosfer, beklenti — ne istersen"
      />
    </>
  );
}

// ── Info Box ───────────────────────────────────────────────────────────────────
function InfoBox({ text }) {
  return (
    <div style={{
      fontSize: 'var(--fs-12)', color: 'var(--text-3)', lineHeight: 1.6,
      padding: '10px 13px', background: 'var(--bg-elevated)',
      borderRadius: 'var(--r-md)', border: '1px solid var(--bdr-subtle)',
    }}>
      {text}
    </div>
  );
}

// ── Result Panels ──────────────────────────────────────────────────────────────

// ── Cinematic Loader ──────────────────────────────────────────────────────────
function ResultSkeleton({ step = '', pct = 0 }) {
  const r = 42, circ = 2 * Math.PI * r, offset = circ * (1 - pct / 100);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', overflow: 'hidden' }}>
      {[0,1,2,3].map(i => (
        <div key={i} aria-hidden="true" style={{
          position: 'absolute', left: 0, right: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(200,135,26,0.12) 25%, rgba(200,135,26,0.4) 50%, rgba(200,135,26,0.12) 75%, transparent 100%)',
          animation: `scan-line-move ${3.2 + i * 1.1}s ${i * 0.85}s linear infinite`,
        }} />
      ))}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 65% 65% at 50% 50%, transparent 20%, rgba(7,7,15,0.75) 100%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="160" height="160" viewBox="0 0 160 160" aria-hidden="true" style={{ position: 'absolute', inset: 0, animation: 'ring-spin 12s linear infinite' }}>
          <circle cx="80" cy="80" r="72" fill="none" stroke="var(--accent)" strokeWidth="0.7" strokeDasharray="12 18" opacity="0.32" />
        </svg>
        <svg width="160" height="160" viewBox="0 0 160 160" aria-hidden="true" style={{ position: 'absolute', inset: 0, animation: 'ring-spin 8s linear infinite reverse' }}>
          <circle cx="80" cy="80" r="57" fill="none" stroke="var(--bdr-strong)" strokeWidth="0.5" strokeDasharray="5 24" />
        </svg>
        <svg width="160" height="160" viewBox="0 0 160 160" aria-hidden="true" style={{ position: 'absolute', inset: 0, animation: 'corner-pulse 2.5s ease-in-out infinite' }}>
          <path d="M22,36 L22,22 L36,22" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
          <path d="M124,22 L138,22 L138,36" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
          <path d="M22,124 L22,138 L36,138" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
          <path d="M124,138 L138,138 L138,124" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
          <line x1="72" y1="80" x2="88" y2="80" stroke="var(--accent)" strokeWidth="0.8" opacity="0.35" />
          <line x1="80" y1="72" x2="80" y2="88" stroke="var(--accent)" strokeWidth="0.8" opacity="0.35" />
          <circle cx="80" cy="80" r="3" fill="none" stroke="var(--accent)" strokeWidth="0.8" opacity="0.35" />
        </svg>
        <svg width="104" height="104" viewBox="0 0 104 104" style={{ position: 'relative', zIndex: 2 }}>
          <circle cx="52" cy="52" r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth="2.5" />
          <circle cx="52" cy="52" r={r} fill="none"
            stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '52px 52px', transition: 'stroke-dashoffset 0.6s var(--ease-out)', filter: 'drop-shadow(0 0 6px rgba(200,135,26,0.5))' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3, color: pct > 40 ? 'var(--accent)' : 'var(--text-3)', transition: 'color 0.5s var(--ease-out)', filter: pct > 40 ? 'drop-shadow(0 0 8px rgba(200,135,26,0.6))' : 'none' }}>
          <FilmIcon size={26} />
        </div>
        {pct > 20 && <div aria-hidden="true" style={{ position: 'absolute', inset: '24px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,135,26,0.15) 0%, transparent 70%)', animation: 'glow-pulse 2.2s ease-in-out infinite' }} />}
      </div>
      <div key={step} style={{ marginTop: '36px', textAlign: 'center', position: 'relative', zIndex: 1, animation: 'fade-blur-up 0.4s var(--ease-out)' }}>
        <div style={{ fontSize: 'var(--fs-14)', color: 'var(--text-1)', fontWeight: 500, marginBottom: '7px', letterSpacing: '0.01em' }}>{step || 'Başlatılıyor…'}</div>
        <div style={{ fontSize: 'var(--fs-11)', color: 'var(--text-3)', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em' }}>{pct}%</div>
      </div>
      <div style={{ width: '200px', height: '1px', background: 'var(--bg-overlay)', marginTop: '22px', position: 'relative', zIndex: 1, borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-dim), var(--accent-lt))', width: `${pct}%`, transition: 'width var(--d-slow) var(--ease-out)', boxShadow: '0 0 8px var(--accent-glow)', borderRadius: 'var(--r-full)' }} />
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 'var(--fs-11)', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'var(--ff-mono)', marginBottom: '12px' }}>
      {children}
    </div>
  );
}

function Divider({ visible }) {
  return <div style={{ height: '1px', background: 'var(--bdr-subtle)', opacity: visible ? 1 : 0, transition: 'opacity var(--d-slow) 0.3s' }} />;
}

function RevealBlock({ visible, delay = 0, children }) {
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      filter: visible ? 'blur(0px)' : 'blur(6px)',
      transition: `opacity var(--d-slow) ${delay}ms var(--ease-out), transform var(--d-slow) ${delay}ms var(--ease-out), filter var(--d-slow) ${delay}ms var(--ease-out)`,
    }}>
      {children}
    </div>
  );
}

function GenreResult({ result, visible }) {
  return (
    <div style={{ padding: '28px' }}>
      <RevealBlock visible={visible} delay={0}>
        <SectionLabel>Tespit edilen türler</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '26px' }}>
          {result.genres.map((g, i) => <GenreChip key={g} label={g} index={i} />)}
        </div>
      </RevealBlock>
      <Divider visible={visible} />
      <RevealBlock visible={visible} delay={180}>
        <div style={{ marginTop: '22px' }}>
          <JsonViewer data={result.json} visible={visible} />
        </div>
        {visible && <DevNotesGenre />}
      </RevealBlock>
    </div>
  );
}

function MoodResult({ result, visible }) {
  return (
    <div style={{ padding: '28px' }}>
      <RevealBlock visible={visible} delay={0}>
        <div style={{ marginBottom: '22px' }}>
          <MatchBadge match={result.match} visible={visible} />
        </div>
      </RevealBlock>
      <RevealBlock visible={visible} delay={120}>
        <div style={{ padding: '14px 18px', marginBottom: '22px', background: 'var(--bg-surface)', borderRadius: 'var(--r-md)', borderLeft: `3px solid ${result.match ? 'var(--success)' : 'var(--error)'}` }}>
          <SectionLabel>Model gerekçesi</SectionLabel>
          <p style={{ fontSize: 'var(--fs-14)', color: 'var(--text-1)', lineHeight: 1.68 }}>{result.reason}</p>
        </div>
      </RevealBlock>
      <RevealBlock visible={visible} delay={220}>
        <div style={{ marginBottom: '22px' }}>
          <SectionLabel>Tespit edilen ruh halleri</SectionLabel>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {result.detectedMoods.map(m => <MoodBadge key={m} mood={m} />)}
          </div>
        </div>
        <Divider visible={visible} />
        <div style={{ marginTop: '22px' }}>
          <JsonViewer data={result.json} visible={visible} />
        </div>
      </RevealBlock>
    </div>
  );
}

function RecommendResult({ result, visible, onShowDetail }) {
  const [expandedLayer, setExpandedLayer] = React.useState(null);

  const layers = [
    {
      num: 1,
      title: 'Duygu analizi',
      model: 'llama3.1:8b',
      data: result.json?.layers?.emotion,
      content: result.json?.layers?.emotion ? (
        <>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: 'var(--text-2)' }}>Özet:</strong> {result.json.layers.emotion.summary}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: 'var(--text-2)' }}>Enerji:</strong> <span className="badge" style={{ display: 'inline-block', background: 'var(--info-bg)', color: 'var(--info)', padding: '3px 8px', borderRadius: 'var(--r-full)', fontSize: 'var(--fs-12)', marginLeft: '6px' }}>{result.json.layers.emotion.energy_level}</span>
            {' · '}
            <strong style={{ color: 'var(--text-2)' }}>Ruh hali:</strong> <span className="badge" style={{ display: 'inline-block', background: 'var(--info-bg)', color: 'var(--info)', padding: '3px 8px', borderRadius: 'var(--r-full)', fontSize: 'var(--fs-12)', marginLeft: '6px' }}>{result.json.layers.emotion.mood_valence}</span>
          </div>
          <div style={{ marginBottom: '6px' }}>
            <strong style={{ color: 'var(--text-2)' }}>İhtiyaç:</strong> {(result.json.layers.emotion.needs || []).join(', ') || '—'}
          </div>
          <div>
            <strong style={{ color: 'var(--text-2)' }}>Kaçınma:</strong> {(result.json.layers.emotion.avoid || []).join(', ') || '—'}
          </div>
        </>
      ) : null,
    },
    {
      num: 2,
      title: 'Film önerisi',
      model: 'llama3.1:8b',
      data: result.json?.layers?.recommendation,
      content: result.json?.layers?.recommendation ? (
        <>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: 'var(--text-2)' }}>Önerilen:</strong> {result.json.layers.recommendation.title} ({result.json.layers.recommendation.year})
          </div>
          <div>
            <strong style={{ color: 'var(--text-2)' }}>Konu:</strong><br/>
            <span style={{ color: 'var(--text-3)', fontSize: 'var(--fs-13)', lineHeight: 1.6 }}>{result.json.layers.recommendation.plot}</span>
          </div>
        </>
      ) : null,
    },
    {
      num: 3,
      title: 'Tür tahmini',
      model: 'movie-agent (fine-tuned)',
      data: result.json?.layers?.genres,
      content: result.json?.layers?.genres ? (
        <div>
          <strong style={{ color: 'var(--text-2)' }}>MPST etiketleri:</strong>
          <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {result.json.layers.genres.map((g, i) => <GenreChip key={g} label={g} index={i} />)}
          </div>
        </div>
      ) : null,
    },
    {
      num: 4,
      title: 'Mood eşleşmesi',
      model: 'mood_map.json',
      data: result.json?.layers?.detected_moods,
      content: result.json?.layers?.detected_moods ? (
        <div>
          <strong style={{ color: 'var(--text-2)' }}>Tespit edilen mood'lar:</strong>
          <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {result.json.layers.detected_moods.map(m => (
              <span key={m} style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--accent-mute)', color: 'var(--accent-text)', padding: '4px 10px', borderRadius: 'var(--r-full)', fontSize: 'var(--fs-12)', fontFamily: 'var(--ff-mono)' }}>
                {m}
              </span>
            ))}
          </div>
        </div>
      ) : null,
    },
    {
      num: 5,
      title: 'Sentez',
      model: 'deterministik',
      data: result.json,
      content: (
        <div style={{ fontSize: 'var(--fs-13)', color: 'var(--text-2)', lineHeight: 1.6 }}>
          Filmin tespit edilen mood'ları ({(result.json?.layers?.detected_moods || []).join(', ') || 'belirsiz'}) ile kullanıcının ihtiyaçları {result.json?.layers?.emotion?.needs?.length && result.json?.layers?.detected_moods?.length ? 'örtüşüyor' : 'kısmen örtüşüyor'}.
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '28px' }}>
      {/* Film recommendation card */}
      <RevealBlock visible={visible} delay={0}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bdr-default)', borderRadius: 'var(--r-xl)', padding: '26px', marginBottom: '28px', boxShadow: visible ? 'var(--sh-md)' : 'none', transition: 'box-shadow var(--d-slow)' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--fs-10)', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-3)', background: 'var(--bg-elevated)', padding: '3px 9px', borderRadius: 'var(--r-full)', border: '1px solid var(--bdr-subtle)', fontFamily: 'var(--ff-mono)' }}>{result.contentType}</span>
            <MoodBadge mood={result.moodCategory} />
          </div>
          <h2 style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: 'var(--fs-32)', letterSpacing: '-0.03em', lineHeight: 1.08, color: 'var(--text-1)', marginBottom: '5px' }}>{result.title}</h2>
          <div style={{ fontSize: 'var(--fs-13)', color: 'var(--text-3)', fontFamily: 'var(--ff-mono)', marginBottom: '18px' }}>{result.year}</div>
          <p style={{ fontSize: 'var(--fs-14)', color: 'var(--text-2)', lineHeight: 1.72, marginBottom: '18px' }}>{result.reason}</p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {result.genres.map((g, i) => <GenreChip key={g} label={g} index={i} />)}
          </div>
        </div>
      </RevealBlock>

      {/* 5-layer analysis */}
      <RevealBlock visible={visible} delay={120}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: 'var(--fs-11)', fontWeight: 600, color: 'var(--accent-text)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px', fontFamily: 'var(--ff-mono)' }}>
            YAPAY ZEKA'NIN DÜŞÜNCE SÜRECİ
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {layers.map((layer, i) => (
              <div key={i} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bdr-subtle)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                <button
                  onClick={() => setExpandedLayer(expandedLayer === i ? null : i)}
                  style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background var(--d-fast)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent)', color: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--fs-13)', flexShrink: 0 }}>
                    {layer.num}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-1)', marginBottom: '2px' }}>{layer.title}</div>
                    <div style={{ fontSize: 'var(--fs-12)', color: 'var(--text-3)', fontFamily: 'var(--ff-mono)' }}>{layer.model}</div>
                  </div>
                  <span style={{ display: 'inline-block', transition: `transform var(--d-fast)`, transform: expandedLayer === i ? 'rotate(90deg)' : 'rotate(0deg)', color: 'var(--text-3)' }}>▶</span>
                </button>
                {expandedLayer === i && (
                  <div style={{ padding: '16px 16px 16px 56px', borderTop: '1px solid var(--bdr-subtle)', background: 'var(--bg-base)', fontSize: 'var(--fs-13)', color: 'var(--text-2)', lineHeight: 1.7 }}>
                    {layer.content || '—'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </RevealBlock>

      <RevealBlock visible={visible} delay={240}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '22px', flexWrap: 'wrap' }}>
          <Button variant="primary" size="md" onClick={() => onShowDetail && onShowDetail(result)}>Detaylı Kartı Gör</Button>
          <Button variant="secondary" size="md">Paylaş</Button>
        </div>
        <Divider visible={visible} />
        <div style={{ marginTop: '22px' }}>
          <JsonViewer data={result.json} visible={visible} />
        </div>
      </RevealBlock>
    </div>
  );
}

// ── Inline Dev Notes (Genre) ───────────────────────────────────────────────────
function DevNotesGenre() {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ marginTop: '22px' }}>
      <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 'var(--fs-11)', fontFamily: 'var(--ff-mono)', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 0' }}>
        <span style={{ display: 'inline-block', transition: `transform var(--d-fast)`, transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
        DEV NOTES
      </button>
      {open && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bdr-subtle)', borderRadius: 'var(--r-md)', padding: '14px 16px', marginTop: '6px', fontSize: 'var(--fs-12)', fontFamily: 'var(--ff-mono)', color: 'var(--text-2)', lineHeight: 1.75 }}>
          <div style={{ color: 'var(--accent-text)', fontWeight: 600, marginBottom: '8px' }}>GenreResult · v1.0</div>
          <div><span style={{ color: 'var(--text-3)' }}>API:</span>  POST /api/classify — body: {'{ plot: string }'}</div>
          <div><span style={{ color: 'var(--text-3)' }}>Response:</span>  {'{ genres: string[], raw: string }'}</div>
          <div><span style={{ color: 'var(--text-3)' }}>Chip anim:</span>  stagger 100ms · ease-spring · scale 0.8→1</div>
          <div><span style={{ color: 'var(--text-3)' }}>Tokens:</span>  --accent-mute bg, --accent-glow border, --accent-text color</div>
          <div><span style={{ color: 'var(--text-3)' }}>States:</span>  empty · loading (skeleton) · result · error</div>
          <div><span style={{ color: 'var(--text-3)' }}>Font:</span>  chips → JetBrains Mono 500 · labels → Space Grotesk</div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  AnalyzerScreen, GenreForm, MoodForm, RecommendForm,
  InfoBox, GenreResult, MoodResult, RecommendResult,
  ResultSkeleton, SectionLabel, DevNotesGenre,
  mockAnalyze, LOADING_STEPS,
});
