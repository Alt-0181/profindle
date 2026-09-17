import Link from 'next/link';
import { notFound } from 'next/navigation';
import { hasLocale } from '@/dictionaries';
import { createClient } from '@/lib/supabase/server';
import { createClient as adminClient } from '@supabase/supabase-js';

// A collaborator lands here from the invite email (already signed in via the
// magic link). We activate every pending membership matching their email.
export default async function AcceptInvitePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const isTh = lang === 'th';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const wrap = (inner: React.ReactNode) => (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F5F7', padding: '24px' }}>
      <div style={{ background: 'white', borderRadius: '18px', border: '1px solid #E4E7ED', padding: '36px', maxWidth: '440px', width: '100%', textAlign: 'center' }}>{inner}</div>
    </div>
  );

  if (!user) {
    return wrap(
      <>
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔑</div>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#171A21', marginBottom: '8px' }}>{isTh ? 'เข้าสู่ระบบเพื่อรับคำเชิญ' : 'Sign in to accept your invite'}</h1>
        <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '20px', lineHeight: 1.6 }}>{isTh ? 'กรุณาเข้าสู่ระบบด้วยอีเมลที่ได้รับคำเชิญ แล้วเปิดลิงก์นี้อีกครั้ง' : 'Please sign in with the email you were invited on, then open this link again.'}</p>
        <Link href={`/${lang}/login`} style={{ display: 'inline-block', padding: '11px 22px', background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>{isTh ? 'เข้าสู่ระบบ' : 'Sign in'}</Link>
      </>,
    );
  }

  const admin = adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
  const email = (user.email ?? '').toLowerCase();

  const { data: pending } = await admin
    .from('company_members')
    .select('id, company_id')
    .eq('invited_email', email)
    .eq('status', 'pending');

  let activated = 0;
  if (pending && pending.length > 0) {
    const { error } = await admin
      .from('company_members')
      .update({ user_id: user.id, status: 'active', accepted_at: new Date().toISOString() })
      .eq('invited_email', email)
      .eq('status', 'pending');
    if (!error) activated = pending.length;
  }

  // Already active (opened the link twice)?
  let alreadyActive = 0;
  if (activated === 0) {
    const { count } = await admin
      .from('company_members')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id).eq('status', 'active');
    alreadyActive = count ?? 0;
  }

  const ok = activated > 0 || alreadyActive > 0;
  return wrap(
    <>
      <div style={{ fontSize: '40px', marginBottom: '8px' }}>{ok ? '🎉' : '📭'}</div>
      <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#171A21', marginBottom: '8px' }}>
        {ok ? (isTh ? 'ยินดีต้อนรับเข้าทีม!' : 'You’re on the team!') : (isTh ? 'ไม่พบคำเชิญ' : 'No invite found')}
      </h1>
      <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '20px', lineHeight: 1.6 }}>
        {ok
          ? (isTh ? 'คุณสามารถช่วยจัดการโปรไฟล์บริษัทได้แล้ว' : 'You can now help manage the company profile.')
          : (isTh ? `ไม่พบคำเชิญที่ค้างอยู่สำหรับ ${email} — กรุณาตรวจสอบกับผู้เชิญว่าใช้อีเมลนี้` : `No pending invite for ${email} — check with whoever invited you that they used this email.`)}
      </p>
      <Link href={`/${lang}/my-company`} style={{ display: 'inline-block', padding: '11px 22px', background: ok ? 'linear-gradient(135deg,#0F6F73,#1A9DA3)' : 'transparent', color: ok ? 'white' : '#0F6F73', border: ok ? 'none' : '1.5px solid #0F6F73', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
        {ok ? (isTh ? 'ไปที่บริษัท' : 'Go to the company') : (isTh ? 'ไปหน้าหลัก' : 'Go to dashboard')}
      </Link>
    </>,
  );
}
