'use client';
import { useState } from 'react';
import { LineContactRow } from './line-contact-row';

// Fire-and-forget anonymous click log. keepalive lets it complete even as the
// browser navigates to the mailto:/tel:/LINE target, so the buyer is never delayed.
function track(companyId: string, channel: string) {
  try {
    fetch('/api/contact-click', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ companyId, channel }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* never block the buyer */
  }
}

const rowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
  border: '1px solid #E4E7ED', borderRadius: '10px', textDecoration: 'none',
  color: '#444B5A', fontSize: '13px',
};

export function ContactCard({ companyId, email, phone, website, lineId, isTh }: {
  companyId: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  lineId: string | null;
  isTh: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const hasAny = Boolean(email || phone || website || lineId);

  return (
    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '20px' }}>
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#171A21', marginBottom: '14px' }}>{isTh ? 'ติดต่อผู้ให้บริการนี้' : 'Contact this provider'}</div>

      {!hasAny ? (
        <p style={{ fontSize: '13px', color: '#9AA0AE', textAlign: 'center', padding: '8px 0', margin: 0 }}>{isTh ? 'ยังไม่มีข้อมูลติดต่อ' : 'No contact info yet'}</p>
      ) : !revealed ? (
        // One tap reveals everything instantly (no waiting) AND records interest.
        <button
          type="button"
          onClick={() => { setRevealed(true); track(companyId, 'reveal'); }}
          style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          {isTh ? 'ดูข้อมูลติดต่อ' : 'View contact'}
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {email && (
            <a href={`mailto:${email}`} onClick={() => track(companyId, 'email')} style={rowStyle}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              {email}
            </a>
          )}
          {phone && (
            <a href={`tel:${phone}`} onClick={() => track(companyId, 'phone')} style={rowStyle}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              {phone}
            </a>
          )}
          {website && (
            <a href={website} target="_blank" rel="noopener noreferrer" onClick={() => track(companyId, 'website')} style={rowStyle}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              {website.replace(/^https?:\/\//, '')}
            </a>
          )}
          {lineId && (
            <div onClick={() => track(companyId, 'line')}>
              <LineContactRow raw={lineId} isTh={isTh} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
