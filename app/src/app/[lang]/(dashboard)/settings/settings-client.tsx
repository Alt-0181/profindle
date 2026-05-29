'use client';

import { useState } from 'react';
import type { Dictionary } from '@/dictionaries';

interface SettingsClientProps {
  lang: string;
  dict: Dictionary;
}

export function SettingsClient({ lang, dict }: SettingsClientProps) {
  const t = dict.settings;
  const [activeSection, setActiveSection] = useState('account');
  const [lineConnected, setLineConnected] = useState(false);
  const [lineStep, setLineStep] = useState(1);
  const [manualUID, setManualUID] = useState('');
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
                <input type="text" defaultValue="Somchai J." style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>{t.emailLabel}</label>
                <input type="email" defaultValue="somchai@jaidee.co.th" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>{t.langLabel}</label>
                <select style={inputStyle} defaultValue={lang}>
                  <option value="en">English</option>
                  <option value="th">ภาษาไทย</option>
                </select>
              </div>
              <div style={{ paddingTop: '8px' }}>
                <button style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {t.saveBtn}
                </button>
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
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#171A21', marginBottom: '20px' }}>
                {lineConnected ? t.lineConnected : t.lineNotConnected}
              </h3>

              {!lineConnected ? (
                <>
                  {/* Step 1 */}
                  <div style={{ border: '1px solid #E4E7ED', borderRadius: '14px', padding: '18px 20px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '999px', background: lineStep >= 1 ? 'linear-gradient(135deg, #06C755, #04a544)' : '#F4F5F7', color: lineStep >= 1 ? 'white' : '#9AA0AE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                        1
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{t.step1Title}</div>
                        <div style={{ fontSize: '13px', color: '#9AA0AE' }}>{t.step1Sub}</div>
                        <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', padding: '9px 16px', background: '#06C755', color: 'white', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                          {lang === 'th' ? 'เพิ่ม @profindle' : 'Add @profindle on LINE'}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div style={{ border: `1px solid ${lineStep >= 2 ? '#06C755' : '#E4E7ED'}`, borderRadius: '14px', padding: '18px 20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '999px', background: lineStep >= 2 ? 'linear-gradient(135deg, #06C755, #04a544)' : '#F4F5F7', color: lineStep >= 2 ? 'white' : '#9AA0AE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                        2
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{t.step2Title}</div>
                        <div style={{ fontSize: '13px', color: '#9AA0AE' }}>{t.step2Sub}</div>
                        <button onClick={() => { setLineConnected(true); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', padding: '9px 16px', background: '#06C755', color: 'white', borderRadius: '10px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                          {t.connectBtn}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Manual UID */}
                  <details>
                    <summary style={{ fontSize: '13px', fontWeight: 600, color: '#0F6F73', cursor: 'pointer', listStyle: 'none', marginBottom: '12px' }}>
                      {t.manualUID}
                    </summary>
                    <p style={{ fontSize: '12px', color: '#9AA0AE', marginBottom: '8px' }}>{t.manualUIDSub}</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" value={manualUID} onChange={(e) => setManualUID(e.target.value)} placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" style={{ ...inputStyle, flex: 1 }} />
                      <button disabled={!/^U[a-f0-9]{32}$/.test(manualUID)} onClick={() => setLineConnected(true)} style={{ padding: '10px 16px', background: '#06C755', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', opacity: /^U[a-f0-9]{32}$/.test(manualUID) ? 1 : 0.5 }}>
                        {lang === 'th' ? 'ยืนยัน' : 'Link'}
                      </button>
                    </div>
                  </details>
                </>
              ) : (
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '14px 16px', border: '1px solid rgba(6,199,85,0.3)', borderRadius: '12px', background: 'rgba(6,199,85,0.08)' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '999px', background: '#06C755', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#171A21' }}>{t.lineConnected}</div>
                    <div style={{ fontSize: '12px', color: '#9AA0AE', marginTop: '2px' }}>@profindle</div>
                  </div>
                  <button onClick={() => setLineConnected(false)} style={{ padding: '7px 14px', background: 'transparent', border: '1.5px solid #FFD6D7', color: '#E04347', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {t.disconnectBtn}
                  </button>
                </div>
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
