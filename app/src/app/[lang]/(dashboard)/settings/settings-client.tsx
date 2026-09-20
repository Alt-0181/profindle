'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Dictionary } from '@/dictionaries';
import { createClient } from '@/lib/supabase/client';

interface SettingsClientProps {
  lang: string;
  dict: Dictionary;
  initialLineUserId: string | null;
  initialLineDisplayName?: string | null;
  userEmail: string;
  userName: string;
  lineOAuthResult: string | null;
  initialSection: string | null;
  justInvited?: boolean;
  isPremium: boolean;
  isOwner?: boolean;
  members?: TeamMember[];
  companyId?: string | null;
  requireApproval?: boolean;
  pendingChanges?: PendingChange[];
  companyCurrent?: Record<string, any> | null;
}

export interface TeamMember {
  id: string;
  invited_email: string;
  can_edit_company: boolean;
  can_edit_portfolio: boolean;
  status: string;
}

export interface PendingChange {
  id: string;
  author_email: string | null;
  entity: string;
  op: string;
  entity_id: string | null;
  payload: Record<string, any> | null;
  created_at: string;
}

export function SettingsClient({ lang, dict, initialLineUserId, initialLineDisplayName, userEmail, userName, lineOAuthResult, initialSection, justInvited = false, isPremium, isOwner = false, members = [], companyId = null, requireApproval = false, pendingChanges = [], companyCurrent = null }: SettingsClientProps) {
  const t = dict.settings;
  const router = useRouter();
  const [activeSection, setActiveSection] = useState(initialSection ?? 'account');

  // Account
  const [displayName, setDisplayName] = useState(userName);
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountSaved, setAccountSaved] = useState(false);
  const [accountError, setAccountError] = useState('');

  // LINE
  const [lineConnected, setLineConnected] = useState(!!initialLineUserId || lineOAuthResult === 'connected');
  const [lineStep, setLineStep] = useState(1);
  const [showManual, setShowManual] = useState(false);
  const [manualUID, setManualUID] = useState('');
  const [lineLoading, setLineLoading] = useState(false);
  const [lineError, setLineError] = useState(lineOAuthResult === 'error' ? (lang === 'th' ? 'เชื่อมต่อไม่สำเร็จ — กรุณาลองใหม่' : 'Connection failed — please try again') : '');

  const [notifs, setNotifs] = useState({ broadcast: true, views: true, system: true });
  const [deleteEmail, setDeleteEmail] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // ── Team / collaborators ──────────────────────────────────────────────────
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePerms, setInvitePerms] = useState({ company: true, portfolio: true });
  const [inviteBusy, setInviteBusy] = useState(false);
  // When the owner arrives here right after sending an invite from My Company,
  // greet them with a confirmation (they also see the new pending member below).
  const [inviteMsg, setInviteMsg] = useState(justInvited
    ? (lang === 'th' ? 'ส่งคำเชิญเรียบร้อยแล้ว — ดูรายชื่อผู้ร่วมจัดการด้านล่าง' : 'Invite sent — see your collaborators below')
    : '');
  const [inviteErr, setInviteErr] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const sendInvite = async () => {
    setInviteMsg(''); setInviteErr('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.trim())) { setInviteErr(lang === 'th' ? 'กรุณากรอกอีเมลให้ถูกต้อง' : 'Enter a valid email'); return; }
    if (!invitePerms.company && !invitePerms.portfolio) { setInviteErr(lang === 'th' ? 'เลือกสิทธิ์อย่างน้อย 1 อย่าง' : 'Pick at least one permission'); return; }
    setInviteBusy(true);
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), canEditCompany: invitePerms.company, canEditPortfolio: invitePerms.portfolio, lang }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed');
      setInviteEmail('');
      // Show the owner a clean message only. The technical reason for a failed
      // send (e.g. a missing key) is logged server-side, never shown here.
      setInviteMsg(data.emailSent
        ? (lang === 'th' ? 'ส่งคำเชิญทางอีเมลแล้ว — คุณสามารถแจ้งผู้รับให้กดลิงก์เพื่อตั้งรหัสผ่านและเข้าร่วมได้เลย' : 'Invite email sent — you can let them know to click the link to set a password and join')
        : (lang === 'th' ? 'เพิ่มคำเชิญแล้ว — เมื่อผู้รับเข้าสู่ระบบด้วยอีเมลนี้ ระบบจะเพิ่มเข้าทีมให้อัตโนมัติ' : 'Invite created — they’ll be added automatically when they sign in with this email'));
      router.refresh();
    } catch (e: any) {
      setInviteErr(e?.message || (lang === 'th' ? 'ส่งคำเชิญไม่สำเร็จ' : 'Could not send invite'));
    } finally { setInviteBusy(false); }
  };

  // ── Approval gate for collaborator changes ────────────────────────────────
  const [approvalOn, setApprovalOn] = useState(requireApproval);
  const [approvalBusy, setApprovalBusy] = useState(false);
  const toggleApproval = async () => {
    const next = !approvalOn;
    setApprovalOn(next); setApprovalBusy(true);
    try {
      const res = await fetch('/api/collab/approval-setting', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, requireApproval: next }),
      });
      if (!res.ok) setApprovalOn(!next); // revert on failure
    } catch { setApprovalOn(!next); }
    finally { setApprovalBusy(false); }
  };

  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<PendingChange | null>(null);
  const [diffView, setDiffView] = useState<'before' | 'after'>('after');
  const review = async (id: string, decision: 'approve' | 'reject') => {
    setReviewingId(id);
    try {
      const res = await fetch('/api/collab/review', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: id, decision }),
      });
      if (res.ok) { setReviewModal(null); router.refresh(); }
    } finally { setReviewingId(null); }
  };

  // Human-readable labels for the fields shown in a pending change preview.
  const FIELD_LABELS: Record<string, { th: string; en: string }> = {
    description: { th: 'คำอธิบาย (EN)', en: 'Description (EN)' },
    description_th: { th: 'คำอธิบาย (TH)', en: 'Description (TH)' },
    services: { th: 'บริการ', en: 'Services' },
    province: { th: 'จังหวัด', en: 'Province' },
    address: { th: 'ที่อยู่', en: 'Address' },
    team_size: { th: 'ขนาดทีม', en: 'Team size' },
    founded_year: { th: 'ปีที่ก่อตั้ง', en: 'Founded year' },
    website: { th: 'เว็บไซต์', en: 'Website' },
    phone: { th: 'เบอร์โทร', en: 'Phone' },
    email: { th: 'อีเมล', en: 'Email' },
    dbd_no: { th: 'เลขทะเบียน (DBD)', en: 'DBD no.' },
    line_id: { th: 'LINE', en: 'LINE' },
    buyer_only: { th: 'โหมดผู้ซื้อ', en: 'Buyer mode' },
    logo_url: { th: 'โลโก้', en: 'Logo' },
    banner_url: { th: 'แบนเนอร์', en: 'Banner' },
  };
  const previewFields = (payload: Record<string, any> | null): string[] => {
    if (!payload) return [];
    return Object.keys(payload)
      .filter(k => !k.startsWith('banner_focus') && FIELD_LABELS[k])
      .map(k => FIELD_LABELS[k][lang === 'th' ? 'th' : 'en']);
  };

  // Normalize a value for equality (treats null/''/undefined the same).
  const norm = (v: any): string => {
    if (v === null || v === undefined || v === '') return '';
    return Array.isArray(v) ? JSON.stringify(v) : String(v);
  };
  // Human-readable rendering of a field value for the before/after view.
  const fmtVal = (k: string, v: any): string => {
    if (v === null || v === undefined || v === '') return '—';
    if (Array.isArray(v)) return v.length ? v.join(', ') : '—';
    if (typeof v === 'boolean') return v ? (lang === 'th' ? 'ใช่' : 'Yes') : (lang === 'th' ? 'ไม่ใช่' : 'No');
    if (k === 'logo_url' || k === 'banner_url' || k === 'banner_url_mobile') return lang === 'th' ? 'มีรูปภาพใหม่' : 'New image';
    if (k === 'line_id') return String(v).replace(/^(oa|id|phone):/, '');
    return String(v);
  };
  // The labelled fields present in a change payload, each flagged if it differs
  // from the live company value.
  const diffRows = (pc: PendingChange | null): { key: string; label: string; before: any; after: any; changed: boolean }[] => {
    if (!pc?.payload) return [];
    const cur = companyCurrent ?? {};
    return Object.keys(pc.payload)
      .filter(k => !k.startsWith('banner_focus') && FIELD_LABELS[k])
      .map(k => ({
        key: k,
        label: FIELD_LABELS[k][lang === 'th' ? 'th' : 'en'],
        before: (cur as any)[k],
        after: (pc.payload as any)[k],
        changed: norm((cur as any)[k]) !== norm((pc.payload as any)[k]),
      }));
  };

  const removeMember = async (id: string) => {
    setRemovingId(id); setInviteErr(''); setInviteMsg('');
    try {
      const res = await fetch('/api/team/remove', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ memberId: id }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Failed'); }
      router.refresh();
    } catch (e: any) {
      setInviteErr(e?.message || (lang === 'th' ? 'ลบไม่สำเร็จ' : 'Could not remove'));
    } finally { setRemovingId(null); }
  };

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    setDeleteError('');
    const res = await fetch('/api/delete-account', { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setDeleteError(json.error ?? (lang === 'th' ? 'เกิดข้อผิดพลาด' : 'Something went wrong'));
      setDeleteLoading(false);
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${lang}/login`);
  }

  const navItems = [
    { id: 'account', label: t.account },
    ...(isOwner ? [{ id: 'team', label: lang === 'th' ? 'ทีมงาน' : 'Team' }] : []),
    { id: 'notifications', label: t.notifications },
    { id: 'line', label: t.lineConnect },
    { id: 'danger', label: t.dangerZone },
  ];

  const sectionStyle: React.CSSProperties = {
    background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)',
    padding: '28px', marginBottom: '20px',
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    gap: '20px', padding: '14px 0', borderBottom: '1px solid #F4F5F7',
  };

  const toggleStyle = (checked: boolean): React.CSSProperties => ({
    position: 'relative', width: '44px', height: '24px', cursor: 'pointer',
    background: checked ? '#0F6F73' : '#C8CDD7', borderRadius: '999px',
    transition: 'background 150ms', flexShrink: 0, border: 'none',
  });

  const inputStyle: React.CSSProperties = {
    width: '100%', fontSize: '14px', padding: '10px 14px',
    border: '1.5px solid #E4E7ED', borderRadius: '12px',
    background: 'white', outline: 'none', color: '#171A21', fontFamily: 'inherit',
  };

  const handleAccountSave = async () => {
    setAccountSaving(true);
    setAccountError('');
    setAccountSaved(false);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ data: { full_name: displayName } });
      if (error) throw error;
      setAccountSaved(true);
      router.refresh();
      setTimeout(() => setAccountSaved(false), 3000);
    } catch (err: any) {
      setAccountError(err.message ?? 'Save failed');
    } finally {
      setAccountSaving(false);
    }
  };

  const handleLineConnect = async (uid: string) => {
    setLineLoading(true);
    setLineError('');
    try {
      const res = await fetch('/api/line/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineUserId: uid }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to connect');
      }
      setLineConnected(true);
      setManualUID('');
      router.refresh();
    } catch (err: any) {
      setLineError(err.message);
    } finally {
      setLineLoading(false);
    }
  };

  const handleLineDisconnect = async () => {
    setLineLoading(true);
    setLineError('');
    try {
      const res = await fetch('/api/line/connect', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to disconnect');
      setLineConnected(false);
      router.refresh();
    } catch (err: any) {
      setLineError(err.message);
    } finally {
      setLineLoading(false);
    }
  };

  return (
    <div>
      <style>{`
        .settings-layout {
          max-width: 860px;
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 24px;
          align-items: start;
        }
        .settings-nav {
          position: sticky;
          top: 80px;
          background: white;
          border-radius: 16px;
          border: 1px solid rgba(15,111,115,0.10);
          padding: 8px;
        }
        .settings-nav-btn {
          display: block;
          width: 100%;
          text-align: left;
          white-space: nowrap;
        }
        @media (max-width: 640px) {
          .settings-layout {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .settings-nav {
            position: static;
            display: flex;
            flex-direction: row;
            overflow-x: auto;
            padding: 4px;
            gap: 4px;
            border-radius: 12px;
            -webkit-overflow-scrolling: touch;
          }
          .settings-nav::-webkit-scrollbar { display: none; }
          .settings-nav-btn {
            display: inline-block !important;
            width: auto !important;
            flex-shrink: 0;
          }
        }
      `}</style>
    <div className="settings-layout">
      {/* Nav */}
      <div className="settings-nav">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => setActiveSection(item.id)} className="settings-nav-btn" style={{
            padding: '10px 12px',
            borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '14px', fontWeight: activeSection === item.id ? 600 : 400,
            background: activeSection === item.id ? '#F0F9F9' : 'transparent',
            color: activeSection === item.id ? '#0F6F73' : '#444B5A',
            transition: 'all 150ms',
          }}>
            {item.label}
          </button>
        ))}
      </div>

      <div>
        {/* Account */}
        {activeSection === 'account' && (
          <div style={sectionStyle}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{t.account}</h2>
            <p style={{ fontSize: '13px', color: '#9AA0AE', marginBottom: '24px' }}>{lang === 'th' ? 'จัดการข้อมูลบัญชีของคุณ' : 'Manage your account information'}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>{t.nameLabel}</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => { setDisplayName(e.target.value); setAccountSaved(false); }}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>{t.emailLabel}</label>
                <input
                  type="email"
                  value={userEmail}
                  readOnly
                  style={{ ...inputStyle, background: '#F4F5F7', color: '#9AA0AE', cursor: 'not-allowed' }}
                />
                <p style={{ fontSize: '12px', color: '#9AA0AE', marginTop: '4px' }}>
                  {lang === 'th' ? 'อีเมลไม่สามารถเปลี่ยนได้' : 'Email cannot be changed'}
                </p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>{t.langLabel}</label>
                <select
                  style={inputStyle}
                  value={lang}
                  onChange={(e) => router.push(`/${e.target.value}/settings`)}
                >
                  <option value="en">English</option>
                  <option value="th">ภาษาไทย</option>
                </select>
              </div>
              {accountError && (
                <p style={{ fontSize: '13px', color: '#E04347', background: '#FFF5F5', border: '1px solid #FFCDD2', borderRadius: '8px', padding: '10px 14px' }}>
                  {accountError}
                </p>
              )}
              <div style={{ paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={handleAccountSave}
                  disabled={accountSaving || !displayName.trim()}
                  style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', borderRadius: '12px', cursor: (accountSaving || !displayName.trim()) ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: (accountSaving || !displayName.trim()) ? 0.6 : 1 }}
                >
                  {accountSaving ? (lang === 'th' ? 'กำลังบันทึก…' : 'Saving…') : t.saveBtn}
                </button>
                {accountSaved && (
                  <span style={{ fontSize: '13px', color: '#06C755', fontWeight: 600 }}>
                    {lang === 'th' ? '✓ บันทึกแล้ว' : '✓ Saved'}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Team / collaborators */}
        {activeSection === 'team' && isOwner && (
          <div style={sectionStyle}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{lang === 'th' ? 'ทีมงาน / ผู้ร่วมจัดการ' : 'Team / Collaborators'}</h2>
            <p style={{ fontSize: '13px', color: '#9AA0AE', marginBottom: '20px' }}>{lang === 'th' ? 'เชิญผู้อื่นมาช่วยจัดการข้อมูลบริษัทและผลงาน' : 'Invite others to help manage your company info and portfolio.'}</p>

            {/* Approval gate toggle */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', background: '#F7F8FA', border: '1px solid #E4E7ED', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#171A21', marginBottom: '3px' }}>{lang === 'th' ? 'ต้องอนุมัติก่อนเผยแพร่' : 'Require my approval'}</div>
                <div style={{ fontSize: '12.5px', color: '#6B7385', lineHeight: 1.5 }}>
                  {lang === 'th'
                    ? 'เมื่อเปิด: การเปลี่ยนแปลงของผู้ร่วมจัดการจะถูกส่งมาให้คุณอนุมัติก่อน เมื่ออนุมัติแล้วข้อมูลจึงจะถูกอัปเดต หากปิด: การเปลี่ยนแปลงจะมีผลทันที'
                    : 'When on, a collaborator’s changes are sent to you for approval before they’re applied. When off, their changes take effect immediately.'}
                </div>
              </div>
              <button type="button" onClick={toggleApproval} disabled={approvalBusy} aria-pressed={approvalOn}
                style={{ position: 'relative', width: '46px', height: '28px', flexShrink: 0, borderRadius: '999px', border: 'none', cursor: approvalBusy ? 'not-allowed' : 'pointer', background: approvalOn ? '#0F6F73' : '#CBD2DC', transition: 'background 0.15s', opacity: approvalBusy ? 0.6 : 1 }}>
                <span style={{ position: 'absolute', top: '3px', left: approvalOn ? '21px' : '3px', width: '22px', height: '22px', borderRadius: '999px', background: 'white', transition: 'left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </button>
            </div>

            {/* Pending changes awaiting approval */}
            {pendingChanges.length > 0 && (
              <div style={{ border: '1.5px solid #F3D9A4', background: '#FFFBF3', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#8A5A12', marginBottom: '12px' }}>
                  {lang === 'th' ? `การเปลี่ยนแปลงรออนุมัติ (${pendingChanges.length})` : `Changes awaiting approval (${pendingChanges.length})`}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pendingChanges.map(pc => {
                    const fields = previewFields(pc.payload);
                    const kind = pc.entity === 'company'
                      ? (lang === 'th' ? 'ข้อมูลบริษัท' : 'Company info')
                      : (lang === 'th' ? 'ผลงาน' : 'Portfolio');
                    return (
                      <div key={pc.id} style={{ background: 'white', border: '1px solid #EEE2C6', borderRadius: '10px', padding: '12px 14px' }}>
                        <div style={{ fontSize: '13px', color: '#171A21', fontWeight: 600, marginBottom: '2px' }}>{kind}</div>
                        <div style={{ fontSize: '12px', color: '#6B7385', marginBottom: fields.length ? '8px' : '10px' }}>
                          {pc.author_email || (lang === 'th' ? 'ผู้ร่วมจัดการ' : 'A collaborator')}
                        </div>
                        {(() => { const ch = diffRows(pc).filter(r => r.changed).length; return ch > 0 ? (
                          <div style={{ fontSize: '12px', color: '#8A5A12', fontWeight: 600, marginBottom: '10px' }}>
                            {lang === 'th' ? `${ch} หัวข้อที่เปลี่ยนแปลง` : `${ch} field${ch > 1 ? 's' : ''} changed`}
                          </div>
                        ) : null; })()}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button type="button" onClick={() => { setDiffView('after'); setReviewModal(pc); }} style={{ padding: '7px 16px', background: 'white', color: '#0F6F73', fontWeight: 600, fontSize: '12.5px', border: '1.5px solid rgba(15,111,115,0.3)', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>
                            {lang === 'th' ? 'ดูก่อน–หลัง' : 'View before/after'}
                          </button>
                          <button type="button" onClick={() => review(pc.id, 'approve')} disabled={reviewingId === pc.id} style={{ padding: '7px 16px', background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)', color: 'white', fontWeight: 600, fontSize: '12.5px', border: 'none', borderRadius: '8px', cursor: reviewingId === pc.id ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: reviewingId === pc.id ? 0.6 : 1 }}>
                            {lang === 'th' ? 'อนุมัติ' : 'Approve'}
                          </button>
                          <button type="button" onClick={() => review(pc.id, 'reject')} disabled={reviewingId === pc.id} style={{ padding: '7px 16px', background: 'white', color: '#D32F2F', fontWeight: 600, fontSize: '12.5px', border: '1.5px solid #F2C2C2', borderRadius: '8px', cursor: reviewingId === pc.id ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                            {lang === 'th' ? 'ปฏิเสธ' : 'Reject'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Before / after review modal */}
            {reviewModal && (
              <div onClick={() => setReviewModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(23,26,33,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1100, fontFamily: "'Inter','Noto Sans Thai',sans-serif" }}>
                <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '18px', width: '100%', maxWidth: '560px', maxHeight: '86vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                  {/* Header */}
                  <div style={{ padding: '22px 24px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#171A21', margin: 0 }}>{lang === 'th' ? 'ตรวจสอบการเปลี่ยนแปลง' : 'Review changes'}</h3>
                        <p style={{ fontSize: '12.5px', color: '#6B7385', margin: '3px 0 0' }}>{reviewModal.author_email || (lang === 'th' ? 'ผู้ร่วมจัดการ' : 'A collaborator')}</p>
                      </div>
                      <button type="button" onClick={() => setReviewModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9AA0AE', fontSize: '22px', lineHeight: 1, padding: '2px 6px' }}>×</button>
                    </div>
                    {/* Before / after toggle */}
                    <div style={{ display: 'inline-flex', background: '#F0F2F5', borderRadius: '10px', padding: '3px', marginTop: '16px' }}>
                      {(['before', 'after'] as const).map(v => (
                        <button key={v} type="button" onClick={() => setDiffView(v)} style={{ padding: '6px 16px', fontSize: '12.5px', fontWeight: 700, border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', background: diffView === v ? 'white' : 'transparent', color: diffView === v ? '#0F6F73' : '#6B7385', boxShadow: diffView === v ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                          {v === 'before' ? (lang === 'th' ? 'ปัจจุบัน (ก่อน)' : 'Current (before)') : (lang === 'th' ? 'ฉบับแก้ไข (หลัง)' : 'Modified (after)')}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Field list */}
                  <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
                    {diffRows(reviewModal).length === 0 ? (
                      <p style={{ fontSize: '13px', color: '#9AA0AE' }}>{lang === 'th' ? 'ไม่มีรายละเอียด' : 'No details'}</p>
                    ) : diffRows(reviewModal).map(r => (
                      <div key={r.key} style={{ display: 'flex', gap: '12px', padding: '10px 12px', borderRadius: '10px', marginBottom: '6px', background: r.changed ? '#FFFBF3' : 'transparent', border: r.changed ? '1px solid #F3D9A4' : '1px solid transparent', borderLeft: r.changed ? '3px solid #E8A33D' : '3px solid transparent' }}>
                        <div style={{ width: '120px', flexShrink: 0, fontSize: '12.5px', fontWeight: 600, color: r.changed ? '#8A5A12' : '#6B7385' }}>
                          {r.label}{r.changed && <span style={{ marginLeft: '6px', fontSize: '10px', fontWeight: 800, color: '#B4791E' }}>●</span>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0, fontSize: '13px', color: '#171A21', lineHeight: 1.5, wordBreak: 'break-word' }}>
                          <span style={{ color: (diffView === 'before' ? fmtVal(r.key, r.before) : fmtVal(r.key, r.after)) === '—' ? '#B7BDC8' : '#171A21' }}>
                            {diffView === 'before' ? fmtVal(r.key, r.before) : fmtVal(r.key, r.after)}
                          </span>
                          {r.changed && diffView === 'after' && fmtVal(r.key, r.before) !== '—' && (
                            <div style={{ fontSize: '11.5px', color: '#B7BDC8', textDecoration: 'line-through', marginTop: '2px' }}>{fmtVal(r.key, r.before)}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Actions */}
                  <div style={{ padding: '14px 24px', borderTop: '1px solid #EEF1F2', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => review(reviewModal.id, 'reject')} disabled={reviewingId === reviewModal.id} style={{ padding: '10px 20px', background: 'white', color: '#D32F2F', fontWeight: 600, fontSize: '13.5px', border: '1.5px solid #F2C2C2', borderRadius: '10px', cursor: reviewingId === reviewModal.id ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                      {lang === 'th' ? 'ปฏิเสธ' : 'Reject'}
                    </button>
                    <button type="button" onClick={() => review(reviewModal.id, 'approve')} disabled={reviewingId === reviewModal.id} style={{ padding: '10px 22px', background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)', color: 'white', fontWeight: 600, fontSize: '13.5px', border: 'none', borderRadius: '10px', cursor: reviewingId === reviewModal.id ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: reviewingId === reviewModal.id ? 0.6 : 1 }}>
                      {reviewingId === reviewModal.id ? '…' : (lang === 'th' ? 'อนุมัติการเปลี่ยนแปลง' : 'Approve changes')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Invite form */}
            <div style={{ background: '#F7F8FA', border: '1px solid #E4E7ED', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>{lang === 'th' ? 'เชิญด้วยอีเมล' : 'Invite by email'}</label>
              <input
                type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="name@company.com"
                style={{ width: '100%', fontSize: '14px', padding: '10px 12px', border: '1.5px solid #E4E7ED', borderRadius: '10px', outline: 'none', fontFamily: 'inherit', marginBottom: '10px' }}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '12px' }}>
                {([['company', lang === 'th' ? 'จัดการข้อมูลบริษัท' : 'Manage company info'], ['portfolio', lang === 'th' ? 'จัดการผลงาน' : 'Manage portfolio']] as const).map(([key, label]) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: '#444B5A', cursor: 'pointer' }}>
                    <input type="checkbox" checked={invitePerms[key]} onChange={(e) => setInvitePerms(p => ({ ...p, [key]: e.target.checked }))} />
                    {label}
                  </label>
                ))}
              </div>
              <button onClick={sendInvite} disabled={inviteBusy} style={{ padding: '9px 18px', background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)', color: 'white', fontWeight: 600, fontSize: '13px', border: 'none', borderRadius: '10px', cursor: inviteBusy ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: inviteBusy ? 0.6 : 1 }}>
                {inviteBusy ? (lang === 'th' ? 'กำลังส่ง…' : 'Sending…') : (lang === 'th' ? 'ส่งคำเชิญ' : 'Send invite')}
              </button>
              {inviteMsg && <p style={{ fontSize: '12.5px', color: '#0F6F73', marginTop: '10px' }}>✓ {inviteMsg}</p>}
              {inviteErr && <p style={{ fontSize: '12.5px', color: '#D32F2F', marginTop: '10px' }}>⚠ {inviteErr}</p>}
            </div>

            {/* Member list */}
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#171A21', marginBottom: '10px' }}>{lang === 'th' ? 'สมาชิก' : 'Members'} ({members.length})</div>
            {members.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#9AA0AE' }}>{lang === 'th' ? 'ยังไม่มีผู้ร่วมจัดการ' : 'No collaborators yet.'}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {members.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #E4E7ED', borderRadius: '12px', padding: '12px 14px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#171A21', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.invited_email}</div>
                      <div style={{ fontSize: '11.5px', color: '#9AA0AE', marginTop: '2px' }}>
                        {m.status === 'pending' ? (lang === 'th' ? '⏳ รอตอบรับ' : '⏳ Pending') : (lang === 'th' ? '✓ ใช้งานอยู่' : '✓ Active')}
                        {' · '}
                        {[m.can_edit_company && (lang === 'th' ? 'บริษัท' : 'Company'), m.can_edit_portfolio && (lang === 'th' ? 'ผลงาน' : 'Portfolio')].filter(Boolean).join(' + ')}
                      </div>
                    </div>
                    <button onClick={() => removeMember(m.id)} disabled={removingId === m.id} style={{ padding: '6px 12px', background: 'transparent', border: '1.5px solid #F1C7C7', color: '#D32F2F', fontWeight: 600, fontSize: '12px', borderRadius: '9px', cursor: removingId === m.id ? 'not-allowed' : 'pointer', fontFamily: 'inherit', flexShrink: 0, opacity: removingId === m.id ? 0.6 : 1 }}>
                      {removingId === m.id ? '…' : (lang === 'th' ? 'ลบ' : 'Remove')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications */}
        {activeSection === 'notifications' && (
          <div style={sectionStyle}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{t.notifications}</h2>
            <p style={{ fontSize: '13px', color: '#9AA0AE', marginBottom: '24px' }}>{lang === 'th' ? 'เลือกการแจ้งเตือนที่คุณต้องการรับ' : 'Choose which notifications you receive'}</p>
            {[
              { key: 'broadcast' as const, title: t.notifBroadcast, sub: t.notifBroadcastSub },
              { key: 'views' as const, title: t.notifViews, sub: t.notifViewsSub },
              { key: 'system' as const, title: t.notifSystem, sub: t.notifSystemSub },
            ].map((item, i) => (
              <div key={item.key} style={{ ...rowStyle, borderBottom: i < 2 ? '1px solid #F4F5F7' : 'none' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#171A21' }}>{item.title}</div>
                  <div style={{ fontSize: '13px', color: '#9AA0AE', marginTop: '2px' }}>{item.sub}</div>
                </div>
                <button
                  role="switch"
                  aria-checked={notifs[item.key]}
                  onClick={() => setNotifs((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                  style={toggleStyle(notifs[item.key])}
                >
                  <span style={{
                    position: 'absolute', top: '3px', left: notifs[item.key] ? '23px' : '3px',
                    width: '18px', height: '18px', borderRadius: '999px', background: 'white',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 150ms',
                  }} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* LINE Connect */}
        {activeSection === 'line' && (
          <div>
            {/* Premium gate */}
            {!isPremium && (
              <div style={{ background: 'linear-gradient(135deg, #FFF8EE, #FFFBF5)', border: '1.5px solid rgba(247,127,0,0.35)', borderRadius: '14px', padding: '24px', marginBottom: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>⭐</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#171A21', marginBottom: '8px' }}>
                  {lang === 'th' ? 'ฟีเจอร์สำหรับสมาชิก Premium เท่านั้น' : 'Premium Members Only'}
                </div>
                <p style={{ fontSize: '13px', color: '#6B7385', marginBottom: '20px', lineHeight: 1.6 }}>
                  {lang === 'th'
                    ? 'การเชื่อมต่อ LINE เพื่อรับการแจ้งเตือน Broadcast เป็นฟีเจอร์เฉพาะสมาชิก Premium อัปเกรดเพื่อรับโอกาสทางธุรกิจได้ทันที'
                    : 'LINE notifications for broadcast requests are a Premium feature. Upgrade to receive instant business opportunities.'}
                </p>
                <a href={`/${lang}/package`} style={{ display: 'inline-block', padding: '10px 28px', background: 'linear-gradient(135deg, #F77F00, #FFB347)', color: 'white', fontWeight: 700, fontSize: '14px', borderRadius: '10px', textDecoration: 'none' }}>
                  {lang === 'th' ? 'อัปเกรดเป็น Premium →' : 'Upgrade to Premium →'}
                </a>
              </div>
            )}

            {/* LINE card */}
            <div style={{ background: 'linear-gradient(135deg, #06C755, #04a544)', borderRadius: '14px', padding: '20px', display: 'flex', gap: '16px', marginBottom: '20px', opacity: isPremium ? 1 : 0.4, pointerEvents: isPremium ? 'auto' : 'none' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="28" height="28" viewBox="0 0 50 50" fill="#06C755">
                  <path d="M25 2C12.3 2 2 10.8 2 21.7c0 9.5 8.4 17.5 19.8 19.4.8.2 1.8.5 2.1 1.2.2.6.1 1.5 0 2.1l-.3 1.9c-.1.6-.5 2.4 2.1 1.3 2.6-1.1 14-8.2 19.1-14.1C48 30.1 48 26 48 21.7 48 10.8 37.7 2 25 2z" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>{t.lineTitle}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginTop: '2px', lineHeight: 1.5 }}>{t.lineSub}</div>
              </div>
            </div>

            <div style={{ ...sectionStyle, opacity: isPremium ? 1 : 0.4, pointerEvents: isPremium ? 'auto' : 'none' }}>
              {!lineConnected ? (
                <>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#171A21', marginBottom: '6px' }}>
                    {lang === 'th' ? 'เชื่อมต่อบัญชี LINE' : 'Connect your LINE account'}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#9AA0AE', marginBottom: '4px' }}>
                    {lang === 'th' ? 'รับการแจ้งเตือน Broadcast ทันทีผ่าน LINE' : 'Get instant broadcast notifications on LINE'}
                  </p>
                  <p style={{ fontSize: '12.5px', color: '#E06B00', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E06B00" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>
                    {lang === 'th' ? 'หากเชื่อมต่อบนคอมพิวเตอร์ กรุณาล็อกอิน LINE บนเบราว์เซอร์ก่อน' : 'If connecting on Desktop, log in to LINE in your browser first'}
                  </p>

                  {/* Primary: LINE OAuth button */}
                  <a
                    href="/api/line/auth"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '14px 24px', background: '#06C755', color: 'white', borderRadius: '14px', fontSize: '15px', fontWeight: 700, textDecoration: 'none', marginBottom: '16px' }}
                  >
                    <svg width="22" height="22" viewBox="0 0 50 50" fill="white">
                      <path d="M25 2C12.3 2 2 10.8 2 21.7c0 9.5 8.4 17.5 19.8 19.4.8.2 1.8.5 2.1 1.2.2.6.1 1.5 0 2.1l-.3 1.9c-.1.6-.5 2.4 2.1 1.3 2.6-1.1 14-8.2 19.1-14.1C48 30.1 48 26 48 21.7 48 10.8 37.7 2 25 2z" />
                    </svg>
                    {lang === 'th' ? 'เชื่อมต่อด้วย LINE' : 'Connect with LINE'}
                  </a>

                  {lineError && (
                    <p style={{ fontSize: '13px', color: '#E04347', background: '#FFF5F5', border: '1px solid #FFCDD2', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
                      {lineError}
                    </p>
                  )}

                  {/* Divider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ flex: 1, height: '1px', background: '#E4E7ED' }} />
                    <span style={{ fontSize: '12px', color: '#C8CDD7', fontWeight: 600 }}>
                      {lang === 'th' ? 'หรือ' : 'OR'}
                    </span>
                    <div style={{ flex: 1, height: '1px', background: '#E4E7ED' }} />
                  </div>

                  {/* Fallback: manual UID */}
                  <button
                    onClick={() => setShowManual(!showManual)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, color: '#6B7385', marginBottom: showManual ? '16px' : '0' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showManual ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                    {lang === 'th' ? 'ยังไม่ได้ล็อกอิน LINE? นี่คืออีกวิธีที่ทำได้' : "Not logged in to LINE? Here's another way you can do it"}
                  </button>

                  {showManual && (
                    <div style={{ background: '#FAFCFC', border: '1px solid #E4E7ED', borderRadius: '14px', padding: '18px 20px' }}>
                      <div style={{ fontSize: '13px', color: '#6B7385', marginBottom: '14px', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {(lang === 'th' ? [
                          '1. เพิ่ม @profindle เป็นเพื่อนใน LINE',
                          '2. ส่งข้อความ "status" — บอทจะตอบด้วย User ID ของคุณ',
                          '3. คัดลอก ID แล้ววางด้านล่าง',
                        ] : [
                          '1. Add @profindle as a friend on LINE',
                          '2. Send the message "status" — the bot replies with your User ID',
                          '3. Copy the ID and paste it below',
                        ]).map((line, i) => <span key={i}>{line}</span>)}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={manualUID}
                          onChange={(e) => { setManualUID(e.target.value); setLineError(''); }}
                          placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          style={{ ...inputStyle, flex: 1, borderColor: manualUID && !/^U[a-f0-9]{32}$/.test(manualUID) ? '#E04347' : '#E4E7ED' }}
                        />
                        <button
                          disabled={!/^U[a-f0-9]{32}$/.test(manualUID) || lineLoading}
                          onClick={() => handleLineConnect(manualUID)}
                          style={{ padding: '10px 20px', background: '#06C755', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: (/^U[a-f0-9]{32}$/.test(manualUID) && !lineLoading) ? 'pointer' : 'not-allowed', fontFamily: 'inherit', opacity: (/^U[a-f0-9]{32}$/.test(manualUID) && !lineLoading) ? 1 : 0.4, whiteSpace: 'nowrap' }}
                        >
                          {lineLoading ? '…' : (lang === 'th' ? 'เชื่อมต่อ' : 'Link')}
                        </button>
                      </div>
                      {manualUID && !/^U[a-f0-9]{32}$/.test(manualUID) && (
                        <p style={{ fontSize: '12px', color: '#E04347', marginTop: '6px' }}>
                          {lang === 'th' ? 'รูปแบบไม่ถูกต้อง — ต้องขึ้นต้นด้วย U ตามด้วย 32 ตัวอักษร' : 'Invalid format — must start with U followed by 32 characters'}
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '16px 18px', border: '1.5px solid rgba(6,199,85,0.35)', borderRadius: '14px', background: 'rgba(6,199,85,0.06)', marginBottom: '16px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '999px', background: '#06C755', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#171A21' }}>
                        {lang === 'th' ? 'เชื่อมต่อ LINE แล้ว' : 'LINE connected'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#06C755', marginTop: '2px', fontWeight: 600 }}>
                        {initialLineDisplayName || (initialLineUserId ? `UID: ${initialLineUserId.slice(0, 16)}…` : '')}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9AA0AE', marginTop: '2px' }}>
                        {lang === 'th' ? 'คุณจะได้รับการแจ้งเตือน Broadcast ผ่าน LINE' : 'You\'ll receive broadcast notifications on LINE'}
                      </div>
                    </div>
                    <button onClick={handleLineDisconnect} disabled={lineLoading} style={{ padding: '8px 16px', background: 'transparent', border: '1.5px solid #FFD6D7', color: '#E04347', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: lineLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: lineLoading ? 0.5 : 1, whiteSpace: 'nowrap' }}>
                      {lineLoading ? '…' : (lang === 'th' ? 'ยกเลิกการเชื่อม' : 'Disconnect')}
                    </button>
                  </div>
                  <p style={{ fontSize: '13px', color: '#9AA0AE' }}>
                    {lang === 'th' ? 'หากต้องการเปลี่ยน LINE ให้ยกเลิกการเชื่อมก่อน แล้วเชื่อมใหม่' : 'To switch LINE accounts, disconnect first then reconnect with the new account.'}
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Danger Zone */}
        {activeSection === 'danger' && (
          <div style={{ ...sectionStyle, border: '1.5px solid rgba(255,90,95,0.25)', background: '#FFF8F8' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#E04347', marginBottom: '4px' }}>{t.dangerZone}</h2>
            <p style={{ fontSize: '13px', color: '#9AA0AE', marginBottom: '24px' }}>{t.deleteSub}</p>

            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)} style={{ padding: '10px 20px', background: 'transparent', border: '1.5px solid #FFD6D7', color: '#E04347', borderRadius: '12px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
                {t.deleteBtn}
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#171A21' }}>{t.confirmDelete}</label>
                <input type="email" value={deleteEmail} onChange={(e) => setDeleteEmail(e.target.value)} placeholder={userEmail} style={{ ...inputStyle, borderColor: '#FFD6D7' }} />
                {deleteError && <p style={{ fontSize: '12px', color: '#E04347', margin: 0 }}>{deleteError}</p>}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setShowDeleteConfirm(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1.5px solid #E4E7ED', color: '#444B5A', borderRadius: '12px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {dict.common.cancel}
                  </button>
                  <button onClick={handleDeleteAccount} disabled={deleteEmail !== userEmail || deleteLoading} style={{ padding: '10px 20px', background: '#E04347', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '13px', cursor: deleteEmail === userEmail && !deleteLoading ? 'pointer' : 'not-allowed', fontFamily: 'inherit', opacity: deleteEmail === userEmail && !deleteLoading ? 1 : 0.5 }}>
                    {deleteLoading ? (lang === 'th' ? 'กำลังลบ...' : 'Deleting...') : (lang === 'th' ? 'ยืนยันการลบ' : 'Confirm Delete')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
