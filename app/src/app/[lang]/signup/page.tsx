'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignupPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);

  const t = lang === 'th' ? {
    title: 'สร้างบัญชีของคุณ',
    sub: 'เข้าร่วม Profindle — ฟรี ไม่ต้องใช้บัตรเครดิต',
    nameLabel: 'ชื่อ-นามสกุล',
    namePh: 'ชื่อจริงของคุณ',
    emailLabel: 'อีเมล',
    emailPh: 'you@company.com',
    btn: 'สร้างบัญชี',
    already: 'มีบัญชีอยู่แล้ว?',
    signIn: 'เข้าสู่ระบบ',
    leftQuote: 'วิธีอัจฉริยะที่สุดในการหาพันธมิตรทางธุรกิจของไทย',
    leftTagline: 'ไม่ต้องจำรหัสผ่าน เราส่งรหัสแบบใช้ครั้งเดียวไปยังอีเมลของคุณ',
  } : {
    title: 'Create your account',
    sub: 'Join Profindle — free, no credit card required',
    nameLabel: 'Full name',
    namePh: 'Your full name',
    emailLabel: 'Email address',
    emailPh: 'you@company.com',
    btn: 'Create Account',
    already: 'Already have an account?',
    signIn: 'Sign in',
    leftQuote: "Thailand's smartest way to find business partners",
    leftTagline: 'No passwords. We send a one-time code to your email.',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push(`/${lang}/home`), 800);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', fontSize: '14px', padding: '12px 16px',
    border: '1.5px solid #E4E7ED', borderRadius: '12px',
    background: 'white', outline: 'none', fontFamily: 'inherit',
    color: '#171A21',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh', fontFamily: "'Inter', 'Noto Sans Thai', sans-serif" }}>
      {/* Left panel */}
      <div style={{ background: 'linear-gradient(135deg, #171A21 0%, #0F6F73 100%)', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 70% 40%, rgba(26,157,163,0.2) 0%, transparent 65%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link href={`/${lang}`} style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '18px', fontWeight: 700 }}>
              <span style={{ color: '#2BBEC5' }}>Pro</span>
              <span style={{ color: '#F77F00' }}>find</span>
              <span style={{ color: '#2BBEC5' }}>le</span>
            </span>
          </Link>
          <blockquote style={{ fontSize: '24px', fontWeight: 700, color: 'white', lineHeight: 1.4, maxWidth: '380px', marginTop: '40px' }}>
            {t.leftQuote}
          </blockquote>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '16px' }}>{t.leftTagline}</p>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F5F7', padding: '48px 40px' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 24px rgba(23,26,33,0.10)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#171A21', letterSpacing: '-0.02em', marginBottom: '6px' }}>{t.title}</h2>
          <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '28px' }}>{t.sub}</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#171A21', marginBottom: '8px' }}>{t.nameLabel}</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t.namePh} required style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#171A21', marginBottom: '8px' }}>{t.emailLabel}</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={t.emailPh} required style={inputStyle} />
            </div>
            <button type="submit" disabled={loading} style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '15px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
              {loading ? '…' : t.btn}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#6B7385', marginTop: '20px' }}>
            {t.already}{' '}
            <Link href={`/${lang}/login`} style={{ color: '#0F6F73', fontWeight: 600, textDecoration: 'none' }}>{t.signIn}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
