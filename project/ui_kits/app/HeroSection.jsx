// HeroSection.jsx — Profindle landing hero
Object.assign(window, { HeroSection });

function HeroSection({ onExplore, onSignUp }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0E1017 0%, #0F6F73 100%)',
      padding: '120px 24px 80px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{ position:'absolute', top:-80, right:-80, width:500, height:500, borderRadius:'50%', background:'rgba(26,157,163,0.08)', pointerEvents:'none' }}></div>
      <div style={{ position:'absolute', bottom:-60, left:-40, width:300, height:300, borderRadius:'50%', background:'rgba(247,127,0,0.06)', pointerEvents:'none' }}></div>

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.08)', backdropFilter:'blur(8px)', borderRadius:999, padding:'6px 16px', marginBottom:24, border:'1px solid rgba(255,255,255,0.12)' }}>
            <span style={{ fontSize:11, fontWeight:700, background:'linear-gradient(90deg,#F77F00,#FF9A2E)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', letterSpacing:'0.06em', textTransform:'uppercase' }}>New</span>
            <span style={{ fontSize:13, color:'rgba(255,255,255,0.7)' }}>AI-powered professional matching</span>
          </div>

          <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'white', marginBottom: 20, textWrap: 'balance' }}>
            Your Professional Network,{' '}
            <span style={{ background:'linear-gradient(90deg,#2BBEC5,#F77F00)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              Reimagined
            </span>
          </h1>

          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, marginBottom: 36, maxWidth: 560, textWrap: 'pretty' }}>
            Connect with top professionals, showcase your expertise, and unlock opportunities built around your goals.
          </p>

          <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center', marginBottom: 64 }}>
            <button onClick={onSignUp} style={{
              fontFamily:'Inter, sans-serif', fontSize:15, fontWeight:700,
              background:'linear-gradient(135deg,#F77F00,#E06B00)', color:'white',
              border:'none', borderRadius:14, padding:'14px 32px', cursor:'pointer',
              boxShadow:'0 4px 20px rgba(247,127,0,0.35)',
            }}>Get Started Free</button>
            <button onClick={onExplore} style={{
              fontFamily:'Inter, sans-serif', fontSize:15, fontWeight:600,
              background:'rgba(255,255,255,0.08)', color:'white',
              border:'1.5px solid rgba(255,255,255,0.2)', borderRadius:14, padding:'14px 28px', cursor:'pointer',
              backdropFilter:'blur(8px)',
            }}>Explore Profiles →</button>
          </div>

          {/* Stats strip */}
          <div style={{ display:'flex', gap:48, justifyContent:'center', flexWrap:'wrap' }}>
            {[['50K+','Professionals'],['12K+','Companies'],['98%','Match Rate'],['4.9★','Rating']].map(([num, label]) => (
              <div key={label} style={{ textAlign:'center' }}>
                <div style={{ fontSize:26, fontWeight:800, background:'linear-gradient(90deg,#2BBEC5,#F77F00)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{num}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginTop:2, fontWeight:500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
