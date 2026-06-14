'use client';

import { use, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isTh = lang === 'th';
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const t = isTh ? {
    title: 'สร้างบัญชีของคุณ',
    sub: 'เข้าร่วม Profindle — ฟรี ไม่ต้องใช้บัตรเครดิต',
    nameLabel: 'ชื่อ-นามสกุล', namePh: 'ชื่อจริงของคุณ',
    emailLabel: 'อีเมล', emailPh: 'you@company.com',
    pwLabel: 'รหัสผ่าน', pwPh: 'อย่างน้อย 8 ตัวอักษร',
    btn: 'สร้างบัญชี',
    already: 'มีบัญชีอยู่แล้ว?', signIn: 'เข้าสู่ระบบ',
    verifyTitle: 'ยืนยันอีเมลของคุณ',
    verifySub: 'เราส่งรหัส 6 หลักไปยัง',
    otpLabel: 'รหัสยืนยัน', verifyBtn: 'ยืนยัน & สร้างบัญชี',
    backBtn: 'กลับ',
    leftQuote: 'วิธีอัจฉริยะที่สุดในการหาพันธมิตรทางธุรกิจของไทย',
    leftTagline: 'เชื่อมต่อธุรกิจไทยกับผู้ให้บริการ B2B ที่ผ่านการตรวจสอบ',
  } : {
    title: 'Create your account',
    sub: 'Join Profindle — free, no credit card required',
    nameLabel: 'Full name', namePh: 'Your full name',
    emailLabel: 'Email address', emailPh: 'you@company.com',
    pwLabel: 'Password', pwPh: 'At least 8 characters',
    btn: 'Create Account',
    already: 'Already have an account?', signIn: 'Sign in',
    verifyTitle: 'Verify your email',
    verifySub: 'We sent a 6-digit code to',
    otpLabel: 'Verification code', verifyBtn: 'Verify & create account',
    backBtn: 'Back',
    leftQuote: "Thailand's smartest way to find business partners",
    leftTagline: 'Connect Thai businesses with verified B2B service providers.',
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { setError(isTh ? 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' : 'Password must be at least 8 characters'); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name } },
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setStep('verify');
    setLoading(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otp]; next[index] = value; setOtp(next); setError('');
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return;
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.verifyOtp({ email: form.email, token: code, type: 'signup' });
    if (error) {
      setError(isTh ? 'รหัสไม่ถูกต้อง กรุณาลองใหม่' : 'Invalid code. Please try again.');
      setShake(true); setTimeout(() => setShake(false), 500);
      setLoading(false); return;
    }
    router.push(`/${lang}/home`);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', fontSize: '14px', padding: '12px 16px',
    border: '1.5px solid #E4E7ED', borderRadius: '12px',
    background: 'white', outline: 'none', fontFamily: 'inherit', color: '#171A21',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh', fontFamily: "'Inter', 'Noto Sans Thai', sans-serif" }}>
      {/* Left panel */}
      <div style={{ background: 'linear-gradient(135deg, #171A21 0%, #0F6F73 100%)', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 70% 40%, rgba(26,157,163,0.2) 0%, transparent 65%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link href={`/${lang}`} style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '18px', fontWeight: 700 }}>
              <span style={{ color: '#2BBEC5' }}>Pro</span><span style={{ color: '#F77F00' }}>find</span><span style={{ color: '#2BBEC5' }}>le</span>
            </span>
          </Link>
          <blockquote style={{ fontSize: '24px', fontWeight: 700, color: 'white', lineHeight: 1.4, maxWidth: '380px', marginTop: '40px' }}>
            {t.leftQuote}
          </blockquote>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '16px' }}>{t.leftTagline}</p>
        </div>
        <p style={{ position: 'relative', zIndex: 1, fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>© 2026 Profindle</p>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F5F7', padding: '48px 40px' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 24px rgba(23,26,33,0.10)' }}>

          {step === 'register' ? (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#171A21', letterSpacing: '-0.02em', marginBottom: '6px' }}>{t.title}</h2>
              <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '28px' }}>{t.sub}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#171A21', marginBottom: '8px' }}>{t.nameLabel}</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t.namePh} required style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#0F6F73'; e.target.style.boxShadow = '0 0 0 3px rgba(15,111,115,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = '#E4E7ED'; e.target.style.boxShadow = 'none'; }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#171A21', marginBottom: '8px' }}>{t.emailLabel}</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder={t.emailPh} required style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#0F6F73'; e.target.style.boxShadow = '0 0 0 3px rgba(15,111,115,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = '#E4E7ED'; e.target.style.boxShadow = 'none'; }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#171A21', marginBottom: '8px' }}>{t.pwLabel}</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={t.pwPh} required minLength={8} style={{ ...inputStyle, paddingRight: '44px' }}
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

                {error && <p style={{ fontSize: '13px', color: '#FF5A5F', margin: 0 }}>{error}</p>}

                <button type="submit" disabled={loading} style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '15px', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
                  {loading ? '…' : t.btn}
                </button>
              </div>

              <p style={{ textAlign: 'center', fontSize: '14px', color: '#6B7385', marginTop: '20px' }}>
                {t.already}{' '}
                <Link href={`/${lang}/login`} style={{ color: '#0F6F73', fontWeight: 600, textDecoration: 'none' }}>{t.signIn}</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerify}>
              <button type="button" onClick={() => setStep('register')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#6B7385', fontSize: '13px', cursor: 'pointer', marginBottom: '16px', padding: 0, fontFamily: 'inherit' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                {t.backBtn}
              </button>

              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#171A21', letterSpacing: '-0.02em', marginBottom: '6px' }}>{t.verifyTitle}</h2>
              <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '28px' }}>
                {t.verifySub} <strong style={{ color: '#171A21' }}>{form.email}</strong>
              </p>

              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#171A21', marginBottom: '12px' }}>{t.otpLabel}</label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginBottom: '16px', animation: shake ? 'shake 0.4s ease' : undefined }}>
                {otp.map((digit, i) => (
                  <input key={i} ref={el => { otpRefs.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    style={{ height: '56px', textAlign: 'center', fontSize: '22px', fontWeight: 700, color: '#171A21', border: `1.5px solid ${error ? '#FF5A5F' : digit ? '#0F6F73' : '#E4E7ED'}`, borderRadius: '12px', background: digit ? '#F0F9F9' : 'white', outline: 'none', fontFamily: 'inherit' }}
                  />
                ))}
              </div>

              {error && <p style={{ fontSize: '13px', color: '#FF5A5F', marginBottom: '12px' }}>{error}</p>}

              <button type="submit" disabled={otp.join('').length < 6 || loading} style={{ width: '100%', padding: '12px 16px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '15px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit', opacity: otp.join('').length < 6 || loading ? 0.6 : 1 }}>
                {loading ? '…' : t.verifyBtn}
              </button>
            </form>
          )}
        </div>
      </div>
      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }`}</style>
    </div>
  );
}
