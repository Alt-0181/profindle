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

  const inputStyle: React.CSSProperties = {
    width: '100%', fontSize: '14px', padding: '12px 16px', border: '1.5px solid #E4E7ED',
    borderRadius: '12px', background: 'white', outline: 'none', fontFamily: 'inherit', color: '#171A21', boxSizing: 'border-box',
  };
  const focusIn = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = '#0F6F73'; e.target.style.boxShadow = '0 0 0 3px rgba(15,111,115,0.12)'; };
  const focusOut = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = '#E4E7ED'; e.target.style.boxShadow = 'none'; };
  const primaryBtn: React.CSSProperties = {
    display: 'inline-block', width: '100%', textAlign: 'center', padding: '12px 16px',
    background: 'linear-gradient(135deg, #0F6F73 0%, #1A9DA3 100%)', color: 'white', fontWeight: 600, fontSize: '15px',
    border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', boxSizing: 'border-box',
  };
  const outlineBtn: React.CSSProperties = {
    ...primaryBtn, background: 'transparent', color: '#0F6F73', border: '1.5px solid #0F6F73',
  };

  const shell = (inner: React.ReactNode) => (
    <div style={{ fontFamily: "'Inter', 'Noto Sans Thai', sans-serif" }}>
      <style>{`
        .auth-grid { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
        .auth-left { display: flex; }
        .auth-right { display: flex; align-items: center; justify-content: center; background: #F4F5F7; padding: 48px 40px; }
        .auth-card { background: white; border-radius: 20px; padding: 40px; width: 100%; max-width: 420px; box-shadow: 0 4px 24px rgba(23,26,33,0.10); box-sizing: border-box; }
        .auth-mlogo { display: none; }
        @media (max-width: 768px) {
          .auth-grid { grid-template-columns: 1fr; }
          .auth-left { display: none; }
          .auth-right { padding: 0; background: white; align-items: stretch; }
          .auth-card { max-width: 440px; margin: 0 auto; border-radius: 0; box-shadow: none; padding: 56px 24px 40px; min-height: 100vh; display: flex; flex-direction: column; justify-content: flex-start; }
          .auth-mlogo { display: flex; align-items: center; justify-content: center; margin-bottom: 32px; }
        }
      `}</style>
      <div className="auth-grid">
        <div className="auth-left" style={{ background: 'linear-gradient(135deg, #171A21 0%, #0F6F73 100%)', padding: '48px', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 70% 40%, rgba(26,157,163,0.2) 0%, transparent 65%)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Link href={`/${lang}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <img src="/assets/logo-white.svg" alt="Profindle" style={{ height: '30px', width: 'auto' }} />
            </Link>
            <blockquote style={{ fontSize: '24px', fontWeight: 700, color: 'white', lineHeight: 1.4, letterSpacing: '-0.02em', maxWidth: '380px', marginTop: '40px' }}>
              {isTh
                ? <>แพลตฟอร์มรวมผู้ให้บริการ<span style={{ color: '#F77F00' }}>แห่งใหม่</span>ของไทย</>
                : <>Thailand&apos;s <span style={{ color: '#F77F00' }}>new</span> platform for service providers</>}
            </blockquote>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '16px' }}>
              {isTh ? 'ช่วยให้ธุรกิจเจอผู้ให้บริการที่ใช่ ได้อย่างรวดเร็ว' : 'Helping businesses find the right provider, fast.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '32px' }}>
              {[
                isTh ? 'มากกว่า 400 บริการ' : '400+ services',
                isTh ? 'บริษัทที่ยืนยันแล้ว' : 'Verified companies',
                isTh ? 'สมัครฟรี' : 'Free to join',
              ].map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>
                  <span style={{ color: i === 1 ? '#F77F00' : '#2BBEC5', fontWeight: 700 }}>✓</span>{b}
                </div>
              ))}
            </div>
          </div>
          <p style={{ position: 'relative', zIndex: 1, fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>© 2026 Profindle</p>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <Link href={`/${lang}`} className="auth-mlogo" style={{ textDecoration: 'none' }}>
              <img src="/assets/logo.svg" alt="Profindle" style={{ height: '32px', width: 'auto' }} />
            </Link>
            {inner}
          </div>
        </div>
      </div>
    </div>
  );

  if (phase === 'loading') {
    return shell(<p style={{ fontSize: '14px', color: '#6B7385' }}>{isTh ? 'กำลังตรวจสอบคำเชิญ…' : 'Checking your invite…'}</p>);
  }

  if (phase === 'need-signin') {
    return shell(
      <>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#171A21', letterSpacing: '-0.02em', marginBottom: '6px' }}>{isTh ? 'เข้าสู่ระบบเพื่อรับคำเชิญ' : 'Sign in to accept your invite'}</h2>
        <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '28px', lineHeight: 1.6 }}>{isTh ? 'ลิงก์อาจหมดอายุ กรุณาเข้าสู่ระบบด้วยอีเมลที่ได้รับคำเชิญ ระบบจะเพิ่มคุณเข้าทีมให้อัตโนมัติ' : 'Your link may have expired. Sign in with the email you were invited on — you’ll be added to the team automatically.'}</p>
        <Link href={`/${lang}/login`} style={primaryBtn}>{isTh ? 'เข้าสู่ระบบ' : 'Sign in'}</Link>
      </>,
    );
  }

  if (phase === 'set-password') {
    return shell(
      <form onSubmit={submitPassword}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#171A21', letterSpacing: '-0.02em', marginBottom: '6px' }}>
          {companyName ? (isTh ? `เข้าร่วมทีม ${companyName}` : `Join ${companyName}`) : (isTh ? 'เข้าร่วมทีม' : 'Join the team')}
        </h2>
        <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '28px' }}>{isTh ? 'ตั้งรหัสผ่านเพื่อสร้างบัญชีของคุณ แล้วเริ่มช่วยจัดการได้เลย' : 'Set a password to finish creating your account, then start helping manage.'}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#171A21', marginBottom: '8px' }}>{isTh ? 'อีเมล' : 'Email address'}</label>
            <input type="email" value={email} readOnly disabled style={{ ...inputStyle, background: '#F4F5F7', color: '#6B7385', cursor: 'not-allowed' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#171A21', marginBottom: '8px' }}>{isTh ? 'รหัสผ่าน' : 'Password'}</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={isTh ? 'อย่างน้อย 8 ตัวอักษร' : 'At least 8 characters'} required minLength={8} style={{ ...inputStyle, paddingRight: '44px' }} onFocus={focusIn} onBlur={focusOut} />
              <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9AA0AE', padding: '4px' }}>
                {showPw
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
              </button>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#171A21', marginBottom: '8px' }}>{isTh ? 'ยืนยันรหัสผ่าน' : 'Confirm password'}</label>
            <input type={showPw ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={isTh ? 'พิมพ์รหัสผ่านอีกครั้ง' : 'Re-enter your password'} required style={{ ...inputStyle, borderColor: confirm && confirm !== password ? '#FF5A5F' : '#E4E7ED' }} onFocus={focusIn} onBlur={e => { e.target.style.borderColor = confirm && confirm !== password ? '#FF5A5F' : '#E4E7ED'; e.target.style.boxShadow = 'none'; }} />
            {confirm && confirm !== password && <p style={{ fontSize: '12px', color: '#FF5A5F', marginTop: '4px' }}>{isTh ? 'รหัสผ่านไม่ตรงกัน' : 'Passwords do not match'}</p>}
          </div>
          {error && <p style={{ fontSize: '13px', color: '#FF5A5F', margin: 0 }}>{error}</p>}
          <button type="submit" disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? '…' : (isTh ? 'สร้างบัญชี & เข้าร่วม' : 'Create account & join')}
          </button>
        </div>
      </form>,
    );
  }

  // done | notfound
  const ok = phase === 'done';
  return shell(
    <>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#171A21', letterSpacing: '-0.02em', marginBottom: '6px' }}>
        {ok ? (isTh ? 'ยินดีต้อนรับเข้าทีม!' : 'You’re on the team!') : (isTh ? 'ไม่พบคำเชิญ' : 'No invite found')}
      </h2>
      <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '28px', lineHeight: 1.6 }}>
        {ok
          ? (companyName
              ? (isTh ? `คุณช่วยจัดการโปรไฟล์ของ ${companyName} ได้แล้ว` : `You can now help manage ${companyName}’s profile.`)
              : (isTh ? 'คุณสามารถช่วยจัดการโปรไฟล์บริษัทได้แล้ว' : 'You can now help manage the company profile.'))
          : (isTh ? `ไม่พบคำเชิญที่ค้างอยู่สำหรับ ${email} — กรุณาตรวจสอบกับผู้เชิญว่าใช้อีเมลนี้` : `No pending invite for ${email} — check with whoever invited you that they used this email.`)}
      </p>
      <Link href={`/${lang}/my-company`} style={ok ? primaryBtn : outlineBtn}>
        {ok ? (isTh ? 'ไปที่บริษัท' : 'Go to the company') : (isTh ? 'ไปหน้าหลัก' : 'Go to dashboard')}
      </Link>
    </>,
  );
}
