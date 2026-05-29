import { notFound } from 'next/navigation';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import Link from 'next/link';

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const t = {
    title: lang === 'th' ? 'ข้อกำหนดการใช้บริการ' : 'Terms of Service',
    lastUpdated: lang === 'th' ? 'อัปเดตล่าสุด: 29 พฤษภาคม 2568' : 'Last updated: May 29, 2025',
    backHome: lang === 'th' ? 'กลับหน้าหลัก' : 'Back to home',
  };

  const sections = lang === 'th' ? [
    { title: 'การยอมรับข้อกำหนด', body: 'การใช้ Profindle แสดงว่าคุณยอมรับข้อกำหนดเหล่านี้ หากคุณไม่เห็นด้วยกับส่วนใด กรุณาอย่าใช้บริการของเรา' },
    { title: 'คำอธิบายบริการ', body: 'Profindle เป็นตลาดธุรกิจ B2B ที่เชื่อมต่อบริษัทที่กำลังมองหาบริการกับผู้ให้บริการที่ยืนยันแล้ว เราทำหน้าที่เป็นแพลตฟอร์มเท่านั้น ไม่ใช่คู่สัญญาในการทำธุรกรรมใดๆ' },
    { title: 'บัญชีผู้ใช้', body: 'คุณต้องให้ข้อมูลที่ถูกต้องและเป็นปัจจุบันเมื่อสร้างบัญชี คุณรับผิดชอบต่อการรักษาความปลอดภัยของข้อมูลการเข้าสู่ระบบและการกระทำทั้งหมดในบัญชีของคุณ' },
    { title: 'การใช้งานที่ยอมรับได้', body: 'คุณตกลงที่จะใช้ Profindle เพื่อวัตถุประสงค์ทางธุรกิจที่ถูกต้องตามกฎหมายเท่านั้น ห้ามสแปม หลอกลวง หรือกระทำการใดๆ ที่อาจเป็นอันตรายต่อผู้ใช้รายอื่นหรือแพลตฟอร์ม' },
    { title: 'ทรัพย์สินทางปัญญา', body: 'เนื้อหาที่คุณโพสต์บน Profindle ยังคงเป็นของคุณ คุณให้สิทธิ์แก่เราในการแสดงและแจกจ่ายในบริการของเรา โลโก้ แบรนด์ และซอฟต์แวร์ของ Profindle เป็นทรัพย์สินของเรา' },
    { title: 'ข้อจำกัดความรับผิด', body: 'Profindle ให้บริการ "ตามที่เป็น" เราไม่รับประกันว่าแพลตฟอร์มจะไม่มีข้อผิดพลาดหรือมีให้บริการตลอดเวลา เราไม่รับผิดต่อความเสียหายทางอ้อมหรือโดยบังเอิญ' },
    { title: 'การบอกเลิกสัญญา', body: 'คุณสามารถลบบัญชีได้ตลอดเวลาจากการตั้งค่า เราอาจระงับหรือยกเลิกบัญชีหากคุณละเมิดข้อกำหนดเหล่านี้' },
    { title: 'กฎหมายที่ใช้บังคับ', body: 'ข้อกำหนดเหล่านี้อยู่ภายใต้กฎหมายไทย ข้อพิพาทใดๆ จะต้องนำขึ้นสู่ศาลที่มีอำนาจในกรุงเทพมหานคร ประเทศไทย' },
  ] : [
    { title: 'Acceptance of Terms', body: 'By using Profindle, you agree to these terms. If you disagree with any part, please do not use our service.' },
    { title: 'Description of Service', body: 'Profindle is a B2B marketplace that connects companies seeking services with verified providers. We act as a platform only — not a party to any transaction between users.' },
    { title: 'User Accounts', body: 'You must provide accurate and current information when creating an account. You are responsible for maintaining the security of your login and all actions under your account.' },
    { title: 'Acceptable Use', body: 'You agree to use Profindle only for lawful business purposes. Do not spam, deceive, or take any action that could harm other users or the platform.' },
    { title: 'Intellectual Property', body: 'Content you post on Profindle remains yours. You grant us a license to display and distribute it within our service. Profindle\'s logo, brand, and software are our property.' },
    { title: 'Limitation of Liability', body: 'Profindle provides services "as is." We do not warrant that the platform will be error-free or always available. We are not liable for indirect or incidental damages.' },
    { title: 'Termination', body: 'You may delete your account at any time from settings. We may suspend or terminate accounts that violate these terms.' },
    { title: 'Governing Law', body: 'These terms are governed by Thai law. Any disputes shall be brought in the competent courts of Bangkok, Thailand.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FC', fontFamily: 'Inter, "Noto Sans Thai", sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E4E7ED', padding: '16px 0' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={`/${lang}`} style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.04em' }}>
              <span style={{ color: '#0F6F73' }}>Pro</span>
              <span style={{ color: '#F77F00' }}>find</span>
              <span style={{ color: '#0F6F73' }}>le</span>
            </div>
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
