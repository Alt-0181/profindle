'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Phase = 'loading' | 'need-signin' | 'set-password' | 'done' | 'notfound';

export function AcceptInviteClient({ lang, welcome }: { lang: string; welcome: boolean }) {
  const isTh = lang === 'th';
  const router = useRouter();
  const supabase = createClient();

  const [phase, setPhase] = useState<Phase>('loading');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let handled = false;

    // Establish the invite session, then activate the membership. The session
    // may arrive as a PKCE ?code to exchange, or be auto-detected from the URL
    // hash — mirror the reset-password page and handle both.
    const proceed = async (session: { user: { email?: string | null }; access_token?: string } | null) => {
      if (handled) return;
      handled = true;
      const user = session?.user;
      if (!user) { setPhase('need-signin'); return; }
      setEmail(user.email ?? '');

      let joined = false;
      try {
        const res = await fetch('/api/team/accept', {
          method: 'POST',
          headers: session?.access_token ? { authorization: `Bearer ${session.access_token}` } : {},
        });
        const j = await res.json();
        joined = !!j.joined;
        if (j.companyName) setCompanyName(j.companyName);
      } catch { /* fall through */ }

      // A fresh invite → set a password on the (locked) email so they can sign
      // in again later. Membership is already active either way.
      if (welcome) setPhase('set-password');
      else setPhase(joined ? 'done' : 'notfound');
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) proceed(session);
    });

    (async () => {
      try {
        const code = new URLSearchParams(window.location.search).get('code');
        if (code) { try { await supabase.auth.exchangeCodeForSession(code); } catch { /* ignore */ } }
      } catch { /* ignore */ }
      const { data: { session } } = await supabase.auth.getSession();
      if (session) proceed(session);
    })();

    // If no session materialises (expired/invalid link, or already-signed-in
    // user with nothing in the URL), fall back after a short grace period.
    const timer = setTimeout(() => { if (!handled) setPhase('need-signin'); }, 4000);

    return () => { subscription.unsubscribe(); clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError(isTh ? 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' : 'Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError(isTh ? 'รหัสผ่านไม่ตรงกัน' : 'Passwords do not match'); return; }
    setSaving(true); setError('');
    const { error: upErr } = await supabase.auth.updateUser({ password });
    if (upErr) { setError(upErr.message); setSaving(false); return; }
    router.push(`/${lang}/my-company`);
  };

  const wrap = (inner: React.ReactNode) => (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F5F7', padding: '24px', fontFamily: "'Inter', 'Noto Sans Thai', sans-serif" }}>
      <div style={{ background: 'white', borderRadius: '18px', border: '1px solid #E4E7ED', padding: '36px', maxWidth: '440px', width: '100%', textAlign: 'center' }}>{inner}</div>
    </div>
  );

  const inputStyle: React.CSSProperties = {
    width: '100%', fontSize: '14px', padding: '12px 16px',
    border: '1.5px solid #E4E7ED', borderRadius: '12px',
    background: 'white', outline: 'none', fontFamily: 'inherit', color: '#171A21', boxSizing: 'border-box',
  };
  const primaryBtn = (extra: React.CSSProperties = {}): React.CSSProperties => ({
    display: 'inline-block', padding: '12px 22px', background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)',
    color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '14px',
    border: 'none', cursor: 'pointer', fontFamily: 'inherit', ...extra,
  });

  if (phase === 'loading') {
    return wrap(<div style={{ fontSize: '14px', color: '#6B7385' }}>{isTh ? 'กำลังตรวจสอบคำเชิญ…' : 'Checking your invite…'}</div>);
  }

  if (phase === 'need-signin') {
    return wrap(
      <>
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔑</div>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#171A21', marginBottom: '8px' }}>{isTh ? 'เข้าสู่ระบบเพื่อรับคำเชิญ' : 'Sign in to accept your invite'}</h1>
        <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '20px', lineHeight: 1.6 }}>{isTh ? 'ลิงก์อาจหมดอายุ กรุณาเข้าสู่ระบบด้วยอีเมลที่ได้รับคำเชิญ ระบบจะเพิ่มคุณเข้าทีมให้อัตโนมัติ' : 'Your link may have expired. Sign in with the email you were invited on — you’ll be added to the team automatically.'}</p>
        <Link href={`/${lang}/login`} style={primaryBtn()}>{isTh ? 'เข้าสู่ระบบ' : 'Sign in'}</Link>
      </>,
    );
  }

  if (phase === 'set-password') {
    return wrap(
      <form onSubmit={submitPassword}>
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎉</div>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#171A21', marginBottom: '6px' }}>
          {companyName
            ? (isTh ? `เข้าร่วมทีม ${companyName}` : `Join ${companyName}`)
            : (isTh ? 'เข้าร่วมทีม' : 'Join the team')}
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '20px', lineHeight: 1.6 }}>
          {isTh ? 'ตั้งรหัสผ่านเพื่อสร้างบัญชีของคุณ แล้วเริ่มช่วยจัดการได้เลย' : 'Set a password to finish creating your account, then start helping manage.'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>{isTh ? 'อีเมล' : 'Email'}</label>
            <input type="email" value={email} readOnly disabled style={{ ...inputStyle, background: '#F4F5F7', color: '#6B7385', cursor: 'not-allowed' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>{isTh ? 'รหัสผ่าน' : 'Password'}</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={isTh ? 'อย่างน้อย 8 ตัวอักษร' : 'At least 8 characters'} required minLength={8} style={{ ...inputStyle, paddingRight: '44px' }} />
              <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9AA0AE', padding: '4px' }}>
                {showPw
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
              </button>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>{isTh ? 'ยืนยันรหัสผ่าน' : 'Confirm password'}</label>
            <input type={showPw ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={isTh ? 'พิมพ์รหัสผ่านอีกครั้ง' : 'Re-enter your password'} required style={inputStyle} />
          </div>
          {error && <p style={{ fontSize: '13px', color: '#FF5A5F', margin: 0 }}>{error}</p>}
          <button type="submit" disabled={saving} style={primaryBtn({ width: '100%', opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' })}>
            {saving ? '…' : (isTh ? 'สร้างบัญชี & เข้าร่วม' : 'Create account & join')}
          </button>
        </div>
      </form>,
    );
  }

  // done | notfound
  const ok = phase === 'done';
  return wrap(
    <>
      <div style={{ fontSize: '40px', marginBottom: '8px' }}>{ok ? '🎉' : '📭'}</div>
      <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#171A21', marginBottom: '8px' }}>
        {ok ? (isTh ? 'ยินดีต้อนรับเข้าทีม!' : 'You’re on the team!') : (isTh ? 'ไม่พบคำเชิญ' : 'No invite found')}
      </h1>
      <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '20px', lineHeight: 1.6 }}>
        {ok
          ? (companyName
              ? (isTh ? `คุณช่วยจัดการโปรไฟล์ของ ${companyName} ได้แล้ว` : `You can now help manage ${companyName}’s profile.`)
              : (isTh ? 'คุณสามารถช่วยจัดการโปรไฟล์บริษัทได้แล้ว' : 'You can now help manage the company profile.'))
          : (isTh ? `ไม่พบคำเชิญที่ค้างอยู่สำหรับ ${email} — กรุณาตรวจสอบกับผู้เชิญว่าใช้อีเมลนี้` : `No pending invite for ${email} — check with whoever invited you that they used this email.`)}
      </p>
      <Link href={`/${lang}/my-company`} style={ok ? primaryBtn() : { display: 'inline-block', padding: '12px 22px', background: 'transparent', color: '#0F6F73', border: '1.5px solid #0F6F73', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
        {ok ? (isTh ? 'ไปที่บริษัท' : 'Go to the company') : (isTh ? 'ไปหน้าหลัก' : 'Go to dashboard')}
      </Link>
    </>,
  );
}
