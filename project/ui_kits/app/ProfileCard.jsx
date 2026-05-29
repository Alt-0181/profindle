// ProfileCard.jsx — Profindle professional profile card
Object.assign(window, { ProfileCard });

const COLORS = ['linear-gradient(135deg,#0F6F73,#1A9DA3)', 'linear-gradient(135deg,#F77F00,#E06B00)', 'linear-gradient(135deg,#171A21,#0F6F73)', 'linear-gradient(135deg,#2BBEC5,#0F6F73)'];

function ProfileCard({ profile, onView, featured }) {
  const [hovered, setHovered] = React.useState(false);
  const color = COLORS[profile.colorIndex % COLORS.length];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onView(profile)}
      style={{
        background: 'white', borderRadius: 20, cursor: 'pointer',
        boxShadow: hovered ? '0 8px 32px rgba(15,111,115,0.16)' : '0 4px 16px rgba(23,26,33,0.09)',
        transform: hovered ? 'translateY(-3px) scale(1.01)' : 'translateY(0) scale(1)',
        transition: 'all 250ms cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden', position: 'relative',
        borderTop: featured ? '3px solid transparent' : 'none',
        borderImage: featured ? 'linear-gradient(90deg,#0F6F73,#F77F00) 1' : 'none',
      }}>
      {featured && <div style={{ height: 3, background: 'linear-gradient(90deg,#0F6F73,#F77F00)', position:'absolute', top:0, left:0, right:0 }}></div>}
      <div style={{ padding: '22px 20px 18px' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 18 }}>
            {profile.initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#171A21' }}>{profile.name}</span>
              {profile.verified && <svg width="14" height="14" viewBox="0 0 24 24" fill="#0F6F73"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#0F6F73" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>}
              {profile.premium && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: 'linear-gradient(135deg,#F77F00,#E06B00)', color: 'white' }}>PRO</span>}
            </div>
            <div style={{ fontSize: 13, color: '#6B7385', marginTop: 2 }}>{profile.role}</div>
            <div style={{ fontSize: 12, color: '#9AA0AE', marginTop: 1 }}>{profile.company}</div>
          </div>
        </div>

        <p style={{ fontSize: 13, color: '#444B5A', lineHeight: 1.55, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {profile.bio}
        </p>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {profile.skills.map(s => (
            <span key={s} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: '#F0F9F9', color: '#0F6F73' }}>{s}</span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          {[['Connections', profile.connections],['Projects', profile.projects],['Rate', profile.rate]].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize: 14, fontWeight: 700, background: 'linear-gradient(90deg,#0F6F73,#F77F00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{val}</div>
              <div style={{ fontSize: 11, color: '#9AA0AE' }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={e => { e.stopPropagation(); onView(profile); }} style={{
            flex: 1, fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
            background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)', color: 'white',
            border: 'none', borderRadius: 10, padding: '9px 0', cursor: 'pointer',
          }}>View Profile</button>
          <button onClick={e => e.stopPropagation()} style={{
            fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
            background: 'transparent', color: '#0F6F73', border: '1.5px solid #0F6F73',
            borderRadius: 10, padding: '9px 16px', cursor: 'pointer',
          }}>Connect</button>
        </div>
      </div>
    </div>
  );
}
