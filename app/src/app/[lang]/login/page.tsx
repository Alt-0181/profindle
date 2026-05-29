'use client';

import { useState, useRef, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const DEMO_DICT = {
  en: {
    welcomeBack: 'Welcome back',
    enterEmail: 'Enter your email to continue',
    emailLabel: 'Email address',
    emailPh: 'you@company.com',
    continueBtn: 'Continue',
    noAccount: "Don't have an account?",
    signUpLink: 'Sign up',
    checkEmail: 'Check your email',
    otpSentTo: 'We sent a 6-digit code to',
    otpLabel: 'Enter the code',
    verifyBtn: 'Verify & Sign In',
    resendIn: 'Resend in',
    resendCode: 'Resend code',
    wrongEmail: 'Wrong email?',
    otpError: 'Invalid code. Please try again.',
    leftQuote: "Thailand's smartest way to find business partners",
    leftTagline: 'No passwords. We send a one-time code to your email.',
    badge1: '400+ services',
    badge2: 'Verified companies',
    badge3: 'Free to join',
    forgotPw: 'Forgot password?',
  },
  th: {
    welcomeBack: 'ยินดีต้อนรับกลับมา',
    enterEmail: 'กรอกอีเมลเพื่อดำเนินการต่อ',
    emailLabel: 'อีเมล',
    emailPh: 'you@company.com',
    continueBtn: 'ดำเนินการต่อ',
    noAccount: 'ยังไม่มีบัญชี?',
    signUpLink: 'สมัครสมาชิก',
    checkEmail: 'ตรวจสอบกล่องข้อความของคุณ',
    otpSentTo: 'เราส่งรหัส 6 หลักไปยัง',
    otpLabel: 'กรอกรหัส',
    verifyBtn: 'ยืนยัน & เข้าสู่ระบบ',
    resendIn: 'ส่งอีกครั้งใน',
    resendCode: 'ส่งรหัสใหม่',
    wrongEmail: 'อีเมลผิดใช่ไหม?',
    otpError: 'รหัสไม่ถูกต้อง กรุณาลองใหม่',
    leftQuote: 'วิธีอัจฉริยะที่สุดในการหาพันธมิตรทางธุรกิจของไทย',
    leftTagline: 'ไม่ต้องจำรหัสผ่าน เราส่งรหัสแบบใช้ครั้งเดียวไปยังอีเมลของคุณ',
    badge1: 'มากกว่า 400 บริการ',
    badge2: 'บริษัทที่ยืนยันแล้ว',
    badge3: 'สมัครฟรี',
    forgotPw: 'ลืมรหัสผ่าน?',
  },
};

export default function LoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const t = DEMO_DICT[lang as 'en' | 'th'] || DEMO_DICT.th;
  const router = useRouter();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [shake, setShake] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 'otp' && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, resendTimer]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStep('otp');
    setResendTimer(30);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return;
    if (code === '000000') {
      setError(t.otpError);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      router.push(`/${lang}/home`);
    }, 800);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', fontSize: '14px', padding: '12px 16px',
    border: '1.5px solid #E4E7ED', borderRadius: '12px',
    background: 'white', outline: 'none', fontFamily: 'inherit',
    color: '#171A21', transition: 'all 150ms',
  };

  const btnStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px',
    background: 'linear-gradient(135deg, #0F6F73 0%, #1A9DA3 100%)',
    color: 'white', fontWeight: 600, fontSize: '15px',
    border: 'none', borderRadius: '12px', cursor: 'pointer',
    fontFamily: 'inherit', transition: 'all 150ms',
  };

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh',
      fontFamily: "'Inter', 'Noto Sans Thai', sans-serif",
    }}>
      {/* Left panel */}
      <div style={{
        background: 'linear-gradient(135deg, #171A21 0%, #0F6F73 100%)',
        padding: '48px', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 70% 40%, rgba(26,157,163,0.2) 0%, transparent 65%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link href={`/${lang}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="11" r="6" fill="white" />
                <path d="M6 28c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="22" cy="18" r="3" fill="#F77F00" />
              </svg>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em' }}>
              <span style={{ color: '#2BBEC5' }}>Pro</span>
              <span style={{ color: '#F77F00' }}>find</span>
              <span style={{ color: '#2BBEC5' }}>le</span>
            </span>
          </Link>

          <blockquote style={{ fontSize: '24px', fontWeight: 700, color: 'white', lineHeight: 1.4, letterSpacing: '-0.02em', maxWidth: '380px', marginTop: '40px' }}>
            {t.leftQuote.replace('smartest', '').replace('อัจฉริยะที่สุด', '')}
            <span style={{ color: '#F77F00' }}>{lang === 'en' ? 'smartest' : 'อัจฉริยะที่สุด'}</span>
            {' '}{lang === 'en' ? 'way to find business partners' : 'ในการหาพันธมิตรทางธุรกิจของไทย'}
          </blockquote>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '16px' }}>{t.leftTagline}</p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '32px' }}>
            {[
              { icon: '✓', label: t.badge1, color: '#2BBEC5' },
              { icon: '✓', label: t.badge2, color: '#F77F00' },
              { icon: '✓', label: t.badge3, color: '#2BBEC5' },
            ].map((b, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px', padding: '10px 14px',
                fontSize: '13px', color: 'rgba(255,255,255,0.75)',
              }}>
                <span style={{ color: b.color, fontWeight: 700 }}>{b.icon}</span>
                {b.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right / Form area */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#F4F5F7', padding: '48px 40px',
      }}>
        <div style={{
          background: 'white', borderRadius: '20px', padding: '40px',
          width: '100%', maxWidth: '420px',
          boxShadow: '0 4px 24px rgba(23,26,33,0.10)',
        }}>
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#171A21', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                {t.welcomeBack}
              </h2>
              <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '28px' }}>{t.enterEmail}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#171A21', marginBottom: '8px' }}>
                    {t.emailLabel}
                  </label>
                  <input
                    type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPh}
                    required
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = '#0F6F73'; e.target.style.boxShadow = '0 0 0 3px rgba(15,111,115,0.12)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#E4E7ED'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <button type="submit" style={btnStyle}>
                  {t.continueBtn}
                </button>
              </div>

              <p style={{ textAlign: 'center', fontSize: '14px', color: '#6B7385', marginTop: '20px' }}>
                {t.noAccount}{' '}
                <Link href={`/${lang}/signup`} style={{ color: '#0F6F73', fontWeight: 600, textDecoration: 'none' }}>
                  {t.signUpLink}
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit}>
              <button
                type="button"
                onClick={() => setStep('email')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#6B7385', fontSize: '13px', cursor: 'pointer', marginBottom: '16px', padding: 0, fontFamily: 'inherit' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                {t.wrongEmail}
              </button>

              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#171A21', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                {t.checkEmail}
              </h2>
              <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '28px' }}>
                {t.otpSentTo} <strong style={{ color: '#171A21' }}>{email}</strong>
              </p>

              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#171A21', marginBottom: '12px' }}>
                {t.otpLabel}
              </label>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginBottom: '8px',
                animation: shake ? 'shake 0.4s ease' : undefined,
              }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    style={{
                      height: '56px', textAlign: 'center', fontSize: '22px', fontWeight: 700,
                      color: '#171A21', border: `1.5px solid ${error ? '#FF5A5F' : digit ? '#0F6F73' : '#E4E7ED'}`,
                      borderRadius: '12px', background: digit ? '#F0F9F9' : 'white',
                      outline: 'none', fontFamily: 'inherit', transition: 'all 150ms',
                    }}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9AA0AE', marginBottom: '16px' }}>
                <span />
                <button
                  type="button"
                  disabled={resendTimer > 0}
                  style={{ background: 'none', border: 'none', color: resendTimer > 0 ? '#9AA0AE' : '#0F6F73', fontWeight: 600, fontSize: '12px', cursor: resendTimer > 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
                  onClick={() => setResendTimer(30)}
                >
                  {resendTimer > 0 ? `${t.resendIn} ${resendTimer}s` : t.resendCode}
                </button>
              </div>

              {error && <p style={{ fontSize: '13px', color: '#FF5A5F', marginBottom: '12px' }}>{error}</p>}
              <p style={{ fontSize: '12px', color: '#9AA0AE', marginBottom: '16px' }}>
                Demo: any 6 digits work · use 000000 to see error state
              </p>

              <button type="submit" disabled={otp.join('').length < 6 || loading} style={btnStyle}>
                {loading ? '…' : t.verifyBtn}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
