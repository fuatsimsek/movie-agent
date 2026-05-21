// ─────────────────────────────────────────────────────────────────────────────
// Movie Agent — Root App (v3 · with detail screen)
// ─────────────────────────────────────────────────────────────────────────────

function ScreenTransition({ screenKey, children }) {
  const [vis, setVis] = React.useState(false);
  React.useEffect(() => {
    setVis(false);
    const t = setTimeout(() => setVis(true), 30);
    return () => clearTimeout(t);
  }, [screenKey]);
  return (
    <div style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'scale(1) translateY(0)' : 'scale(0.993) translateY(6px)',
      filter: vis ? 'blur(0)' : 'blur(3px)',
      transition: 'opacity 0.38s var(--ease-out), transform 0.38s var(--ease-out), filter 0.38s var(--ease-out)',
      height: '100%',
    }}>
      {children}
    </div>
  );
}

function App() {
  const [screen, setScreen]           = React.useState('home');
  const [analyzerMode, setMode]       = React.useState('recommend');
  const [detailResult, setDetailResult] = React.useState(null);

  const goAnalyzer = (mode) => { setMode(mode); setScreen('analyzer'); };
  const goDetail   = (result) => {
    // Enrich with platform before navigating
    const enriched = { ...result, platform: result.platform || getPlatform(result.title || '') };
    setDetailResult(enriched);
    setScreen('detail');
  };

  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: 'var(--bg-base)', position: 'relative' }}>

      {/* Grain overlay */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998, opacity: 0.025, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '180px 180px' }} />

      {screen === 'home' && (
        <ScreenTransition screenKey="home">
          <div style={{ height: '100vh', overflow: 'auto' }}>
            <HomeScreen onSelectMode={goAnalyzer} />
          </div>
        </ScreenTransition>
      )}

      {screen === 'analyzer' && (
        <ScreenTransition screenKey="analyzer">
          <AnalyzerScreen
            initialMode={analyzerMode}
            onBack={() => setScreen('home')}
            onShowDetail={goDetail}
          />
        </ScreenTransition>
      )}

      {screen === 'detail' && (
        <ScreenTransition screenKey="detail">
          <DetailScreen
            result={detailResult}
            onBack={() => setScreen('analyzer')}
          />
        </ScreenTransition>
      )}

      {/* Tweaks panel */}
      <MovieAgentTweaks />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
