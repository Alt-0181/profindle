'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Dictionary } from '@/dictionaries';
import { createClient } from '@/lib/supabase/client';

interface SettingsClientProps {
  lang: string;
  dict: Dictionary;
  initialLineUserId: string | null;
  userEmail: string;
  userName: string;
}

export function SettingsClient({ lang, dict, initialLineUserId, userEmail, userName }: SettingsClientProps) {
  const t = dict.settings;
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('account');

  // Account
  const [displayName, setDisplayName] = useState(userName);
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountSaved, setAccountSaved] = useState(false);
  const [accountError, setAccountError] = useState('');

  // LINE
  const [lineConnected, setLineConnected] = useState(!!initialLineUserId);
  const [lineStep, setLineStep] = useState(1);
  const [manualUID, setManualUID] = useState('');
  const [lineLoading, setLineLoading] = useState(false);
  const [lineError, setLineError] = useState('');

  const [notifs, setNotifs] = useState({ broadcast: true, views: true, system: true });
  const [deleteEmail, setDeleteEmail] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    <div style={{ maxWidth: '860px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px', alignItems: 'start' }}>
      {/* Nav */}
      <div style={{ position: 'sticky', top: '80px', background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '8px' }}>
        {navItems.map((item) => (
          <button key={item.id} onClick={() => setActiveSection(item.id)} style={{
            display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px',
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
            {/* LINE card */}
            <div style={{ background: 'linear-gradient(135deg, #06C755, #04a544)', borderRadius: '14px', padding: '20px', display: 'flex', gap: '16px', marginBottom: '20px' }}>
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

            <div style={sectionStyle}>
              {!lineConnected ? (
                <>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#171A21', marginBottom: '6px' }}>
                    {lang === 'th' ? 'เชื่อมต่อ LINE ใน 3 ขั้นตอน' : 'Connect LINE in 3 steps'}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#9AA0AE', marginBottom: '24px' }}>
                    {lang === 'th' ? 'ทำตามขั้นตอนด้านล่างเพื่อรับการแจ้งเตือนผ่าน LINE' : 'Follow the steps below to receive broadcast notifications on LINE'}
                  </p>

                  {/* Step 1 — Add OA as friend */}
                  <div style={{ border: `1.5px solid ${lineStep > 1 ? '#06C755' : '#E4E7ED'}`, borderRadius: '14px', padding: '18px 20px', marginBottom: '12px', background: lineStep > 1 ? 'rgba(6,199,85,0.04)' : 'white' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '999px', background: lineStep > 1 ? '#06C755' : 'linear-gradient(135deg,#06C755,#04a544)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                        {lineStep > 1 ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        ) : '1'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: lineStep > 1 ? '#06C755' : '#171A21', marginBottom: '4px' }}>
                          {lang === 'th' ? 'เพิ่ม @profindle เป็นเพื่อน' : 'Add @profindle as a LINE friend'}
                        </div>
                        <div style={{ fontSize: '13px', color: '#9AA0AE', marginBottom: lineStep === 1 ? '14px' : '0' }}>
                          {lang === 'th' ? 'เปิด LINE และค้นหา @profindle แล้วกดเพิ่มเพื่อน' : 'Open LINE, search @profindle and tap Add Friend'}
                        </div>
                        {lineStep === 1 && (
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <a href="https://line.me/R/ti/p/@profindle" target="_blank" rel="noopener" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#06C755', color: 'white', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                              <svg width="14" height="14" viewBox="0 0 50 50" fill="white"><path d="M25 2C12.3 2 2 10.8 2 21.7c0 9.5 8.4 17.5 19.8 19.4.8.2 1.8.5 2.1 1.2.2.6.1 1.5 0 2.1l-.3 1.9c-.1.6-.5 2.4 2.1 1.3 2.6-1.1 14-8.2 19.1-14.1C48 30.1 48 26 48 21.7 48 10.8 37.7 2 25 2z" /></svg>
                              {lang === 'th' ? 'เปิด LINE' : 'Open LINE'}
                            </a>
                            <button onClick={() => setLineStep(2)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'white', border: '1.5px solid #06C755', color: '#06C755', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                              {lang === 'th' ? 'เพิ่มแล้ว ✓' : 'Done, I\'ve added ✓'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 2 — Send status */}
                  <div style={{ border: `1.5px solid ${lineStep > 2 ? '#06C755' : lineStep === 2 ? '#0F6F73' : '#E4E7ED'}`, borderRadius: '14px', padding: '18px 20px', marginBottom: '12px', background: lineStep > 2 ? 'rgba(6,199,85,0.04)' : lineStep === 2 ? '#FAFCFC' : 'white', opacity: lineStep < 2 ? 0.45 : 1 }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '999px', background: lineStep > 2 ? '#06C755' : lineStep === 2 ? 'linear-gradient(135deg,#0F6F73,#1A9DA3)' : '#F4F5F7', color: lineStep >= 2 ? 'white' : '#9AA0AE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                        {lineStep > 2 ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        ) : '2'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: lineStep > 2 ? '#06C755' : '#171A21', marginBottom: '4px' }}>
                          {lang === 'th' ? 'ส่งข้อความ "status" ให้ @profindle' : 'Send "status" to @profindle'}
                        </div>
                        <div style={{ fontSize: '13px', color: '#9AA0AE', marginBottom: lineStep === 2 ? '14px' : '0' }}>
                          {lang === 'th' ? 'บอทจะตอบกลับด้วย LINE User ID ของคุณ — คัดลอกไว้' : 'The bot will reply with your LINE User ID — copy it'}
                        </div>
                        {lineStep === 2 && (
                          <>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: '#F0F9F9', border: '1px solid rgba(15,111,115,0.2)', borderRadius: '10px', marginBottom: '14px' }}>
                              <span style={{ fontSize: '13px', color: '#444B5A' }}>{lang === 'th' ? 'พิมพ์ใน LINE:' : 'Type in LINE:'}</span>
                              <code style={{ fontSize: '14px', fontWeight: 700, color: '#0F6F73', background: 'white', border: '1px solid #D4EEEF', borderRadius: '6px', padding: '3px 10px', letterSpacing: '0.02em' }}>status</code>
                            </div>
                            <br />
                            <button onClick={() => setLineStep(3)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'white', border: '1.5px solid #0F6F73', color: '#0F6F73', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                              {lang === 'th' ? 'ได้รับ ID แล้ว ✓' : 'Got my ID ✓'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 3 — Paste UID */}
                  <div style={{ border: `1.5px solid ${lineStep === 3 ? '#0F6F73' : '#E4E7ED'}`, borderRadius: '14px', padding: '18px 20px', background: lineStep === 3 ? '#FAFCFC' : 'white', opacity: lineStep < 3 ? 0.45 : 1 }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '999px', background: lineStep === 3 ? 'linear-gradient(135deg,#0F6F73,#1A9DA3)' : '#F4F5F7', color: lineStep === 3 ? 'white' : '#9AA0AE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                        3
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>
                          {lang === 'th' ? 'วาง LINE User ID ของคุณ' : 'Paste your LINE User ID'}
                        </div>
                        <div style={{ fontSize: '13px', color: '#9AA0AE', marginBottom: lineStep === 3 ? '14px' : '0' }}>
                          {lang === 'th' ? 'รหัสที่บอทส่งให้ (ขึ้นต้นด้วย U ตามด้วยตัวอักษร 32 ตัว)' : 'The code the bot sent you — starts with U followed by 32 characters'}
                        </div>
                        {lineStep === 3 && (
                          <>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                              <input
                                type="text"
                                value={manualUID}
                                onChange={(e) => { setManualUID(e.target.value); setLineError(''); }}
                                placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                style={{ ...inputStyle, flex: 1, borderColor: manualUID && !/^U[a-f0-9]{32}$/.test(manualUID) ? '#E04347' : '#E4E7ED' }}
                                autoFocus
                              />
                              <button
                                disabled={!/^U[a-f0-9]{32}$/.test(manualUID) || lineLoading}
                                onClick={() => handleLineConnect(manualUID)}
                                style={{ padding: '10px 20px', background: '#06C755', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: (/^U[a-f0-9]{32}$/.test(manualUID) && !lineLoading) ? 'pointer' : 'not-allowed', fontFamily: 'inherit', opacity: (/^U[a-f0-9]{32}$/.test(manualUID) && !lineLoading) ? 1 : 0.4, whiteSpace: 'nowrap' }}
                              >
                                {lineLoading ? (lang === 'th' ? 'กำลังเชื่อม…' : 'Linking…') : (lang === 'th' ? 'เชื่อมต่อ LINE' : 'Link LINE')}
                              </button>
                            </div>
                            {manualUID && !/^U[a-f0-9]{32}$/.test(manualUID) && (
                              <p style={{ fontSize: '12px', color: '#E04347' }}>
                                {lang === 'th' ? 'รูปแบบไม่ถูกต้อง — ต้องขึ้นต้นด้วย U ตามด้วย 32 ตัวอักษร' : 'Invalid format — must start with U followed by 32 characters'}
                              </p>
                            )}
                            {lineError && <p style={{ fontSize: '12px', color: '#E04347', marginTop: '4px' }}>{lineError}</p>}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
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
                      <div style={{ fontSize: '13px', color: '#06C755', marginTop: '2px', fontWeight: 600 }}>@profindle</div>
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
                <input type="email" value={deleteEmail} onChange={(e) => setDeleteEmail(e.target.value)} placeholder="somchai@jaidee.co.th" style={{ ...inputStyle, borderColor: '#FFD6D7' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setShowDeleteConfirm(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1.5px solid #E4E7ED', color: '#444B5A', borderRadius: '12px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {dict.common.cancel}
                  </button>
                  <button disabled={deleteEmail !== 'somchai@jaidee.co.th'} style={{ padding: '10px 20px', background: '#E04347', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', opacity: deleteEmail === 'somchai@jaidee.co.th' ? 1 : 0.5 }}>
                    {lang === 'th' ? 'ยืนยันการลบ' : 'Confirm Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
