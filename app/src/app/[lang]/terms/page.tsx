import { notFound } from 'next/navigation';
import { hasLocale } from '@/dictionaries';
import Link from 'next/link';

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const t = {
    title: lang === 'th' ? 'ข้อกำหนดการใช้บริการ' : 'Terms of Service',
    lastUpdated: lang === 'th' ? 'อัปเดตล่าสุด: 16 สิงหาคม 2569' : 'Last updated: August 16, 2026',
    backHome: lang === 'th' ? 'กลับหน้าหลัก' : 'Back to home',
  };

  const sections = lang === 'th' ? [
    { title: 'การยอมรับข้อกำหนด', body: 'การใช้ Profindle แสดงว่าคุณยอมรับข้อกำหนดเหล่านี้ หากคุณไม่เห็นด้วยกับส่วนใด กรุณาอย่าใช้บริการของเรา' },
    { title: 'คำอธิบายบริการ', body: 'Profindle เป็นตลาดธุรกิจ B2B ที่เชื่อมต่อบริษัทที่กำลังมองหาบริการกับผู้ให้บริการ เราทำหน้าที่เป็นแพลตฟอร์มเท่านั้น ไม่ใช่คู่สัญญาในการทำธุรกรรมระหว่างผู้ใช้ และไม่รับประกันผลลัพธ์ของการติดต่อหรือการว่าจ้างใดๆ' },
    { title: 'บัญชีผู้ใช้', body: 'คุณต้องให้ข้อมูลที่ถูกต้องและเป็นปัจจุบันเมื่อสร้างบัญชี คุณรับผิดชอบต่อการรักษาความปลอดภัยของข้อมูลการเข้าสู่ระบบและการกระทำทั้งหมดในบัญชีของคุณ' },
    { title: 'การใช้งานที่ยอมรับได้', body: 'คุณตกลงที่จะใช้ Profindle เพื่อวัตถุประสงค์ทางธุรกิจที่ถูกต้องตามกฎหมายเท่านั้น ห้ามส่งสแปม หลอกลวง ดึงข้อมูล (scraping) โดยอัตโนมัติ หรือกระทำการใดๆ ที่อาจเป็นอันตรายต่อผู้ใช้รายอื่นหรือแพลตฟอร์ม' },
    { title: 'คำขอบริการ (Broadcast)', body: 'ผู้ซื้อสามารถโพสต์คำขอบริการซึ่งจะถูกส่งไปยังผู้ให้บริการที่ตรงกับบริการ คำขอต้องเป็นความต้องการทางธุรกิจที่แท้จริงและไม่เป็นสแปม เราอาจจำกัดจำนวนคำขอต่อช่วงเวลา Profindle ไม่รับผิดชอบต่อการเจรจา สัญญา หรือการชำระเงินที่เกิดขึ้นระหว่างผู้ใช้' },
    { title: 'รายชื่อบริษัทและการรับสิทธิ์ (Claim)', body: 'แพลตฟอร์มอาจแสดงข้อมูลธุรกิจที่เปิดเผยต่อสาธารณะของบริษัทที่ยังไม่ได้ลงทะเบียน หากคุณเป็นตัวแทนของบริษัทดังกล่าว คุณสามารถขอรับสิทธิ์เพื่อจัดการ แก้ไข หรือขอให้ลบรายชื่อได้' },
    { title: 'การยืนยันตัวตนและเครื่องหมายยืนยัน', body: 'เครื่องหมาย “ยืนยันแล้ว” (Verified) หมายถึงเราได้ตรวจสอบเอกสารการจดทะเบียนนิติบุคคลเบื้องต้นแล้วเท่านั้น ไม่ถือเป็นการรับรอง การค้ำประกัน หรือการแนะนำคุณภาพของผู้ให้บริการ' },
    { title: 'แพ็กเกจและการชำระเงิน', body: 'Profindle มีแพ็กเกจฟรีและแพ็กเกจ Premium ในช่วงเปิดตัว (Early Bird) ผู้ใช้กลุ่มแรกอาจได้รับฟีเจอร์ Premium ฟรีจนถึง 31 มีนาคม 2570 ตามเงื่อนไขที่กำหนด เราอาจปรับเปลี่ยนฟีเจอร์หรือราคาในอนาคต โดยจะแจ้งให้ทราบล่วงหน้าตามสมควร' },
    { title: 'ทรัพย์สินทางปัญญา', body: 'เนื้อหาที่คุณโพสต์บน Profindle ยังคงเป็นของคุณ คุณให้สิทธิ์แก่เราในการแสดงและแจกจ่ายภายในบริการของเรา โลโก้ แบรนด์ และซอฟต์แวร์ของ Profindle เป็นทรัพย์สินของเรา' },
    { title: 'บริการของบุคคลที่สาม', body: 'บริการบางส่วนพึ่งพาผู้ให้บริการภายนอก เช่น LINE การใช้บริการเหล่านั้นอยู่ภายใต้ข้อกำหนดของผู้ให้บริการนั้นๆ ด้วย' },
    { title: 'ข้อจำกัดความรับผิด', body: 'Profindle ให้บริการ “ตามที่เป็น” เราไม่รับประกันว่าแพลตฟอร์มจะไม่มีข้อผิดพลาดหรือมีให้บริการตลอดเวลา และไม่รับผิดต่อความเสียหายทางอ้อมหรือโดยบังเอิญที่เกิดจากการใช้บริการ' },
    { title: 'การบอกเลิกสัญญา', body: 'คุณสามารถลบบัญชีได้ตลอดเวลาจากการตั้งค่า เราอาจระงับหรือยกเลิกบัญชีหากคุณละเมิดข้อกำหนดเหล่านี้' },
    { title: 'การเปลี่ยนแปลงข้อกำหนด', body: 'เราอาจปรับปรุงข้อกำหนดเหล่านี้เป็นครั้งคราว การใช้บริการต่อไปหลังการเปลี่ยนแปลงถือว่าคุณยอมรับข้อกำหนดที่ปรับปรุงแล้ว' },
    { title: 'กฎหมายที่ใช้บังคับ', body: 'ข้อกำหนดเหล่านี้อยู่ภายใต้กฎหมายไทย ข้อพิพาทใดๆ จะต้องนำขึ้นสู่ศาลที่มีอำนาจในกรุงเทพมหานคร ประเทศไทย' },
    { title: 'ติดต่อเรา', body: 'หากมีคำถามเกี่ยวกับข้อกำหนดเหล่านี้ กรุณาติดต่อ support@profindle.com' },
  ] : [
    { title: 'Acceptance of Terms', body: 'By using Profindle, you agree to these terms. If you disagree with any part, please do not use our service.' },
    { title: 'Description of Service', body: 'Profindle is a B2B marketplace that connects companies seeking services with providers. We act as a platform only — not a party to any transaction between users — and we do not guarantee the outcome of any contact or engagement.' },
    { title: 'User Accounts', body: 'You must provide accurate and current information when creating an account. You are responsible for maintaining the security of your login and all actions under your account.' },
    { title: 'Acceptable Use', body: 'You agree to use Profindle only for lawful business purposes. Do not spam, deceive, automatically scrape data, or take any action that could harm other users or the platform.' },
    { title: 'Broadcast Requests', body: 'Buyers may post service requests, which are sent to providers whose services match. Requests must be genuine business needs and not spam. We may limit the number of requests per period. Profindle is not responsible for negotiations, contracts, or payments made between users.' },
    { title: 'Company Listings & Claiming', body: 'The platform may display publicly-available business information for companies that have not yet registered. If you represent such a company, you may claim the listing to manage or correct it, or request its removal.' },
    { title: 'Verification & Badges', body: 'A “Verified” badge means only that we have performed a basic review of a company’s registration document. It is not an endorsement, guarantee, or recommendation of a provider’s quality.' },
    { title: 'Plans & Payment', body: 'Profindle offers a Free plan and a Premium plan. As a launch (Early Bird) offer, early users may receive Premium features free until 31 March 2027, subject to the stated conditions. We may change features or pricing in the future, with reasonable prior notice.' },
    { title: 'Intellectual Property', body: 'Content you post on Profindle remains yours. You grant us a license to display and distribute it within our service. Profindle\'s logo, brand, and software are our property.' },
    { title: 'Third-Party Services', body: 'Some features rely on third-party providers such as LINE. Your use of those services is also subject to their respective terms.' },
    { title: 'Limitation of Liability', body: 'Profindle provides services "as is." We do not warrant that the platform will be error-free or always available, and we are not liable for indirect or incidental damages arising from use of the service.' },
    { title: 'Termination', body: 'You may delete your account at any time from settings. We may suspend or terminate accounts that violate these terms.' },
    { title: 'Changes to Terms', body: 'We may update these terms from time to time. Continued use after changes take effect constitutes acceptance of the revised terms.' },
    { title: 'Governing Law', body: 'These terms are governed by Thai law. Any disputes shall be brought in the competent courts of Bangkok, Thailand.' },
    { title: 'Contact Us', body: 'If you have questions about these terms, please contact support@profindle.com.' },
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
              <p style={{ fontSize: '15px', color: '#444B5A', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{sec.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
