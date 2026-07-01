'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const params = useParams();
  const lang = params.lang as string;
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = {
    forgotTitle: lang === 'th' ? 'รีเซ็ตรหัสผ่าน' : 'Reset your password',
    forgotSub: lang === 'th' ? 'ใส่อีเมลเพื่อรับลิงก์รีเซ็ต' : "Enter your email and we'll send a reset link",
    emailLabel: lang === 'th' ? 'อีเมล' : 'Email address',
    emailPh: 'you@company.com',
    sendResetBtn: lang === 'th' ? 'ส่งลิงก์รีเซ็ต' : 'Send Reset Link',
    backToLogin: lang === 'th' ? 'กลับไปเข้าสู่ระบบ' : 'Back to sign in',
    sentTitle: lang === 'th' ? 'ตรวจสอบอีเมลของคุณ' : 'Check your email',
    sentSub: lang === 'th' ? 'เราส่งลิงก์รีเซ็ตไปที่' : 'We sent a reset link to',
    leftQuote: lang === 'th' ? 'วิธีที่ฉลาดที่สุดในการหาพันธมิตรทางธุรกิจในไทย' : "Thailand's smartest way to find business partners",
    leftTagline: lang === 'th' ? 'ไม่มีรหัสผ่าน เราส่งรหัสแบบครั้งเดียวทางอีเมล' : 'No passwords. We send a one-time code to your email.',
  };

  async function handleSendReset() {
    if (!email) return;
    setLoading(true);
    setError('');
    const supabase = createClient();
    const origin = window.location.origin;
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/${lang}/reset-password`,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSent(true);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, "Noto Sans Thai", sans-serif' }}>
      {/* Left panel */}
      <div style={{ width: '45%', background: 'linear-gradient(140deg, #0E1017 0%, #0F6F73 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 56px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(15,111,115,0.15)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(247,127,0,0.10)', filter: 'blur(48px)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link href={`/${lang}`} style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '48px' }}>
              <span style={{ color: '#0F6F73' }}>Pro</span>
              <span style={{ color: '#F77F00' }}>find</span>
              <span style={{ color: '#0F6F73' }}>le</span>
            </div>
          </Link>

          <h2 style={{ fontSize: '30px', fontWeight: 700, color: 'white', lineHeight: 1.3, marginBottom: '16px' }}>{t.leftQuote}</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{t.leftTagline}</p>

          <div style={{ marginTop: '48px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {['400+ services', 'Verified companies', 'Free to join'].map((badge) => (
              <div key={badge} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '999px', fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                {badge}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {!sent ? (
            <>
              <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#171A21', marginBottom: '8px' }}>{t.forgotTitle}</h1>
              <p style={{ fontSize: '15px', color: '#6B7385', marginBottom: '32px' }}>{t.forgotSub}</p>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>{t.emailLabel}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPh}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReset()}
                  style={{ width: '100%', fontSize: '15px', padding: '12px 16px', border: '1.5px solid #E4E7ED', borderRadius: '12px', outline: 'none', color: '#171A21', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>

              {error && (
                <p style={{ fontSize: '13px', color: '#E04347', marginBottom: '12px' }}>{error}</p>
              )}

              <button
                onClick={handleSendReset}
                disabled={!email || loading}
                style={{ width: '100%', padding: '14px', background: email && !loading ? 'linear-gradient(135deg, #0F6F73, #1A9DA3)' : '#E4E7ED', color: email && !loading ? 'white' : '#9AA0AE', fontWeight: 700, fontSize: '15px', border: 'none', borderRadius: '12px', cursor: email && !loading ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all 150ms' }}
              >
                {loading ? (lang === 'th' ? 'กำลังส่ง...' : 'Sending...') : t.sendResetBtn}
              </button>

              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <Link href={`/${lang}/login`} style={{ fontSize: '13px', color: '#0F6F73', fontWeight: 600, textDecoration: 'none' }}>
                  ← {t.backToLogin}
                </Link>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#171A21', marginBottom: '8px' }}>{t.sentTitle}</h2>
              <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '6px' }}>{t.sentSub}</p>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#0F6F73', marginBottom: '32px' }}>{email}</p>
              <Link href={`/${lang}/login`} style={{ display: 'inline-block', padding: '12px 28px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', borderRadius: '12px', textDecoration: 'none', fontFamily: 'inherit' }}>
                ← {t.backToLogin}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
