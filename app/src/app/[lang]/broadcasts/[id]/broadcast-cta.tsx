'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface BroadcastCtaProps {
  broadcastId: string;
  lang: string;
  category: string;
  buyer: {
    name?: string;
    email?: string;
    phone?: string;
    line_id?: string;
  } | null;
  buyerName: string;
  signupHref: string;
}

function track(broadcastId: string, eventType: string) {
  fetch('/api/broadcasts/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ broadcastId, eventType }),
  }).catch(() => {});
}

export function BroadcastCta({ broadcastId, lang, category, buyer, buyerName, signupHref }: BroadcastCtaProps) {
  const isTh = lang === 'th';

  useEffect(() => {
    track(broadcastId, 'view');
  }, [broadcastId]);

  const hasContact = !!(buyer?.email || buyer?.phone || buyer?.line_id);

  return (
    <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E4E7ED', padding: '20px' }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>
        {isTh ? 'สนใจรับงานนี้?' : 'Interested in this project?'}
      </div>
      <div style={{ fontSize: '13px', color: '#6B7385', marginBottom: '16px', lineHeight: 1.6 }}>
        {isTh
          ? 'ติดต่อผู้ว่าจ้างโดยตรงผ่านช่องทางด้านล่าง'
          : 'Reach out to the buyer directly through the channels below.'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {buyer?.email && (
          <a
            href={`mailto:${buyer.email}?subject=Re: ${category} Request&body=Hi ${buyerName},%0D%0A%0D%0AI saw your broadcast request for ${category} on Profindle and I'd love to help.`}
            onClick={() => track(broadcastId, 'click_email')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22 7 12 13 2 7"/></svg>
            {isTh ? 'ตอบกลับทาง Email' : 'Reply via Email'}
          </a>
        )}
        {buyer?.phone && (
          <a
            href={`tel:${buyer.phone.replace(/\s/g, '')}`}
            onClick={() => track(broadcastId, 'click_phone')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', background: '#F0F9F9', color: '#0F6F73', border: '1.5px solid #2BBEC5', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.92 3.38C1.86 2.58 2.42 2 3.22 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.15 6.15l1.48-1.48a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            {isTh ? 'โทรหาผู้ว่าจ้าง' : 'Call the Buyer'} · {buyer.phone}
          </a>
        )}
        {buyer?.line_id && (
          <a
            href={`https://line.me/R/ti/p/${encodeURIComponent(buyer.line_id)}`}
            target="_blank" rel="noopener noreferrer"
            onClick={() => track(broadcastId, 'click_line')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', background: '#06C755', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M19.365 9.89c.50 0 .866.37.866.87s-.368.87-.866.87H17.61v1.05h1.754c.498 0 .866.37.866.87s-.368.87-.866.87H16.74a.87.87 0 0 1-.866-.87V8.14c0-.498.368-.868.866-.868h2.624c.498 0 .866.37.866.87s-.368.87-.866.87H17.61v.878h1.754zm-6.735 3.65a.868.868 0 0 1-.607-.247l-2.627-2.78v2.16a.866.866 0 1 1-1.732 0V8.14a.866.866 0 0 1 1.474-.618l2.627 2.78V8.14a.866.866 0 1 1 1.732 0v5.4a.868.868 0 0 1-.866.868v.002zm-5.74 0a.866.866 0 0 1-.866-.868V8.14a.866.866 0 1 1 1.732 0v5.4a.866.866 0 0 1-.866.868v-.002zM24 10.314C24 4.943 18.617.572 12 .572S0 4.943 0 10.314c0 4.814 4.27 8.842 10.035 9.608.392.084.923.258 1.058.592.12.302.079.776.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.07 9.436-6.966C23.176 14.143 24 12.33 24 10.314z"/></svg>
            {isTh ? 'ติดต่อผ่าน LINE' : 'Contact via LINE'}
          </a>
        )}
        {!hasContact && (
          <Link href={signupHref}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px 16px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
            {isTh ? 'สมัครสมาชิกเพื่อดูข้อมูลติดต่อ' : 'Sign up to view contact details'}
          </Link>
        )}
      </div>
    </div>
  );
}
