'use client';

import { useState } from 'react';
import type { Dictionary } from '@/dictionaries';

interface PortfolioClientProps {
  lang: string;
  dict: Dictionary;
}

interface Project {
  id: string;
  title: string;
  client: string;
  year: string;
  services: string[];
  coverImage?: string;
}

export function PortfolioClient({ lang, dict }: PortfolioClientProps) {
  const t = dict.portfolio;
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', client: '', year: new Date().getFullYear().toString(), descEn: '', descTh: '', resultsEn: '', resultsTh: '', budget: '', confidential: false });
  const [clientSearch, setClientSearch] = useState('');

  const KNOWN_CLIENTS = ['Kasikorn Bank', 'SCB', 'PTT', 'CP Group', 'Siam Cement', 'True Corporation', 'AIS', 'Dtac', 'Central Group', 'The Mall Group', 'Big C', "Lotus's", 'Robinson', 'Bangkok Bank', 'Krungthai Bank'];
  const clientSuggestions = clientSearch.length >= 2 ? KNOWN_CLIENTS.filter((c) => c.toLowerCase().includes(clientSearch.toLowerCase())).slice(0, 6) : [];

  const inputStyle: React.CSSProperties = {
    width: '100%', fontSize: '14px', padding: '10px 14px',
    border: '1.5px solid #E4E7ED', borderRadius: '12px',
    background: 'white', outline: 'none', color: '#171A21', fontFamily: 'inherit',
  };

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleAdd = () => {
    if (!form.title) return;
    setProjects([...projects, {
      id: Date.now().toString(),
      title: form.title,
      client: form.confidential ? (lang === 'th' ? 'ไม่เปิดเผย' : 'Confidential') : form.client,
      year: form.year,
      services: [],
    }]);
    setShowModal(false);
    setForm({ title: '', client: '', year: new Date().getFullYear().toString(), descEn: '', descTh: '', resultsEn: '', resultsTh: '', budget: '', confidential: false });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{t.title}</h1>
          <p style={{ fontSize: '14px', color: '#6B7385' }}>{t.subtitle}</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t.addProject}
        </button>
      </div>

      {/* Portfolio grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {projects.map((proj) => (
          <div key={proj.id} style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', overflow: 'hidden', cursor: 'pointer', transition: 'all 200ms' }}>
            <div style={{ aspectRatio: '4/3', background: 'linear-gradient(135deg, #F0F9F9, #D4EEEF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#A8DCDF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{proj.title}</div>
              <div style={{ fontSize: '12px', color: '#9AA0AE' }}>{proj.client} · {proj.year}</div>
            </div>
          </div>
        ))}

        {/* Add card */}
        <div onClick={() => setShowModal(true)} style={{
          aspectRatio: '4/3', border: '2px dashed #C8CDD7', borderRadius: '16px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
          cursor: 'pointer', transition: 'all 150ms', background: 'transparent',
        }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F0F9F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#9AA0AE' }}>
            {projects.length === 0 ? t.noProjects : t.addProject}
          </span>
          {projects.length === 0 && <span style={{ fontSize: '12px', color: '#C8CDD7', textAlign: 'center', maxWidth: '160px' }}>{t.noProjectsSub}</span>}
        </div>
      </div>

      {/* Add project modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(14,16,23,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', maxWidth: '580px', width: '100%', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(14,16,23,0.3)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#171A21' }}>{t.addProject}</h3>
              <button onClick={() => setShowModal(false)} style={{ width: '32px', height: '32px', border: 'none', background: '#F4F5F7', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Images */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>{t.images}</label>
                <p style={{ fontSize: '12px', color: '#9AA0AE', marginBottom: '10px' }}>{t.imagesSub}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ aspectRatio: '4/3', border: '2px dashed #C8CDD7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8CDD7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      {i === 0 && <span style={{ position: 'absolute', bottom: '3px', left: '4px', fontSize: '9px', fontWeight: 700, color: '#9AA0AE' }}>{lang === 'th' ? 'หน้าปก' : 'Cover'}</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>{t.projectTitle}</label>
                <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder={t.titlePh} style={inputStyle} />
              </div>

              {/* Client autocomplete */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>{t.client}</label>
                <input
                  type="text" value={form.confidential ? (lang === 'th' ? 'ไม่เปิดเผย' : 'Confidential') : clientSearch}
                  onChange={(e) => { setClientSearch(e.target.value); set('client', e.target.value); }}
                  disabled={form.confidential}
                  placeholder={t.clientPh}
                  style={{ ...inputStyle, opacity: form.confidential ? 0.5 : 1 }}
                />
                {clientSuggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'white', border: '1px solid #E4E7ED', borderRadius: '12px', boxShadow: '0 8px 24px rgba(23,26,33,0.12)', zIndex: 50, maxHeight: '260px', overflowY: 'auto' }}>
                    {clientSuggestions.map((c) => (
                      <div key={c} onClick={() => { set('client', c); setClientSearch(c); }} style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '13px', color: '#171A21', borderBottom: '1px solid #F4F5F7' }}>
                        {c}
                      </div>
                    ))}
                    {clientSearch && !KNOWN_CLIENTS.find((c) => c.toLowerCase() === clientSearch.toLowerCase()) && (
                      <div onClick={() => { set('client', clientSearch); setClientSearch(clientSearch); }} style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '13px', color: '#0F6F73', fontWeight: 600 }}>
                        + {t.addClient.replace('{name}', clientSearch)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Confidential toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px 14px', border: `1.5px solid ${form.confidential ? '#F77F00' : '#E4E7ED'}`, borderRadius: '12px', background: form.confidential ? '#FFF8F0' : 'transparent', transition: 'all 150ms' }}>
                <input type="checkbox" checked={form.confidential} onChange={(e) => { set('confidential', e.target.checked); if (e.target.checked) setClientSearch(''); }} style={{ width: '20px', height: '20px', accentColor: '#F77F00', borderRadius: '4px', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: form.confidential ? '#E06B00' : '#444B5A' }}>{t.confidential}</span>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>{t.year}</label>
                  <input type="number" value={form.year} onChange={(e) => set('year', e.target.value)} min={2000} max={2026} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>{t.budget}</label>
                  <select value={form.budget} onChange={(e) => set('budget', e.target.value)} style={inputStyle}>
                    <option value="">—</option>
                    <option>Under ฿50,000</option>
                    <option>฿50,000 – 100,000</option>
                    <option>฿100,000 – 300,000</option>
                    <option>฿300,000 – 500,000</option>
                    <option>Over ฿500,000</option>
                  </select>
                </div>
              </div>

              {/* Bilingual descriptions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>
                    {t.descEn}
                    <span style={{ background: '#F0F9F9', color: '#0F6F73', fontSize: '10px', padding: '1px 6px', borderRadius: '999px', fontWeight: 600 }}>EN</span>
                  </label>
                  <textarea value={form.descEn} onChange={(e) => set('descEn', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} />
                </div>
                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>
                    {t.descTh}
                    <span style={{ background: '#FFF6EC', color: '#E06B00', fontSize: '10px', padding: '1px 6px', borderRadius: '999px', fontWeight: 600 }}>TH</span>
                  </label>
                  <textarea value={form.descTh} onChange={(e) => set('descTh', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '8px' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1.5px solid #E4E7ED', color: '#444B5A', fontWeight: 600, fontSize: '14px', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {dict.common.cancel}
                </button>
                <button onClick={handleAdd} disabled={!form.title} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', borderRadius: '12px', cursor: form.title ? 'pointer' : 'not-allowed', opacity: form.title ? 1 : 0.5, fontFamily: 'inherit' }}>
                  {t.saveBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
