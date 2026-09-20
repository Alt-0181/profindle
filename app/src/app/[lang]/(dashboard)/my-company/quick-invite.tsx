'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Onboarding shortcut shown to an owner (or a prospective owner with no company
// yet): name the company and invite a teammate to do the full setup. Not shown
// to collaborators — inviting stays owner-only.
export function QuickInvite({ lang, hasCompany }: { lang: string; hasCompany: boolean }) {
  const isTh = lang === 'th';
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [perm, setPerm] = useState({ company: true, portfolio: true });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const reset = () => { setCompanyName(''); setEmail(''); setPerm({ company: true, portfolio: true }); setError(''); setDone(false); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasCompany && !companyName.trim()) { setError(isTh ? 'กรุณาใส่ชื่อบริษัท' : 'Enter a company name'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError(isTh ? 'อีเมลไม่ถูกต้อง' : 'Enter a valid email'); return; }
    if (!perm.company && !perm.portfolio) { setError(isTh ? 'เลือกสิทธิ์อย่างน้อยหนึ่งอย่าง' : 'Pick at least one permission'); return; }
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/team/quick-invite', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: companyName.trim(), email: email.trim(), canEditCompany: perm.company, canEditPortfolio: perm.portfolio, lang }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || (isTh ? 'ส่งคำเชิญไม่สำเร็จ' : 'Could not send invite')); setBusy(false); return; }
      setDone(true); setBusy(false);
      router.refresh();
    } catch {
      setError(isTh ? 'เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่' : 'Connection failed, please try again'); setBusy(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', fontSize: '14px', padding: '11px 14px', border: '1.5px solid #E4E7ED',
    borderRadius: '10px', background: 'white', outline: 'none', fontFamily: 'inherit', color: '#171A21', boxSizing: 'border-box',
  };

  return (
    <>
      {/* Entry card */}
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
              ? 'เชิญเพื่อนร่วมงานมากรอกข้อมูลบริษัทและผลงานแทนได้ตั้งแต่ตอนนี้ โดยที่สิทธิ์ในการ เพิ่ม ลบ เพื่อนร่วมงาน จะยังถูกจำกัดไว้แค่เจ้าของบริษัทเท่านั้น'
              : 'Invite a teammate to fill in the company info and portfolio for you — adding or removing teammates stays owner-only.'}
          </div>
        </div>
        <button onClick={() => { reset(); setOpen(true); }} style={{ background: 'white', color: '#0F6F73', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, border: '1.5px solid rgba(15,111,115,0.2)', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {isTh ? 'เชิญเพื่อนร่วมงาน' : 'Invite a teammate'}
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(23,26,33,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '18px', width: '100%', maxWidth: '440px', padding: '28px', boxSizing: 'border-box', fontFamily: "'Inter','Noto Sans Thai',sans-serif" }}>
            {done ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎉</div>
                <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#171A21', marginBottom: '8px' }}>{isTh ? 'ส่งคำเชิญแล้ว' : 'Invite sent'}</h2>
                <p style={{ fontSize: '14px', color: '#6B7385', lineHeight: 1.6, marginBottom: '20px' }}>
                  {isTh
                    ? `เราส่งลิงก์ให้ ${email} เพื่อตั้งรหัสผ่านและเริ่มช่วยจัดการ หากอีเมลนั้นมีบัญชีอยู่แล้ว เพียงเข้าสู่ระบบก็จะถูกเพิ่มเข้าทีมอัตโนมัติ`
                    : `We emailed ${email} a link to set a password and start helping. If that address already has an account, signing in adds them automatically.`}
                </p>
                <button onClick={() => setOpen(false)} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)', color: 'white', fontWeight: 600, fontSize: '15px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {isTh ? 'เสร็จสิ้น' : 'Done'}
                </button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#171A21', marginBottom: '4px' }}>{isTh ? 'เชิญเพื่อนร่วมงานมาช่วยตั้งค่า' : 'Invite a teammate to set up'}</h2>
                <p style={{ fontSize: '13px', color: '#6B7385', marginBottom: '20px', lineHeight: 1.55 }}>
                  {isTh ? 'ตั้งชื่อบริษัทแล้วเชิญคนที่จะกรอกรายละเอียดให้ พวกเขาจะได้รับลิงก์เพื่อตั้งรหัสผ่านและเริ่มทำงาน' : 'Name your company and invite the person who’ll fill in the details. They’ll get a link to set a password and start.'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {!hasCompany && (
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>{isTh ? 'ชื่อบริษัท' : 'Company name'}</label>
                      <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder={isTh ? 'เช่น บริษัท แอคมี จำกัด' : 'e.g. Acme Co., Ltd.'} style={inputStyle} />
                    </div>
                  )}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>{isTh ? 'อีเมลเพื่อนร่วมงาน' : 'Teammate’s email'}</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '8px' }}>{isTh ? 'สิทธิ์การจัดการ' : 'What they can manage'}</label>
                    <div style={{ display: 'flex', gap: '18px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13.5px', color: '#444B5A', cursor: 'pointer' }}>
                        <input type="checkbox" checked={perm.company} onChange={e => setPerm(p => ({ ...p, company: e.target.checked }))} />
                        {isTh ? 'จัดการข้อมูลบริษัท' : 'Company info'}
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13.5px', color: '#444B5A', cursor: 'pointer' }}>
                        <input type="checkbox" checked={perm.portfolio} onChange={e => setPerm(p => ({ ...p, portfolio: e.target.checked }))} />
                        {isTh ? 'จัดการผลงาน' : 'Portfolio'}
                      </label>
                    </div>
                  </div>
                  {error && <p style={{ fontSize: '13px', color: '#FF5A5F', margin: 0 }}>{error}</p>}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button type="button" onClick={() => setOpen(false)} style={{ flex: '0 0 auto', padding: '12px 18px', background: 'white', color: '#6B7385', fontWeight: 600, fontSize: '14px', border: '1.5px solid #E4E7ED', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {isTh ? 'ยกเลิก' : 'Cancel'}
                    </button>
                    <button type="submit" disabled={busy} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)', color: 'white', fontWeight: 600, fontSize: '15px', border: 'none', borderRadius: '12px', cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: busy ? 0.7 : 1 }}>
                      {busy ? '…' : (isTh ? 'ส่งคำเชิญ' : 'Send invite')}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
