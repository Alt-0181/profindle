import { notFound } from 'next/navigation';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import Link from 'next/link';

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const t = {
    title: lang === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy',
    lastUpdated: lang === 'th' ? 'อัปเดตล่าสุด: 29 พฤษภาคม 2568' : 'Last updated: May 29, 2025',
    backHome: lang === 'th' ? 'กลับหน้าหลัก' : 'Back to home',
  };

  const sections = lang === 'th' ? [
    { title: 'ข้อมูลที่เราเก็บรวบรวม', body: 'เราเก็บรวบรวมข้อมูลที่คุณให้โดยตรง เช่น ชื่อ อีเมล และข้อมูลบริษัทของคุณ เมื่อคุณลงทะเบียนและใช้งาน Profindle นอกจากนี้เรายังเก็บข้อมูลการใช้งาน เช่น หน้าที่เข้าชม คุณสมบัติที่ใช้งาน และเวลาที่ใช้บนแพลตฟอร์ม' },
    { title: 'วิธีที่เราใช้ข้อมูล', body: 'เราใช้ข้อมูลของคุณเพื่อให้บริการ Profindle เชื่อมต่อผู้ซื้อกับผู้ให้บริการ ส่งการแจ้งเตือนที่เกี่ยวข้อง และปรับปรุงแพลตฟอร์มของเรา เราไม่ขายข้อมูลส่วนตัวของคุณให้กับบุคคลที่สาม' },
    { title: 'การแชร์ข้อมูล', body: 'โปรไฟล์บริษัทและบริการของคุณจะมองเห็นได้โดยสาธารณะบนแพลตฟอร์ม เราอาจแชร์ข้อมูลกับผู้ให้บริการบุคคลที่สามที่ช่วยเราดำเนินงาน Profindle ภายใต้ข้อตกลงการรักษาความลับ' },
    { title: 'การรักษาความปลอดภัย', body: 'เราใช้การเข้ารหัสอุตสาหกรรมมาตรฐาน (TLS/HTTPS) และแนวปฏิบัติด้านความปลอดภัยที่ดีที่สุดเพื่อปกป้องข้อมูลของคุณ การยืนยันตัวตนทำผ่าน OTP อีเมล ไม่มีรหัสผ่านที่จัดเก็บ' },
    { title: 'สิทธิ์ของคุณ', body: 'คุณมีสิทธิ์เข้าถึง แก้ไข หรือลบข้อมูลส่วนตัวของคุณได้ตลอดเวลา สามารถดำเนินการได้จากการตั้งค่าบัญชีหรือติดต่อทีมสนับสนุนของเรา' },
    { title: 'ติดต่อเรา', body: 'หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ กรุณาติดต่อ privacy@profindle.com' },
  ] : [
    { title: 'Information We Collect', body: 'We collect information you provide directly, such as your name, email, and company details when you register and use Profindle. We also collect usage data such as pages visited, features used, and time spent on the platform.' },
    { title: 'How We Use Your Information', body: 'We use your information to provide the Profindle service, connect buyers with providers, send relevant notifications, and improve our platform. We do not sell your personal information to third parties.' },
    { title: 'Information Sharing', body: 'Your company profile and services are publicly visible on the platform. We may share data with third-party service providers who help us operate Profindle under confidentiality agreements.' },
    { title: 'Security', body: 'We use industry-standard encryption (TLS/HTTPS) and security best practices to protect your data. Authentication is via email OTP — no passwords are stored.' },
    { title: 'Your Rights', body: 'You have the right to access, correct, or delete your personal information at any time. This can be done through your account settings or by contacting our support team.' },
    { title: 'Contact Us', body: 'If you have questions about this Privacy Policy, please contact privacy@profindle.com' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FC', fontFamily: 'Inter, "Noto Sans Thai", sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E4E7ED', padding: '16px 0' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={`/${lang}`} style={{ textDecoration: 'none' }}>
            <img src="/assets/logo.svg" alt="Profindle" style={{ height: '26px', width: 'auto' }} />
          </Link>
          <Link href={`/${lang}`} style={{ fontSize: '13px', color: '#0F6F73', fontWeight: 600, textDecoration: 'none' }}>
            ← {t.backHome}
          </Link>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#171A21', letterSpacing: '-0.03em', marginBottom: '8px' }}>{t.title}</h1>
        <p style={{ fontSize: '13px', color: '#9AA0AE', marginBottom: '40px' }}>{t.lastUpdated}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {sections.map((sec) => (
            <div key={sec.title}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#171A21', marginBottom: '10px' }}>{sec.title}</h2>
              <p style={{ fontSize: '15px', color: '#444B5A', lineHeight: 1.7 }}>{sec.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
