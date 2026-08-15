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
  isPremium: boolean;
}

export function SettingsClient({ lang, dict, initialLineUserId, initialLineDisplayName, userEmail, userName, lineOAuthResult, initialSection, isPremium }: SettingsClientProps) {
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
