// PremiumBadge.jsx — Premium upgrade prompt
Object.assign(window, { PremiumBadge });

function PremiumBadge({ onUpgrade }) {
  return (
    <div style={{
      borderRadius:20, overflow:'hidden',
      background:'linear-gradient(135deg,#171A21 0%,#0F6F73 100%)',
      padding:'28px 24px', position:'relative',
    }}>
      <div style={{ position:'absolute', top:-20, right:-20, width:120, height:120, borderRadius:'50%', background:'rgba(247,127,0,0.12)', pointerEvents:'none' }}></div>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#F77F00,#E06B00)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <div>
          <div style={{ fontSize:15, fontWeight:700, color:'white' }}>Profindle Pro</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>Unlock premium features</div>
        </div>
      </div>
      <ul style={{ listStyle:'none', marginBottom:20 }}>
        {['Unlimited profile views','Priority in search results','Direct messaging','Advanced analytics'].map(f => (
          <li key={f} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'rgba(255,255,255,0.8)', padding:'4px 0' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A9DA3" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            {f}
          </li>
        ))}
      </ul>
      <button onClick={onUpgrade} style={{
        width:'100%', fontFamily:'Inter, sans-serif', fontSize:14, fontWeight:700,
        background:'linear-gradient(135deg,#F77F00,#E06B00)', color:'white',
        border:'none', borderRadius:12, padding:'12px 0', cursor:'pointer',
        boxShadow:'0 4px 16px rgba(247,127,0,0.3)',
      }}>Upgrade to Pro</button>
    </div>
  );
}
