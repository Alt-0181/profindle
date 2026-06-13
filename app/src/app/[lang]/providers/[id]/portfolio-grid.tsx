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
    '#0F6F73': 'linear-gradient(135deg, #0F6F73 0%, #1A9DA3 100%)',
    '#F77F00': 'linear-gradient(135deg, #F77F00 0%, #E06B00 100%)',
    '#1A9DA3': 'linear-gradient(135deg, #1A9DA3 0%, #2BBEC5 100%)',
  };
  return map[color ?? ''] ?? `linear-gradient(135deg, ${color ?? '#0F6F73'} 0%, #1A9DA3 100%)`;
}

function parseResults(text: string): string[] {
  return text.split(/\.\s+/).map(s => s.replace(/\.$/, '').trim()).filter(Boolean);
}

function ProjectDetail({ project, contact, isTh, onBack }: { project: Project; contact: Contact; isTh: boolean; onBack: () => void }) {
  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#0F6F73', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, marginBottom: '14px' }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        {isTh ? `กลับไปที่ ${contact.companyName}` : `Back to ${contact.companyName}`}
      </button>

      {/* Carousel — 16:9, sized to content column width */}
      <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '14px', background: coverGradient(project.cover_color), position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', marginBottom: '18px' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.65) 100%)' }} />

        {/* Counter */}
        <div style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(14,16,23,0.55)', color: 'white', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', backdropFilter: 'blur(4px)', zIndex: 2 }}>
          1/1
        </div>

        {/* Prev arrow */}
        <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, zIndex: 2 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#171A21" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
        </div>

        {/* Next arrow */}
        <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, zIndex: 2 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#171A21" strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>

        {/* Dot indicator */}
        <div style={{ position: 'absolute', bottom: '56px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px', zIndex: 2 }}>
          <div style={{ width: '18px', height: '6px', borderRadius: '3px', background: 'white' }} />
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.45)' }} />
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.45)' }} />
        </div>

        {/* Title overlay */}
        <div style={{ position: 'relative', padding: '24px 32px', color: 'white', zIndex: 2 }}>
          <div style={{ fontSize: '24px', fontWeight: 700, lineHeight: 1.25 }}>{project.title}</div>
        </div>
      </div>

      {/* Content */}
      <div>

        {/* CLIENT / YEAR */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #E4E7ED' }}>
          {[
            { label: isTh ? 'ลูกค้า' : 'CLIENT', val: project.confidential ? (isTh ? 'ลูกค้าลับ' : 'Confidential') : (project.client ?? '—') },
            { label: isTh ? 'ปี' : 'YEAR', val: project.year ? String(project.year) : '—' },
          ].map((f, i) => (
            <div key={f.label} style={{ padding: '20px 0', borderRight: i === 0 ? '1px solid #E4E7ED' : 'none', paddingRight: i === 0 ? '24px' : 0, paddingLeft: i === 1 ? '24px' : 0 }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{f.label}</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#171A21' }}>{f.val}</div>
            </div>
          ))}
        </div>

        {/* Services Delivered */}
        {(project.category || project.budget) && (
          <div style={{ padding: '20px 0', borderBottom: '1px solid #E4E7ED' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
              {isTh ? 'บริการที่ให้' : 'Services Delivered'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {project.category && <span style={{ background: '#F0F9F9', color: '#0F6F73', fontSize: '13px', fontWeight: 600, padding: '6px 16px', borderRadius: '999px' }}>{project.category}</span>}
              {project.budget && <span style={{ background: '#FFF6EC', color: '#F77F00', fontSize: '13px', fontWeight: 600, padding: '6px 16px', borderRadius: '999px' }}>{project.budget}</span>}
            </div>
          </div>
        )}

        {/* Project Summary */}
        {(project.description || project.description_th) && (
          <div style={{ padding: '20px 0', borderBottom: '1px solid #E4E7ED' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
              {isTh ? 'รายละเอียดโครงการ' : 'Project Summary'}
            </div>
            <p style={{ fontSize: '15px', color: '#444B5A', lineHeight: 1.75, margin: 0 }}>
              {isTh && project.description_th ? project.description_th : project.description}
            </p>
          </div>
        )}

        {/* Results & Outcomes */}
        {(project.results || project.results_th) && (
          <div style={{ padding: '20px 0', borderBottom: '1px solid #E4E7ED' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
              {isTh ? 'ผลลัพธ์' : 'Results & Outcomes'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {parseResults(isTh && project.results_th ? project.results_th : (project.results ?? '')).map((bullet, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: '#444B5A' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '2px' }}><polyline points="20 6 9 17 4 12"/></svg>
                  {bullet}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Want a project like this? */}
        {(contact.phone || contact.email) && (
          <div style={{ padding: '20px 0' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
              {isTh ? 'สนใจโปรเจกต์แบบนี้?' : 'Want a project like this?'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {contact.phone && (
                <a href={`tel:${contact.phone}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', border: '1px solid #E4E7ED', borderRadius: '12px', textDecoration: 'none', color: '#171A21' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F0F9F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Phone</div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{contact.phone}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F6F73' }}>Call →</span>
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', border: '1px solid #E4E7ED', borderRadius: '12px', textDecoration: 'none', color: '#171A21' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FFF6EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F77F00" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email</div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{contact.email}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F6F73' }}>Email →</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
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

  if (selected) {
    return (
      <ProjectDetail
        project={selected}
        contact={contact}
        isTh={isTh}
        onBack={() => setSelected(null)}
      />
    );
  }

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
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(15,111,115,0.13)'; }}
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
    </>
  );
}
