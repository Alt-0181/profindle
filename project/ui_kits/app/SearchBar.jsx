// SearchBar.jsx — Profindle search + filter
Object.assign(window, { SearchBar });

function SearchBar({ query, onQuery, activeFilter, onFilter }) {
  const filters = ['All','Design','Engineering','Marketing','Product','Finance'];
  return (
    <div style={{ background:'white', borderBottom:'1px solid #E4E7ED', padding:'16px 24px' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ position:'relative', maxWidth:560 }}>
          <svg style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9AA0AE" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            value={query} onChange={e => onQuery(e.target.value)}
            placeholder="Search by name, role, skill, or company…"
            style={{ fontFamily:'Inter, sans-serif', fontSize:14, padding:'11px 14px 11px 42px', border:'1.5px solid #E4E7ED', borderRadius:12, width:'100%', outline:'none', color:'#171A21' }}
            onFocus={e => e.target.style.borderColor='#0F6F73'}
            onBlur={e => e.target.style.borderColor='#E4E7ED'}
          />
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {filters.map(f => (
            <button key={f} onClick={() => onFilter(f)} style={{
              fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:500,
              padding:'6px 16px', borderRadius:999, cursor:'pointer',
              border: activeFilter===f ? '1.5px solid #0F6F73' : '1.5px solid #E4E7ED',
              background: activeFilter===f ? '#F0F9F9' : 'transparent',
              color: activeFilter===f ? '#0F6F73' : '#444B5A',
              transition:'all 150ms',
            }}>{f}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
