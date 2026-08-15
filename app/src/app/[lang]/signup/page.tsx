'use client';

import { use, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Turnstile, captchaEnabled } from '@/components/turnstile';

export default function SignupPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isTh = lang === 'th';
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [claimId, setClaimId] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // When arriving from "Claim this business" (/signup?claim=<companyId>), remember
  // which company to map to this new account after verification.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('claim');
    if (id) setClaimId(id);
  }, []);

  const t = isTh ? {
    title: 'สร้างบัญชีของคุณ',
    sub: 'เข้าร่วม Profindle — ฟรี ไม่ต้องใช้บัตรเครดิต',
    nameLabel: 'ชื่อ-นามสกุล', namePh: 'ชื่อจริงของคุณ',
    emailLabel: 'อีเมล', emailPh: 'you@company.com',
    pwLabel: 'รหัสผ่าน', pwPh: 'อย่างน้อย 8 ตัวอักษร',
    confirmPwLabel: 'ยืนยันรหัสผ่าน', confirmPwPh: 'พิมพ์รหัสผ่านอีกครั้ง',
    btn: 'สร้างบัญชี',
    already: 'มีบัญชีอยู่แล้ว?', signIn: 'เข้าสู่ระบบ',
    verifyTitle: 'ยืนยันอีเมลของคุณ',
    verifySub: 'เราส่งรหัสยืนยันไปยัง',
    otpLabel: 'รหัสยืนยัน', verifyBtn: 'ยืนยัน & สร้างบัญชี',
    backBtn: 'กลับ',
    leftQuote: 'แพลตฟอร์มรวมผู้ให้บริการแห่งใหม่ของไทย',
    leftTagline: 'ช่วยให้ธุรกิจเจอผู้ให้บริการที่ใช่ ได้อย่างรวดเร็ว',
  } : {
    title: 'Create your account',
    sub: 'Join Profindle — free, no credit card required',
    nameLabel: 'Full name', namePh: 'Your full name',
    emailLabel: 'Email address', emailPh: 'you@company.com',
    pwLabel: 'Password', pwPh: 'At least 8 characters',
    confirmPwLabel: 'Confirm password', confirmPwPh: 'Re-enter your password',
    btn: 'Create Account',
    already: 'Already have an account?', signIn: 'Sign in',
    verifyTitle: 'Verify your email',
    verifySub: 'We sent a verification code to',
    otpLabel: 'Verification code', verifyBtn: 'Verify & create account',
    backBtn: 'Back',
    leftQuote: "Thailand's new platform for service providers",
    leftTagline: 'Helping businesses find the right provider, fast.',
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { setError(isTh ? 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' : 'Password must be at least 8 characters'); return; }
    if (form.password !== form.confirmPassword) { setError(isTh ? 'รหัสผ่านไม่ตรงกัน' : 'Passwords do not match'); return; }
    if (captchaEnabled && !captchaToken) { setError(isTh ? 'กรุณายืนยันว่าคุณไม่ใช่บอท' : 'Please complete the verification below'); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name }, ...(captchaToken ? { captchaToken } : {}) },
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

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const next = [...Array(6)].map((_, i) => digits[i] || '');
    setOtp(next);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
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
    // If this signup came from "Claim this business", map the company to the new
    // account, then send them to My Company to upload their registration doc.
    if (claimId) {
      try { await fetch('/api/claim', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ companyId: claimId }) }); } catch { /* fall through to My Company either way */ }
      router.push(`/${lang}/my-company?claimed=1`);
      return;
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
      {/* Left panel */}
      <div className="auth-left" style={{ background: 'linear-gradient(135deg, #171A21 0%, #0F6F73 100%)', padding: '48px', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 70% 40%, rgba(26,157,163,0.2) 0%, transparent 65%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link href={`/${lang}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src="/assets/logo-white.svg" alt="Profindle" style={{ height: '30px', width: 'auto' }} />
          </Link>
          <blockquote style={{ fontSize: '24px', fontWeight: 700, color: 'white', lineHeight: 1.4, maxWidth: '380px', marginTop: '40px' }}>
            {t.leftQuote}
          </blockquote>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '16px' }}>{t.leftTagline}</p>
        </div>
        <p style={{ position: 'relative', zIndex: 1, fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>© 2026 Profindle</p>
      </div>

      {/* Right */}
      <div className="auth-right">
        <div className="auth-card">
          <Link href={`/${lang}`} className="auth-mlogo" style={{ textDecoration: 'none' }}>
            <img src="/assets/logo.svg" alt="Profindle" style={{ height: '32px', width: 'auto' }} />
          </Link>

          {step === 'register' ? (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#171A21', letterSpacing: '-0.02em', marginBottom: '6px' }}>{t.title}</h2>
              <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: claimId ? '16px' : '28px' }}>{t.sub}</p>
              {claimId && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#F0F9F9', border: '1px solid rgba(15,111,115,0.2)', borderRadius: '12px', padding: '12px 14px', marginBottom: '24px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
                  <div style={{ fontSize: '13px', color: '#0F6F73', lineHeight: 1.5 }}>
                    {isTh ? 'คุณกำลังยืนยันความเป็นเจ้าของธุรกิจ สร้างบัญชีเพื่อจัดการโปรไฟล์ของคุณ' : "You're claiming your business. Create an account to manage its profile."}
                  </div>
                </div>
              )}

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

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#171A21', marginBottom: '8px' }}>{t.confirmPwLabel}</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showConfirmPw ? 'text' : 'password'} value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} placeholder={t.confirmPwPh} required style={{ ...inputStyle, paddingRight: '44px', borderColor: form.confirmPassword && form.confirmPassword !== form.password ? '#FF5A5F' : undefined }}
                      onFocus={e => { e.target.style.borderColor = '#0F6F73'; e.target.style.boxShadow = '0 0 0 3px rgba(15,111,115,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = form.confirmPassword && form.confirmPassword !== form.password ? '#FF5A5F' : '#E4E7ED'; e.target.style.boxShadow = 'none'; }} />
                    <button type="button" onClick={() => setShowConfirmPw(v => !v)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9AA0AE', padding: '4px' }}>
                      {showConfirmPw
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                  {form.confirmPassword && form.confirmPassword !== form.password && (
                    <p style={{ fontSize: '12px', color: '#FF5A5F', marginTop: '4px' }}>{isTh ? 'รหัสผ่านไม่ตรงกัน' : 'Passwords do not match'}</p>
                  )}
                </div>

                {captchaEnabled && (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Turnstile onToken={setCaptchaToken} />
                  </div>
                )}

                {error && <p style={{ fontSize: '13px', color: '#FF5A5F', margin: 0 }}>{error}</p>}

                <button type="submit" disabled={loading || (captchaEnabled && !captchaToken)} style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '15px', border: 'none', borderRadius: '12px', cursor: loading || (captchaEnabled && !captchaToken) ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading || (captchaEnabled && !captchaToken) ? 0.7 : 1 }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '8px', marginBottom: '16px', animation: shake ? 'shake 0.4s ease' : undefined }}>
                {otp.map((digit, i) => (
                  <input key={i} ref={el => { otpRefs.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={1} value={digit} autoComplete="one-time-code"
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    onPaste={handleOtpPaste}
                    style={{ width: '100%', minWidth: 0, height: '56px', textAlign: 'center', fontSize: '22px', fontWeight: 700, color: '#171A21', border: `1.5px solid ${error ? '#FF5A5F' : digit ? '#0F6F73' : '#E4E7ED'}`, borderRadius: '12px', background: digit ? '#F0F9F9' : 'white', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
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
    </div>
  );
}
