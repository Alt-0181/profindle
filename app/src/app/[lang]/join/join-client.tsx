'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function JoinClient({
  lang, token, email, companyName, state,
}: {
  lang: string;
  token: string;
  email: string;
  companyName: string;
  state: 'valid' | 'accepted' | 'invalid';
}) {
  const isTh = lang === 'th';
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [existsLogin, setExistsLogin] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [declined, setDeclined] = useState(false);

  const decline = async () => {
    if (declining) return;
    setDeclining(true); setError('');
    try {
      const res = await fetch('/api/team/decline', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || (isTh ? 'ไม่สามารถปฏิเสธคำเชิญได้' : 'Could not decline the invite')); setDeclining(false); return; }
      setDeclined(true);
    } catch {
      setError(isTh ? 'เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่' : 'Connection failed, please try again'); setDeclining(false);
    }
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

  // Shared two-panel auth shell — same look & feel as login / signup.
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
        {/* Left brand panel */}
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
                isTh ? 'ค้นหาจากผลงาน' : 'Search by portfolio',
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

        {/* Right form panel */}
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

  if (state === 'invalid') {
    return shell(
      <>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#171A21', letterSpacing: '-0.02em', marginBottom: '6px' }}>{isTh ? 'ลิงก์ไม่ถูกต้อง' : 'Invalid invite link'}</h2>
        <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '28px', lineHeight: 1.6 }}>{isTh ? 'ลิงก์คำเชิญนี้ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอให้ผู้เชิญส่งคำเชิญใหม่' : 'This invite link is invalid or has expired. Ask whoever invited you to send a new one.'}</p>
        <Link href={`/${lang}/login`} style={primaryBtn}>{isTh ? 'ไปหน้าเข้าสู่ระบบ' : 'Go to sign in'}</Link>
      </>,
    );
  }

  if (state === 'accepted' || existsLogin) {
    return shell(
      <>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#171A21', letterSpacing: '-0.02em', marginBottom: '6px' }}>{isTh ? 'บัญชีนี้มีอยู่แล้ว' : 'You already have an account'}</h2>
        <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '28px', lineHeight: 1.6 }}>
          {isTh ? `เข้าสู่ระบบด้วย ${email} แล้วระบบจะเพิ่มคุณเข้าทีมให้อัตโนมัติ` : `Sign in with ${email} and you’ll be added to the team automatically.`}
        </p>
        <Link href={`/${lang}/login`} style={primaryBtn}>{isTh ? 'เข้าสู่ระบบ' : 'Sign in'}</Link>
      </>,
    );
  }

  if (declined) {
    return shell(
      <>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#171A21', letterSpacing: '-0.02em', marginBottom: '6px' }}>{isTh ? 'ปฏิเสธคำเชิญแล้ว' : 'Invitation declined'}</h2>
        <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '28px', lineHeight: 1.6 }}>
          {isTh
            ? `คุณได้ปฏิเสธคำเชิญให้ร่วมจัดการ${companyName ? ` ${companyName}` : ''}แล้ว ตอนนี้คุณสามารถสร้างบัญชีและบริษัทของคุณเองได้`
            : `You’ve declined the invitation${companyName ? ` to help manage ${companyName}` : ''}. You’re now free to create your own account and company.`}
        </p>
        <Link href={`/${lang}/signup`} style={primaryBtn}>{isTh ? 'สร้างบัญชีของคุณเอง' : 'Create your own account'}</Link>
      </>,
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError(isTh ? 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' : 'Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError(isTh ? 'รหัสผ่านไม่ตรงกัน' : 'Passwords do not match'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/team/join', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.exists) { setExistsLogin(true); setSaving(false); return; }
      if (!res.ok) { setError(data.error || (isTh ? 'เกิดข้อผิดพลาด' : 'Something went wrong')); setSaving(false); return; }
      const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signErr) { router.push(`/${lang}/login`); return; }
      router.push(`/${lang}/my-company`);
    } catch {
      setError(isTh ? 'เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่' : 'Connection failed, please try again');
      setSaving(false);
    }
  };

  return shell(
    <form onSubmit={submit}>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#171A21', letterSpacing: '-0.02em', marginBottom: '6px' }}>
        {companyName ? (isTh ? `เข้าร่วมทีม ${companyName}` : `Join ${companyName}`) : (isTh ? 'เข้าร่วมทีม' : 'Join the team')}
      </h2>
      <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '28px' }}>
        {isTh ? 'ตั้งรหัสผ่านเพื่อสร้างบัญชีและเริ่มช่วยจัดการได้เลย' : 'Set a password to create your account and start helping manage.'}
      </p>

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

        <div style={{ textAlign: 'center', marginTop: '4px' }}>
          <button type="button" onClick={decline} disabled={declining} style={{ background: 'none', border: 'none', color: '#9AA0AE', fontSize: '13px', cursor: declining ? 'not-allowed' : 'pointer', fontFamily: 'inherit', textDecoration: 'underline', padding: '4px' }}>
            {declining ? '…' : (isTh ? 'ไม่ใช่คุณ? ปฏิเสธคำเชิญนี้' : 'Not you? Decline this invitation')}
          </button>
        </div>
      </div>
    </form>,
  );
}
