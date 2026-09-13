import { notFound } from 'next/navigation';
import { hasLocale } from '@/dictionaries';
import Link from 'next/link';

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const t = {
    title: lang === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy',
    lastUpdated: lang === 'th' ? 'อัปเดตล่าสุด: 16 สิงหาคม 2569' : 'Last updated: August 16, 2026',
    backHome: lang === 'th' ? 'กลับหน้าหลัก' : 'Back to home',
  };

  const sections = lang === 'th' ? [
    { title: 'บทนำและผู้ควบคุมข้อมูล', body: 'Profindle (“เรา”) เป็นผู้ให้บริการแพลตฟอร์มตลาดบริการ B2B ที่ profindle.com นโยบายนี้อธิบายว่าเราเก็บรวบรวม ใช้ เปิดเผย และคุ้มครองข้อมูลส่วนบุคคลของคุณอย่างไร ภายใต้พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) ของประเทศไทย\n\nผู้ควบคุมข้อมูล: Profindle ผู้ดำเนินการเว็บไซต์ profindle.com\nติดต่อเรื่องข้อมูลส่วนบุคคล: support@profindle.com' },
    { title: 'ข้อมูลที่เราเก็บรวบรวม', body: '• ข้อมูลบัญชี: ชื่อ อีเมล และรหัสผ่าน (จัดเก็บแบบเข้ารหัส/แฮชโดยระบบยืนยันตัวตนของเรา)\n• ข้อมูลโปรไฟล์บริษัท: ชื่อบริษัท คำอธิบาย บริการ จังหวัด ที่อยู่ เว็บไซต์ และช่องทางติดต่อขององค์กร (อีเมล/เบอร์โทร/LINE ขององค์กร)\n• เอกสารยืนยัน: หนังสือรับรองการจดทะเบียนนิติบุคคล (DBD) ที่คุณอัปโหลด จัดเก็บในพื้นที่จัดเก็บแบบส่วนตัว\n• ข้อมูล LINE: LINE User ID และชื่อที่แสดง เมื่อคุณเชื่อมต่อบัญชี LINE เพื่อรับการแจ้งเตือน\n• รายชื่อบริษัทจากแหล่งข้อมูลสาธารณะ: เราอาจแสดงข้อมูลธุรกิจที่เปิดเผยต่อสาธารณะของบริษัทที่ยังไม่ได้ลงทะเบียน\n• ข้อมูลการใช้งานและอุปกรณ์: หน้าที่เข้าชม คำค้นหา การดูโปรไฟล์/ผลงาน การคลิกคำขอบริการ ประเภทอุปกรณ์/เบราว์เซอร์ และข้อมูลสถิติการเข้าชม\n• คุกกี้: คุกกี้เซสชันสำหรับการเข้าสู่ระบบ และคุกกี้จาก Cloudflare Turnstile เพื่อป้องกันบอท' },
    { title: 'วิธีที่เราใช้ข้อมูลและฐานทางกฎหมาย', body: 'เราใช้ข้อมูลของคุณเพื่อ:\n• ให้บริการแพลตฟอร์มและเชื่อมต่อผู้ซื้อกับผู้ให้บริการ (ฐาน: การปฏิบัติตามสัญญา)\n• ส่งการแจ้งเตือนที่เกี่ยวข้อง รวมถึงผ่าน LINE (ฐาน: สัญญา/ความยินยอม)\n• ยืนยันตัวตนของบริษัทและป้องกันการฉ้อโกง (ฐาน: ประโยชน์โดยชอบด้วยกฎหมาย)\n• ปรับปรุงและวิเคราะห์การใช้งานแพลตฟอร์ม (ฐาน: ประโยชน์โดยชอบด้วยกฎหมาย)\n• ปฏิบัติตามกฎหมายที่เกี่ยวข้อง (ฐาน: หน้าที่ตามกฎหมาย)\n\nเราไม่ขายข้อมูลส่วนบุคคลของคุณให้บุคคลที่สาม' },
    { title: 'การเปิดเผยและการแบ่งปันข้อมูล', body: '• โปรไฟล์บริษัทและบริการของคุณจะแสดงต่อสาธารณะบนแพลตฟอร์ม\n• เมื่อผู้ซื้อโพสต์คำขอบริการ (Broadcast) รายละเอียดคำขอและช่องทางติดต่อขององค์กรจะถูกส่งไปยังผู้ให้บริการที่ตรงกับบริการ\n• เราแบ่งปันข้อมูลกับผู้ประมวลผลข้อมูลที่ช่วยเราดำเนินงาน (ดูหัวข้อถัดไป)\n• เราอาจเปิดเผยข้อมูลเมื่อจำเป็นตามกฎหมายหรือคำสั่งของหน่วยงานที่มีอำนาจ' },
    { title: 'ผู้ประมวลผลข้อมูลและบริการภายนอก', body: 'เราใช้ผู้ให้บริการภายนอกที่เชื่อถือได้เพื่อดำเนินงาน ซึ่งบางรายอาจประมวลผลข้อมูลนอกประเทศไทย:\n• Supabase — ฐานข้อมูล การยืนยันตัวตน และการจัดเก็บไฟล์\n• Vercel — โฮสติ้งและสถิติการเข้าชมเว็บไซต์\n• Cloudflare — การป้องกันบอท (Turnstile)\n• LINE — การแจ้งเตือนและการเชื่อมต่อบัญชี\n• Anthropic (Claude) — เราใช้ AI เพื่อช่วยกรอกและจัดระเบียบข้อมูลโปรไฟล์บริษัท โดยอาจส่งข้อมูลธุรกิจที่เกี่ยวข้องไปประมวลผล\n• ผู้ให้บริการอีเมล — สำหรับการแจ้งเตือนทางอีเมล' },
    { title: 'การส่งหรือโอนข้อมูลไปต่างประเทศ', body: 'ผู้ประมวลผลข้อมูลบางรายอยู่นอกประเทศไทย การโอนข้อมูลไปต่างประเทศจะดำเนินการภายใต้มาตรการคุ้มครองที่เหมาะสมตามที่ PDPA กำหนด' },
    { title: 'ระยะเวลาการเก็บรักษาข้อมูล', body: 'เราเก็บรักษาข้อมูลส่วนบุคคลตราบเท่าที่จำเป็นในการให้บริการและตามที่กฎหมายกำหนด เมื่อคุณลบบัญชี เราจะลบหรือทำให้ข้อมูลไม่สามารถระบุตัวตนได้ ภายในระยะเวลาที่เหมาะสม เว้นแต่ต้องเก็บไว้ตามข้อกำหนดทางกฎหมาย' },
    { title: 'ความปลอดภัยของข้อมูล', body: 'เราใช้การเข้ารหัสมาตรฐานอุตสาหกรรม (TLS/HTTPS) การควบคุมการเข้าถึงระดับแถว (RLS) และการจัดเก็บเอกสารในพื้นที่ส่วนตัว รหัสผ่านถูกจัดเก็บแบบแฮชโดยระบบยืนยันตัวตนของเรา และไม่มีการเก็บในรูปแบบข้อความธรรมดา' },
    { title: 'สิทธิ์ของเจ้าของข้อมูล', body: 'ภายใต้ PDPA คุณมีสิทธิ์: เข้าถึงและขอสำเนาข้อมูล แก้ไขข้อมูลให้ถูกต้อง ลบข้อมูล ระงับการใช้ คัดค้านการประมวลผล ขอให้โอนข้อมูล และถอนความยินยอม รวมถึงสิทธิ์ร้องเรียนต่อสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล (PDPC)\n\nดำเนินการได้จากการตั้งค่าบัญชี หรือติดต่อ support@profindle.com' },
    { title: 'รายชื่อบริษัทจากแหล่งข้อมูลสาธารณะ', body: 'แพลตฟอร์มอาจแสดงข้อมูลธุรกิจที่เปิดเผยต่อสาธารณะของบริษัทที่ยังไม่ได้ลงทะเบียน เพื่อช่วยให้ผู้ซื้อค้นพบผู้ให้บริการ หากคุณเป็นตัวแทนของบริษัทดังกล่าว คุณสามารถขอรับสิทธิ์ (Claim) เพื่อแก้ไข หรือขอให้ลบรายชื่อออกได้ที่ support@profindle.com' },
    { title: 'คุกกี้', body: 'เราใช้คุกกี้ที่จำเป็นสำหรับการเข้าสู่ระบบและความปลอดภัย (เช่น เซสชัน และ Cloudflare Turnstile) สถิติการเข้าชมของเราออกแบบให้เป็นมิตรกับความเป็นส่วนตัวและไม่ใช้คุกกี้เพื่อติดตามข้ามเว็บไซต์' },
    { title: 'การเปลี่ยนแปลงนโยบาย', body: 'เราอาจปรับปรุงนโยบายนี้เป็นครั้งคราว การเปลี่ยนแปลงที่สำคัญจะแจ้งผ่านแพลตฟอร์มหรืออีเมล วันที่อัปเดตล่าสุดจะแสดงไว้ด้านบน' },
    { title: 'ติดต่อเรา', body: 'หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ หรือต้องการใช้สิทธิ์ของคุณ กรุณาติดต่อ support@profindle.com' },
  ] : [
    { title: 'Introduction & Data Controller', body: 'Profindle (“we”, “us”) operates the B2B service marketplace at profindle.com. This policy explains how we collect, use, disclose, and protect your personal data under Thailand’s Personal Data Protection Act B.E. 2562 (PDPA).\n\nData controller: Profindle, operator of profindle.com\nData protection contact: support@profindle.com' },
    { title: 'Information We Collect', body: '• Account data: name, email, and password (stored encrypted/hashed by our authentication provider).\n• Company profile: company name, description, services, province, address, website, and organisational contact channels (org email/phone/LINE).\n• Verification documents: the company registration (DBD) document you upload, kept in private storage.\n• LINE data: your LINE User ID and display name, when you connect LINE for notifications.\n• Publicly-sourced business listings: we may display publicly-available business information for companies that have not yet registered.\n• Usage & device data: pages visited, searches, profile/portfolio views, request clicks, device/browser type, and traffic analytics.\n• Cookies: a login session cookie and a Cloudflare Turnstile cookie for bot protection.' },
    { title: 'How We Use Your Data & Legal Bases', body: 'We use your data to:\n• Provide the platform and connect buyers with providers (basis: performance of a contract).\n• Send relevant notifications, including via LINE (basis: contract / consent).\n• Verify companies and prevent fraud (basis: legitimate interest).\n• Improve and analyse platform usage (basis: legitimate interest).\n• Comply with applicable law (basis: legal obligation).\n\nWe do not sell your personal data to third parties.' },
    { title: 'Disclosure & Sharing', body: '• Your company profile and services are publicly visible on the platform.\n• When a buyer posts a broadcast request, the request details and the buyer’s organisational contact channels are sent to providers whose services match.\n• We share data with processors that help us operate the service (see below).\n• We may disclose data where required by law or a lawful authority.' },
    { title: 'Processors & Third-Party Services', body: 'We use trusted third-party providers to operate the service; some may process data outside Thailand:\n• Supabase — database, authentication, and file storage.\n• Vercel — hosting and website traffic analytics.\n• Cloudflare — bot protection (Turnstile).\n• LINE — notifications and account linking.\n• Anthropic (Claude) — we use AI to help draft and organise company profile data, which may involve sending relevant business information for processing.\n• Email provider — for email notifications.' },
    { title: 'International Data Transfers', body: 'Some of our processors are located outside Thailand. Any cross-border transfer is carried out with appropriate safeguards as required by the PDPA.' },
    { title: 'Data Retention', body: 'We retain personal data for as long as necessary to provide the service and as required by law. When you delete your account, we delete or anonymise your data within a reasonable period, unless retention is required by legal obligation.' },
    { title: 'Security', body: 'We use industry-standard encryption (TLS/HTTPS), row-level access controls (RLS), and private storage for documents. Passwords are stored hashed by our authentication provider and never in plain text.' },
    { title: 'Your Rights', body: 'Under the PDPA you have the right to: access and obtain a copy of your data, correct inaccurate data, erase data, restrict processing, object to processing, request data portability, and withdraw consent. You may also lodge a complaint with the Personal Data Protection Committee (PDPC).\n\nYou can exercise these rights in your account settings or by contacting support@profindle.com.' },
    { title: 'Publicly-Sourced Company Listings', body: 'The platform may display publicly-available business information for companies that have not yet registered, to help buyers discover providers. If you represent such a company, you can claim the listing to correct it, or request its removal, at support@profindle.com.' },
    { title: 'Cookies', body: 'We use cookies that are necessary for login and security (such as the session cookie and Cloudflare Turnstile). Our traffic analytics are designed to be privacy-friendly and do not use cross-site tracking cookies.' },
    { title: 'Changes to This Policy', body: 'We may update this policy from time to time. Material changes will be communicated through the platform or by email. The “last updated” date above reflects the latest revision.' },
    { title: 'Contact Us', body: 'If you have questions about this Privacy Policy or wish to exercise your rights, please contact support@profindle.com.' },
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
