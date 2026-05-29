// Header.jsx — Profindle App Navigation
Object.assign(window, { Header });

function Header({ currentPage, onNavigate, user }) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,0.95)' : 'white',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: '1px solid #E4E7ED',
      transition: 'all 200ms cubic-bezier(0.4,0,0.2,1)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 24 }}>
        {/* Logo */}
        <div onClick={() => onNavigate('discover')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <svg width="24" height="32" viewBox="-3 -3 44 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.56 34.56C27.3966 34.56 34.56 27.3966 34.56 18.56C34.56 9.72345 27.3966 2.56 18.56 2.56C9.72344 2.56 2.56 9.72345 2.56 18.56C2.56 27.3966 9.72344 34.56 18.56 34.56Z" stroke="#0F6F73" strokeWidth="5.12" strokeLinecap="round"/>
            <path d="M18.56 8.96C23.8619 8.96 28.16 13.2581 28.16 18.56" stroke="#F77F00" strokeWidth="5.12" strokeLinecap="round"/>
            <path d="M5.76001 47.36C5.76001 47.36 5.76001 34.56 18.56 34.56" stroke="#0F6F73" strokeWidth="5.12" strokeLinecap="round"/>
            <path d="M18.56 34.56L31.36 47.36" stroke="#0F6F73" strokeWidth="5.12" strokeLinecap="round"/>
            <path d="M18.56 38.4C20.6807 38.4 22.4 36.6808 22.4 34.56C22.4 32.4392 20.6807 30.72 18.56 30.72C16.4392 30.72 14.72 32.4392 14.72 34.56C14.72 36.6808 16.4392 38.4 18.56 38.4Z" fill="#F77F00"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>
            <span style={{ color: '#0F6F73' }}>Pro</span><span style={{ color: '#F77F00' }}>find</span><span style={{ color: '#0F6F73' }}>le</span>
          </span>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: 4, flex: 1 }}>
          {[['discover','Discover'],['network','Network'],['jobs','Jobs']].map(([id, label]) => (
            <button key={id} onClick={() => onNavigate(id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              color: currentPage === id ? '#0F6F73' : '#444B5A',
              background: currentPage === id ? '#F0F9F9' : 'transparent',
              fontFamily: 'Inter, sans-serif',
              transition: 'all 150ms',
            }}>{label}</button>
          ))}
        </nav>

        {/* Search */}
        <div style={{ position: 'relative', flex: '0 0 240px' }}>
          <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9AA0AE" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Search professionals..." style={{
            fontFamily: 'Inter, sans-serif', fontSize: 13, padding: '8px 12px 8px 36px',
            border: '1.5px solid #E4E7ED', borderRadius: 10, width: '100%', outline: 'none', color: '#171A21',
          }} onFocus={e => e.target.style.borderColor = '#0F6F73'} onBlur={e => e.target.style.borderColor = '#E4E7ED'} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          <button onClick={() => onNavigate('upgrade')} style={{
            fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
            background: 'linear-gradient(135deg,#F77F00,#E06B00)', color: 'white',
            border: 'none', borderRadius: 10, padding: '8px 16px', cursor: 'pointer',
          }}>✦ Upgrade</button>
          <div onClick={() => onNavigate('profile')} style={{
            width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
            background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 14,
          }}>{user?.initials || 'AM'}</div>
        </div>
      </div>
    </header>
  );
}
