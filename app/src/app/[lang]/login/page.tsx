'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Turnstile, captchaEnabled } from '@/components/turnstile';

const DICT = {
  en: {
    welcomeBack: 'Welcome back',
    sub: 'Sign in to your Profindle account',
    emailLabel: 'Email address', emailPh: 'you@company.com',
    pwLabel: 'Password', pwPh: 'Your password',
    signInBtn: 'Sign in',
    noAccount: "Don't have an account?", signUpLink: 'Sign up',
    forgotPw: 'Forgot password?',
    leftTagline: 'Connect Thai businesses with verified B2B service providers.',
    badge1: '400+ services', badge2: 'Verified companies', badge3: 'Free to join',
  },
  th: {
    welcomeBack: 'ยินดีต้อนรับกลับมา',
    sub: 'เข้าสู่ระบบบัญชี Profindle ของคุณ',
    emailLabel: 'อีเมล', emailPh: 'you@company.com',
    pwLabel: 'รหัสผ่าน', pwPh: 'รหัสผ่านของคุณ',
    signInBtn: 'เข้าสู่ระบบ',
    noAccount: 'ยังไม่มีบัญชี?', signUpLink: 'สมัครสมาชิก',
    forgotPw: 'ลืมรหัสผ่าน?',
    leftTagline: 'เชื่อมต่อธุรกิจไทยกับผู้ให้บริการ B2B ที่ผ่านการตรวจสอบ',
    badge1: 'มากกว่า 400 บริการ', badge2: 'บริษัทที่ยืนยันแล้ว', badge3: 'สมัครฟรี',
  },
};

export default function LoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const t = DICT[lang as 'en' | 'th'] || DICT.th;
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaEnabled && !captchaToken) { setError(lang === 'th' ? 'กรุณายืนยันว่าคุณไม่ใช่บอท' : 'Please complete the verification below'); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password, ...(captchaToken ? { options: { captchaToken } } : {}) });
    if (error) {
      try {
        const res = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const { exists } = await res.json();
        setError(exists
          ? (lang === 'th' ? 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่หรือรีเซ็ตรหัสผ่าน' : 'Incorrect password. Try again or reset your password.')
          : (lang === 'th' ? 'ไม่พบบัญชีที่ใช้อีเมลนี้ กรุณาสมัครสมาชิก' : 'No account found with this email. Try signing up instead.')
        );
      } catch {
        setError(lang === 'th' ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' : 'Invalid email or password');
      }
      setLoading(false);
      return;
    }
    router.push(`/${lang}/home`);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', fontSize: '14px', padding: '12px 16px',
    border: '1.5px solid #E4E7ED', borderRadius: '12px',
    background: 'white', outline: 'none', fontFamily: 'inherit',
    color: '#171A21', transition: 'all 150ms', boxSizing: 'border-box',
  };

  return (
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
          .auth-card { max-width: 440px; margin: 0 auto; border-radius: 0; box-shadow: none; padding: 64px 24px 40px; min-height: 100vh; display: flex; flex-direction: column; justify-content: flex-start; }
          .auth-mlogo { display: flex; align-items: center; justify-content: center; margin-bottom: 36px; }
        }
      `}</style>
    <div className="auth-grid">
      {/* Left panel */}
      <div className="auth-left" style={{ background: 'linear-gradient(135deg, #171A21 0%, #0F6F73 100%)', padding: '48px', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 70% 40%, rgba(26,157,163,0.2) 0%, transparent 65%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link href={`/${lang}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src="/assets/logo-white.svg" alt="Profindle" style={{ height: '30px', width: 'auto' }} />
          </Link>
          <blockquote style={{ fontSize: '24px', fontWeight: 700, color: 'white', lineHeight: 1.4, letterSpacing: '-0.02em', maxWidth: '380px', marginTop: '40px' }}>
            {lang === 'en'
              ? <>Thailand's <span style={{ color: '#F77F00' }}>smartest</span> way to find business partners</>
              : <>วิธี<span style={{ color: '#F77F00' }}>อัจฉริยะที่สุด</span>ในการหาพันธมิตรทางธุรกิจของไทย</>}
          </blockquote>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '16px' }}>{t.leftTagline}</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '32px' }}>
            {[t.badge1, t.badge2, t.badge3].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>
                <span style={{ color: i === 1 ? '#F77F00' : '#2BBEC5', fontWeight: 700 }}>✓</span>{b}
              </div>
            ))}
          </div>
        </div>
        <p style={{ position: 'relative', zIndex: 1, fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>© 2026 Profindle</p>
      </div>

      {/* Right */}
      <div className="auth-right">
        <div className="auth-card">
          <Link href={`/${lang}`} className="auth-mlogo" style={{ textDecoration: 'none' }}>
            <img src="/assets/logo.svg" alt="Profindle" style={{ height: '32px', width: 'auto' }} />
          </Link>
          <form onSubmit={handleSubmit}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#171A21', letterSpacing: '-0.02em', marginBottom: '6px' }}>{t.welcomeBack}</h2>
            <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '28px' }}>{t.sub}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#171A21', marginBottom: '8px' }}>{t.emailLabel}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t.emailPh} required style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#0F6F73'; e.target.style.boxShadow = '0 0 0 3px rgba(15,111,115,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#E4E7ED'; e.target.style.boxShadow = 'none'; }} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: '#171A21' }}>{t.pwLabel}</label>
                  <Link href={`/${lang}/forgot-password`} style={{ fontSize: '13px', color: '#0F6F73', textDecoration: 'none', fontWeight: 500 }}>{t.forgotPw}</Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={t.pwPh} required style={{ ...inputStyle, paddingRight: '44px' }}
                    onFocus={e => { e.target.style.borderColor = '#0F6F73'; e.target.style.boxShadow = '0 0 0 3px rgba(15,111,115,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = '#E4E7ED'; e.target.style.boxShadow = 'none'; }} />
                  <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9AA0AE', padding: '4px' }}>
                    {showPw
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              {captchaEnabled && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Turnstile onToken={setCaptchaToken} />
                </div>
              )}

              {error && <p style={{ fontSize: '13px', color: '#FF5A5F', margin: 0 }}>{error}</p>}

              <button type="submit" disabled={loading || (captchaEnabled && !captchaToken)} style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #0F6F73 0%, #1A9DA3 100%)', color: 'white', fontWeight: 600, fontSize: '15px', border: 'none', borderRadius: '12px', cursor: loading || (captchaEnabled && !captchaToken) ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading || (captchaEnabled && !captchaToken) ? 0.7 : 1 }}>
                {loading ? '…' : t.signInBtn}
              </button>
            </div>

            <p style={{ textAlign: 'center', fontSize: '14px', color: '#6B7385', marginTop: '20px' }}>
              {t.noAccount}{' '}
              <Link href={`/${lang}/signup`} style={{ color: '#0F6F73', fontWeight: 600, textDecoration: 'none' }}>{t.signUpLink}</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}
