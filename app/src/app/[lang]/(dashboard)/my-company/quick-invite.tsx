'use client';

import { useRouter } from 'next/navigation';

// Onboarding nudge shown to an owner on My Company: hand setup to a teammate.
// Clicking through takes them straight to Settings → Team — the single home for
// inviting and managing collaborators — instead of opening a throwaway modal.
// Not shown to collaborators; inviting stays owner-only.
export function QuickInvite({ lang }: { lang: string; hasCompany?: boolean; companyName?: string }) {
  const isTh = lang === 'th';
  const router = useRouter();

  const goToTeam = () => router.push(`/${lang}/settings?section=team`);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'linear-gradient(135deg,#F0F9F9,#EAF6F6)', border: '1px solid rgba(15,111,115,0.15)', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px' }}>
      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'white', border: '1px solid rgba(15,111,115,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#171A21', marginBottom: '2px' }}>
          {isTh ? 'ให้คนในทีมจัดการแทนคุณสิ' : 'Let your team handle it for you'}
        </div>
        <div style={{ fontSize: '12.5px', color: '#6B7385', lineHeight: 1.5 }}>
          {isTh
            ? 'เชิญเพื่อนร่วมงานมากรอกข้อมูลบริษัทและผลงานแทนได้ตั้งแต่ตอนนี้ โดยที่สิทธิ์ในการ เพิ่ม ลบ เพื่อนร่วมงาน จะยังถูกจำกัดไว้แค่เจ้าของบริษัทเท่านั้น หรือถ้าอยากกรอกเอง สามารถลุยต่อได้เลย'
            : 'Invite a teammate to fill in the company info and portfolio for you — adding or removing teammates stays owner-only. Or if you’d rather do it yourself, just carry on below.'}
        </div>
      </div>
      <button onClick={goToTeam} style={{ background: 'white', color: '#0F6F73', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, border: '1.5px solid rgba(15,111,115,0.2)', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {isTh ? 'เชิญเพื่อนร่วมงาน' : 'Invite a teammate'}
      </button>
    </div>
  );
}
