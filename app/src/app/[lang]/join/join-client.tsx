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

  const wrap = (inner: React.ReactNode) => (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F5F7', padding: '24px', fontFamily: "'Inter','Noto Sans Thai',sans-serif" }}>
      <div style={{ background: 'white', borderRadius: '18px', border: '1px solid #E4E7ED', padding: '36px', maxWidth: '440px', width: '100%' }}>{inner}</div>
    </div>
  );
  const inputStyle: React.CSSProperties = {
    width: '100%', fontSize: '14px', padding: '12px 16px', border: '1.5px solid #E4E7ED',
    borderRadius: '12px', background: 'white', outline: 'none', fontFamily: 'inherit', color: '#171A21', boxSizing: 'border-box',
  };
  const primaryBtn: React.CSSProperties = {
    display: 'inline-block', padding: '12px 22px', background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)',
    color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
  };

  if (state === 'invalid') {
    return wrap(
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>📭</div>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#171A21', marginBottom: '8px' }}>{isTh ? 'ลิงก์ไม่ถูกต้อง' : 'Invalid invite link'}</h1>
        <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '20px', lineHeight: 1.6 }}>{isTh ? 'ลิงก์คำเชิญนี้ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอให้ผู้เชิญส่งคำเชิญใหม่' : 'This invite link is invalid or has expired. Ask whoever invited you to send a new one.'}</p>
        <Link href={`/${lang}/login`} style={primaryBtn}>{isTh ? 'ไปหน้าเข้าสู่ระบบ' : 'Go to sign in'}</Link>
      </div>,
    );
  }

  if (state === 'accepted' || existsLogin) {
    return wrap(
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>✅</div>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#171A21', marginBottom: '8px' }}>{isTh ? 'บัญชีนี้มีอยู่แล้ว' : 'You already have an account'}</h1>
        <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '20px', lineHeight: 1.6 }}>
          {isTh ? `เข้าสู่ระบบด้วย ${email} แล้วระบบจะเพิ่มคุณเข้าทีมให้อัตโนมัติ` : `Sign in with ${email} and you’ll be added to the team automatically.`}
        </p>
        <Link href={`/${lang}/login`} style={primaryBtn}>{isTh ? 'เข้าสู่ระบบ' : 'Sign in'}</Link>
      </div>,
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
      // Account created + membership active → sign in and go to the company.
      const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signErr) { router.push(`/${lang}/login`); return; }
      router.push(`/${lang}/my-company`);
    } catch {
      setError(isTh ? 'เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่' : 'Connection failed, please try again');
      setSaving(false);
    }
  };

  return wrap(
    <form onSubmit={submit}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎉</div>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#171A21', marginBottom: '6px' }}>
          {companyName ? (isTh ? `เข้าร่วมทีม ${companyName}` : `Join ${companyName}`) : (isTh ? 'เข้าร่วมทีม' : 'Join the team')}
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7385', lineHeight: 1.6, margin: 0 }}>
          {isTh ? 'ตั้งรหัสผ่านเพื่อสร้างบัญชีและเริ่มช่วยจัดการได้เลย' : 'Set a password to create your account and start helping manage.'}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
        <button type="submit" disabled={saving} style={{ ...primaryBtn, width: '100%', textAlign: 'center', opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? '…' : (isTh ? 'สร้างบัญชี & เข้าร่วม' : 'Create account & join')}
        </button>
      </div>
    </form>,
  );
}
