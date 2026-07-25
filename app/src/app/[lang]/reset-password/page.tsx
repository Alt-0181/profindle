'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const params = useParams();
  const lang = params.lang as string;
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Exchange PKCE code from email link if present
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(code).catch(() => {});
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const isTh = lang === 'th';
  const t = {
    title: isTh ? 'ตั้งรหัสผ่านใหม่' : 'Set new password',
    sub: isTh ? 'ป้อนรหัสผ่านใหม่ของคุณด้านล่าง' : 'Enter your new password below',
    newPw: isTh ? 'รหัสผ่านใหม่' : 'New password',
    confirmPw: isTh ? 'ยืนยันรหัสผ่าน' : 'Confirm password',
    updateBtn: isTh ? 'อัปเดตรหัสผ่าน' : 'Update password',
    backToLogin: isTh ? 'กลับไปเข้าสู่ระบบ' : 'Back to sign in',
    doneTitle: isTh ? 'รหัสผ่านอัปเดตแล้ว!' : 'Password updated!',
    doneSub: isTh ? 'กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...' : 'Redirecting you to sign in...',
    waitingTitle: isTh ? 'กำลังยืนยันลิงก์...' : 'Verifying reset link...',
    waitingSub: isTh ? 'หากหน้านี้ไม่โหลด กรุณาขอลิงก์รีเซ็ตใหม่' : 'If this page does not load, please request a new reset link.',
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError(isTh ? 'รหัสผ่านไม่ตรงกัน' : 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError(isTh ? 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' : 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setDone(true);
    setTimeout(() => router.push(`/${lang}/login`), 2500);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', fontSize: '15px', padding: '12px 16px',
    border: '1.5px solid #E4E7ED', borderRadius: '12px',
    outline: 'none', color: '#171A21', fontFamily: 'inherit', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, "Noto Sans Thai", sans-serif' }}>
      <style>{`
        .auth-mlogo{display:none}
        @media (max-width:768px){
          .auth-side{display:none!important}
          .auth-right{align-items:flex-start!important;padding-top:60px!important}
          .auth-mlogo{display:flex;justify-content:center;margin-bottom:34px}
        }
      `}</style>
      {/* Left panel */}
      <div className="auth-side" style={{ width: '45%', background: 'linear-gradient(140deg, #0E1017 0%, #0F6F73 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 56px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(15,111,115,0.15)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(247,127,0,0.10)', filter: 'blur(48px)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link href={`/${lang}`} style={{ textDecoration: 'none' }}>
            <img src="/assets/logo-white.svg" alt="Profindle" style={{ height: '32px', width: 'auto', marginBottom: '48px' }} />
          </Link>
          <h2 style={{ fontSize: '30px', fontWeight: 700, color: 'white', lineHeight: 1.3, marginBottom: '16px' }}>
            {isTh ? 'วิธีที่ฉลาดที่สุดในการหาพันธมิตรทางธุรกิจในไทย' : "Thailand's smartest way to find business partners"}
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
            {isTh ? 'ค้นหา ติดต่อ และทำงานร่วมกับผู้ให้บริการที่ผ่านการยืนยัน' : 'Find, contact, and collaborate with verified service providers.'}
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <Link href={`/${lang}`} className="auth-mlogo" style={{ textDecoration: 'none' }}>
            <img src="/assets/logo.svg" alt="Profindle" style={{ height: '32px', width: 'auto' }} />
          </Link>
          {done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#171A21', marginBottom: '8px' }}>{t.doneTitle}</h2>
              <p style={{ fontSize: '14px', color: '#6B7385' }}>{t.doneSub}</p>
            </div>
          ) : !ready ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid rgba(15,111,115,0.2)', borderTopColor: '#0F6F73', animation: 'spin 0.7s linear infinite', margin: '0 auto 20px' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#171A21', marginBottom: '8px' }}>{t.waitingTitle}</h2>
              <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '24px' }}>{t.waitingSub}</p>
              <Link href={`/${lang}/forgot-password`} style={{ fontSize: '13px', color: '#0F6F73', fontWeight: 600, textDecoration: 'none' }}>
                ← {isTh ? 'ขอลิงก์ใหม่' : 'Request new link'}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#171A21', marginBottom: '8px' }}>{t.title}</h1>
              <p style={{ fontSize: '15px', color: '#6B7385', marginBottom: '32px' }}>{t.sub}</p>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>{t.newPw}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required minLength={6} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>{t.confirmPw}</label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inputStyle} required minLength={6} />
              </div>

              {error && <p style={{ fontSize: '13px', color: '#E04347', marginBottom: '12px' }}>{error}</p>}

              <button
                type="submit"
                disabled={loading || !password || !confirm}
                style={{ width: '100%', padding: '14px', background: password && confirm && !loading ? 'linear-gradient(135deg, #0F6F73, #1A9DA3)' : '#E4E7ED', color: password && confirm && !loading ? 'white' : '#9AA0AE', fontWeight: 700, fontSize: '15px', border: 'none', borderRadius: '12px', cursor: password && confirm && !loading ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all 150ms' }}
              >
                {loading ? (isTh ? 'กำลังอัปเดต...' : 'Updating...') : t.updateBtn}
              </button>

              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <Link href={`/${lang}/login`} style={{ fontSize: '13px', color: '#0F6F73', fontWeight: 600, textDecoration: 'none' }}>
                  ← {t.backToLogin}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
