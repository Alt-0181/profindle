'use client';
import { useState } from 'react';

type Project = {
  id: string;
  title: string;
  client: string | null;
  confidential: boolean;
  year: number | null;
  budget: string | null;
  category: string | null;
  description: string | null;
  description_th: string | null;
  results: string | null;
  results_th: string | null;
  cover_color: string | null;
};

type Contact = { phone: string | null; email: string | null; companyName: string };

function coverGradient(color: string | null): string {
  const map: Record<string, string> = {
    '#0F6F73': 'linear-gradient(135deg, #0F6F73, #1A9DA3)',
    '#F77F00': 'linear-gradient(135deg, #F77F00, #E06B00)',
    '#1A9DA3': 'linear-gradient(135deg, #1A9DA3, #2BBEC5)',
  };
  return map[color ?? ''] ?? `linear-gradient(135deg, ${color ?? '#0F6F73'}, #1A9DA3)`;
}

function parseResults(text: string): string[] {
  return text.split(/\.\s+/).map(s => s.replace(/\.$/, '').trim()).filter(Boolean);
}

export function PortfolioGrid({ projects, contact, isTh }: { projects: Project[]; contact: Contact; isTh: boolean }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selected, setSelected] = useState<Project | null>(null);

  const categoryMap = new Map<string, number>();
  for (const p of projects) {
    if (p.category) categoryMap.set(p.category, (categoryMap.get(p.category) ?? 0) + 1);
  }
  const categories = ['All', ...Array.from(categoryMap.keys())];
  const countFor = (cat: string) => cat === 'All' ? projects.length : (categoryMap.get(cat) ?? 0);
  const filtered = activeCategory === 'All' ? projects : projects.filter(p => p.category === activeCategory);

  return (
    <>
      {/* Filter chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {categories.map(cat => {
          const active = cat === activeCategory;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '6px 14px', borderRadius: '999px',
                border: `1px solid ${active ? '#0F6F73' : 'rgba(15,111,115,0.18)'}`,
                background: active ? '#0F6F73' : 'white',
                color: active ? 'white' : '#444B5A',
                fontSize: '13px', fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms',
              }}
            >
              {cat}
              <span style={{ fontSize: '11px', opacity: active ? 0.85 : 0.7 }}>{countFor(cat)}</span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {filtered.map(p => (
          <div
            key={p.id}
            onClick={() => setSelected(p)}
            style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(15,111,115,0.10)', cursor: 'pointer', transition: 'transform 250ms, box-shadow 250ms' }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.cssText += 'transform:translateY(-2px);box-shadow:0 8px 24px rgba(15,111,115,0.13)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
          >
            <div style={{ aspectRatio: '4/3', background: coverGradient(p.cover_color), position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />
              <div style={{ position: 'relative', padding: '10px 12px', color: 'white' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.3 }}>{p.title}</div>
              </div>
            </div>
            <div style={{ padding: '8px 12px 10px' }}>
              <div style={{ fontSize: '11px', color: '#9AA0AE' }}>
                {p.confidential ? (isTh ? 'ลูกค้าลับ' : 'Confidential') : p.client}
                {p.year ? ` · ${p.year}` : ''}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(14,16,23,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '560px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(14,16,23,0.3)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Cover */}
            <div style={{ height: '240px', background: coverGradient(selected.cover_color), borderRadius: '20px 20px 0 0', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.65) 100%)' }} />
              <button
                onClick={() => setSelected(null)}
                style={{ position: 'absolute', top: '12px', right: '12px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(14,16,23,0.5)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <div style={{ position: 'relative', padding: '20px 24px', color: 'white' }}>
                {selected.category && <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.75, marginBottom: '6px' }}>{selected.category}</div>}
                <div style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.25 }}>{selected.title}</div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* CLIENT / YEAR */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: isTh ? 'ลูกค้า' : 'CLIENT', val: selected.confidential ? (isTh ? 'ลูกค้าลับ' : 'Confidential') : (selected.client ?? '—') },
                  { label: isTh ? 'ปี' : 'YEAR', val: selected.year ? String(selected.year) : '—' },
                ].map(f => (
                  <div key={f.label} style={{ padding: '12px 14px', background: '#F4F5F7', borderRadius: '10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{f.label}</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#171A21' }}>{f.val}</div>
                  </div>
                ))}
              </div>

              {/* Services delivered */}
              {(selected.category || selected.budget) && (
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                    {isTh ? 'บริการที่ให้' : 'Services Delivered'}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selected.category && <span style={{ background: '#F0F9F9', color: '#0F6F73', fontSize: '13px', fontWeight: 600, padding: '5px 14px', borderRadius: '999px' }}>{selected.category}</span>}
                    {selected.budget && <span style={{ background: '#FFF6EC', color: '#F77F00', fontSize: '13px', fontWeight: 600, padding: '5px 14px', borderRadius: '999px' }}>{selected.budget}</span>}
                  </div>
                </div>
              )}

              {/* Project summary */}
              {(selected.description || selected.description_th) && (
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                    {isTh ? 'รายละเอียดโครงการ' : 'Project Summary'}
                  </div>
                  <p style={{ fontSize: '14px', color: '#444B5A', lineHeight: 1.7, margin: 0 }}>
                    {isTh && selected.description_th ? selected.description_th : selected.description}
                  </p>
                </div>
              )}

              {/* Results */}
              {(selected.results || selected.results_th) && (
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                    {isTh ? 'ผลลัพธ์' : 'Results & Outcomes'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    {parseResults(isTh && selected.results_th ? selected.results_th : (selected.results ?? '')).map((bullet, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#444B5A' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '2px' }}><polyline points="20 6 9 17 4 12"/></svg>
                        {bullet}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Want a project like this? */}
              {(contact.phone || contact.email) && (
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                    {isTh ? 'สนใจโปรเจกต์แบบนี้?' : 'Want a project like this?'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {contact.phone && (
                      <a href={`tel:${contact.phone}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: '1px solid #E4E7ED', borderRadius: '10px', textDecoration: 'none', color: '#171A21' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F0F9F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Phone</div>
                            <div style={{ fontSize: '13px', fontWeight: 500 }}>{contact.phone}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F6F73' }}>Call →</span>
                      </a>
                    )}
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: '1px solid #E4E7ED', borderRadius: '10px', textDecoration: 'none', color: '#171A21' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFF6EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F77F00" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</div>
                            <div style={{ fontSize: '13px', fontWeight: 500 }}>{contact.email}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F6F73' }}>Email →</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
