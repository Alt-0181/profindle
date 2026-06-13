'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Dictionary } from '@/dictionaries';
import { PublicNav } from '@/components/layout/public-nav';
import { SearchCard } from '../search-card';
import { createClient } from '@/lib/supabase/client';
import type { Company } from './page';

interface SearchProvidersClientProps {
  lang: string;
  dict: Dictionary;
  companies: Company[];
  provinces: string[];
}

type SortKey = 'relevance' | 'views' | 'az';

type PortfolioProject = {
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
  sort_order: number;
};

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

// ─── Project Detail View (inside drawer) ─────────────────────────────────────

function ProjectDetail({ project, isTh, onBack, phone, email }: {
  project: PortfolioProject;
  isTh: boolean;
  onBack: () => void;
  phone: string | null;
  email: string | null;
}) {
  const results = project.results ? parseResults(isTh && project.results_th ? project.results_th : project.results) : [];

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, color: '#0F6F73', cursor: 'pointer', padding: '0 0 14px 0' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
        {isTh ? 'กลับ' : 'Back'}
      </button>

      {/* Cover carousel */}
      <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '14px', background: coverGradient(project.cover_color), position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', marginBottom: '18px' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.55) 100%)' }} />

        {/* Counter */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(14,16,23,0.6)', color: 'white', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', backdropFilter: 'blur(4px)', zIndex: 3 }}>1/1</div>

        {/* Arrows */}
        {[{ side: 'left', path: 'm15 18-6-6 6-6' }, { side: 'right', path: 'm9 18 6-6-6-6' }].map(({ side, path }) => (
          <div key={side} style={{ position: 'absolute', [side]: '10px', top: '50%', transform: 'translateY(-50%)', width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.35, zIndex: 3 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#171A21" strokeWidth="2.5" strokeLinecap="round"><path d={path}/></svg>
          </div>
        ))}

        {/* Dots */}
        <div style={{ position: 'absolute', bottom: '52px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px', zIndex: 3 }}>
          <div style={{ width: '18px', height: '6px', borderRadius: '3px', background: 'white' }} />
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.45)' }} />
        </div>

        <div style={{ position: 'relative', padding: '18px 20px', color: 'white', zIndex: 2 }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.01em', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>{project.title}</h3>
        </div>
      </div>

      {/* Meta */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: isTh ? 'ลูกค้า' : 'Client', val: project.confidential ? (isTh ? 'ลูกค้าลับ' : 'Confidential') : (project.client ?? '—') },
          { label: isTh ? 'ปี' : 'Year', val: project.year ? String(project.year) : '—' },
        ].map(f => (
          <div key={f.label} style={{ background: '#F4F8F8', borderRadius: '10px', padding: '10px 12px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9AA0AE' }}>{f.label}</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#171A21', marginTop: '2px' }}>{f.val}</div>
          </div>
        ))}
      </div>

      {/* Services Delivered */}
      {(project.category || project.budget) && (
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            {isTh ? 'บริการที่ให้' : 'Services Delivered'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {project.category && <span style={{ background: '#F0F9F9', color: '#0F6F73', fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '999px' }}>{project.category}</span>}
            {project.budget && <span style={{ background: '#FFF6EC', color: '#F77F00', fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '999px' }}>{project.budget}</span>}
          </div>
        </div>
      )}

      {/* Project Summary */}
      {(project.description || project.description_th) && (
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            {isTh ? 'รายละเอียดโครงการ' : 'Project Summary'}
          </div>
          <p style={{ fontSize: '14px', color: '#444B5A', lineHeight: 1.7, margin: 0 }}>
            {isTh && project.description_th ? project.description_th : project.description}
          </p>
        </div>
      )}

      {/* Results & Outcomes */}
      {results.length > 0 && (
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            {isTh ? 'ผลลัพธ์' : 'Results & Outcomes'}
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {results.map((r, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#444B5A', lineHeight: 1.6 }}>
                <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#F0F9F9', backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%230F6F73' stroke-width='3' stroke-linecap='round'><polyline points='20 6 9 17 4 12'/></svg>")`, backgroundPosition: 'center', backgroundRepeat: 'no-repeat', flexShrink: 0, marginTop: '1px', display: 'inline-block' }} />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Want a project like this? */}
      {(phone || email) && (
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            {isTh ? 'สนใจโปรเจกต์แบบนี้?' : 'Want a project like this?'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, '')}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', border: '1px solid #E4E7ED', borderRadius: '12px', textDecoration: 'none', color: '#171A21' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#F0F9F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Phone</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#171A21', marginTop: '1px' }}>{phone}</div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F6F73' }}>Call →</span>
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', border: '1px solid #E4E7ED', borderRadius: '12px', textDecoration: 'none', color: '#171A21' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#FFF1E0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F77F00" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#171A21', marginTop: '1px' }}>{email}</div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F6F73' }}>Email →</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Portfolio Section (inside drawer) ────────────────────────────────────────

function PortfolioSection({ projects, isTh, onSelectProject }: {
  projects: PortfolioProject[];
  isTh: boolean;
  onSelectProject: (p: PortfolioProject) => void;
}) {
  const [activeFilter, setActiveFilter] = useState('All');

  const categoryMap = new Map<string, number>();
  for (const p of projects) {
    if (p.category) categoryMap.set(p.category, (categoryMap.get(p.category) ?? 0) + 1);
  }
  const filters = ['All', ...Array.from(categoryMap.keys())];
  const filtered = activeFilter === 'All' ? projects : projects.filter(p => p.category === activeFilter);
  const countFor = (cat: string) => cat === 'All' ? projects.length : (categoryMap.get(cat) ?? 0);

  return (
    <div>
      {/* Filter chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
        {filters.map(cat => {
          const active = cat === activeFilter;
          return (
            <button key={cat} onClick={() => setActiveFilter(cat)} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: active ? '#0F6F73' : 'white', border: `1.5px solid ${active ? '#0F6F73' : '#E4E7ED'}`, color: active ? 'white' : '#444B5A', fontSize: '12px', fontWeight: 600, padding: '6px 12px', borderRadius: '999px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms' }}>
              {cat}
              <span style={{ fontSize: '10px', opacity: active ? 0.85 : 0.7 }}>{countFor(cat)}</span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ gridColumn: '1/-1', padding: '32px 18px', textAlign: 'center', background: '#FAFBFC', border: '1px dashed #E4E7ED', borderRadius: '12px', color: '#9AA0AE', fontSize: '13px' }}>
          {isTh ? `ไม่มีผลงานในหมวด ${activeFilter}` : `No projects in ${activeFilter}`}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          {filtered.map(p => (
            <button key={p.id} onClick={() => onSelectProject(p)} style={{ background: 'white', border: '1px solid #E4E7ED', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', padding: 0, textAlign: 'left', fontFamily: 'inherit', transition: 'transform 180ms, box-shadow 180ms, border-color 180ms', display: 'flex', flexDirection: 'column' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 22px rgba(15,111,115,0.14)'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#0F6F73'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = ''; (e.currentTarget as HTMLButtonElement).style.borderColor = '#E4E7ED'; }}
            >
              {/* 1:1 thumbnail */}
              <div style={{ width: '100%', aspectRatio: '1/1', background: coverGradient(p.cover_color), position: 'relative' }} />
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#171A21', lineHeight: 1.35, marginBottom: '3px', letterSpacing: '-0.01em' }}>{p.title}</div>
                <div style={{ fontSize: '11px', color: '#9AA0AE' }}>
                  {p.confidential ? (isTh ? 'ลูกค้าลับ' : 'Confidential') : p.client}
                  {p.year ? ` · ${p.year}` : ''}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Profile Drawer ──────────────────────────────────────────────────────────

function ProfileDrawer({ provider, lang, isTh, dict, onClose }: {
  provider: Company;
  lang: string;
  isTh: boolean;
  dict: Dictionary;
  onClose: () => void;
}) {
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);

  useEffect(() => {
    const sb = createClient();
    sb.from('portfolio_projects')
      .select('*')
      .eq('company_id', provider.id)
      .order('sort_order')
      .then(({ data }) => setPortfolio(data ?? []));
  }, [provider.id]);

  const displayName = isTh && provider.name_th ? provider.name_th : provider.name;
  const initial = provider.logo_initial ?? provider.name.slice(0, 2).toUpperCase();

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end' }}
      onClick={onClose}
    >
      {/* Blurred overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(14,16,23,0.6)', backdropFilter: 'blur(4px)' }} />

      {/* Drawer panel */}
      <div
        style={{ position: 'relative', width: '540px', maxWidth: '100vw', height: '100vh', overflowY: 'auto', background: 'white', boxShadow: '0 0 40px rgba(14,16,23,0.2)', animation: 'drawerSlideIn 250ms cubic-bezier(0.4,0,0.2,1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #0E1017, #0F6F73)', padding: '28px 24px 24px', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '26px', marginBottom: '14px', border: '2px solid rgba(255,255,255,0.2)' }}>
            {initial}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: '4px' }}>{displayName}</div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '14px' }}>
            {provider.province}{provider.services?.[0] ? ` · ${provider.services[0]}` : ''}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {provider.verified && <span style={{ background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px' }}>✓ {isTh ? 'ยืนยันแล้ว' : 'Verified'}</span>}
            {provider.premium && <span style={{ background: 'linear-gradient(135deg, #F77F00, #E06B00)', color: 'white', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px' }}>✦ Pro</span>}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {selectedProject ? (
            <ProjectDetail
              project={selectedProject}
              isTh={isTh}
              onBack={() => setSelectedProject(null)}
              phone={provider.phone ?? null}
              email={provider.email ?? null}
            />
          ) : (
            <>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  { val: (provider.views ?? 0).toLocaleString(), label: isTh ? 'การเข้าชม' : 'Profile Views' },
                  { val: String(portfolio.length || '—'), label: isTh ? 'ผลงาน' : 'Projects' },
                  { val: provider.founded_year ? String(provider.founded_year) : '—', label: isTh ? 'ก่อตั้ง' : 'Est. Since' },
                ].map(s => (
                  <div key={s.label} style={{ background: '#F4F8F8', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, background: 'linear-gradient(90deg, #0F6F73, #F77F00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.val}</div>
                    <div style={{ fontSize: '11px', color: '#9AA0AE', marginTop: '3px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* About */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>{isTh ? 'เกี่ยวกับ' : 'About'}</div>
                <p style={{ fontSize: '14px', color: '#444B5A', lineHeight: 1.7, margin: 0 }}>
                  {isTh && provider.description_th ? provider.description_th : provider.description}
                </p>
              </div>

              {/* Services */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>{dict.search.services}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {provider.services?.map(s => (
                    <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#F0F9F9', color: '#0F6F73', fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '999px' }}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Portfolio */}
              {portfolio.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>{isTh ? 'ผลงาน' : 'Portfolio'}</div>
                  <PortfolioSection projects={portfolio} isTh={isTh} onSelectProject={setSelectedProject} />
                </div>
              )}

              {/* Contact */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>{isTh ? 'ติดต่อ' : 'Contact'}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {provider.phone && (
                    <a href={`tel:${provider.phone.replace(/\s/g, '')}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', border: '1px solid #E4E7ED', borderRadius: '12px', textDecoration: 'none', color: '#171A21', transition: 'border-color 150ms, background 150ms' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#F0F9F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Phone</div>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#171A21', marginTop: '1px' }}>{provider.phone}</div>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F6F73', flexShrink: 0 }}>{isTh ? 'โทร →' : 'Call →'}</span>
                    </a>
                  )}
                  {provider.email && (
                    <a href={`mailto:${provider.email}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', border: '1px solid #E4E7ED', borderRadius: '12px', textDecoration: 'none', color: '#171A21' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#FFF1E0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F77F00" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</div>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#171A21', marginTop: '1px' }}>{provider.email}</div>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F6F73', flexShrink: 0 }}>{isTh ? 'อีเมล →' : 'Email →'}</span>
                    </a>
                  )}
                  {provider.website && (
                    <a href={provider.website.startsWith('http') ? provider.website : `https://${provider.website}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', border: '1px solid #E4E7ED', borderRadius: '12px', textDecoration: 'none', color: '#171A21' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#F0F9F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Website</div>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#171A21', marginTop: '1px' }}>{provider.website.replace(/^https?:\/\//, '')}</div>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F6F73', flexShrink: 0 }}>{isTh ? 'เยี่ยมชม →' : 'Visit →'}</span>
                    </a>
                  )}
                  {provider.line_id && (
                    <a href={`https://line.me/R/ti/p/${encodeURIComponent(provider.line_id)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', border: '1px solid #E4E7ED', borderRadius: '12px', textDecoration: 'none', color: '#171A21' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#06C755', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M19.365 9.89c.50 0 .866.37.866.87s-.368.87-.866.87H17.61v1.05h1.754c.498 0 .866.37.866.87s-.368.87-.866.87H16.74a.87.87 0 0 1-.866-.87V8.14c0-.498.368-.868.866-.868h2.624c.498 0 .866.37.866.87s-.368.87-.866.87H17.61v.878h1.754zm-6.735 3.65a.868.868 0 0 1-.607-.247l-2.627-2.78v2.16a.866.866 0 1 1-1.732 0V8.14a.866.866 0 0 1 1.474-.618l2.627 2.78V8.14a.866.866 0 1 1 1.732 0v5.4a.868.868 0 0 1-.866.868v.002zm-5.74 0a.866.866 0 0 1-.866-.868V8.14a.866.866 0 1 1 1.732 0v5.4a.866.866 0 0 1-.866.868v-.002zM24 10.314C24 4.943 18.617.572 12 .572S0 4.943 0 10.314c0 4.814 4.27 8.842 10.035 9.608.392.084.923.258 1.058.592.12.302.079.776.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.07 9.436-6.966C23.176 14.143 24 12.33 24 10.314z"/></svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.04em' }}>LINE Official</div>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#171A21', marginTop: '1px' }}>{provider.line_id}</div>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F6F73', flexShrink: 0 }}>{isTh ? 'เพิ่ม →' : 'Add →'}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Socials */}
              {(provider.social_facebook || provider.social_instagram) && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {provider.social_facebook && (
                    <a href={`https://${provider.social_facebook}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '8px 12px', borderRadius: '10px', background: '#F4F8F8', color: '#444B5A', textDecoration: 'none', fontSize: '12px', fontWeight: 600 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      Facebook
                    </a>
                  )}
                  {provider.social_instagram && (
                    <a href={`https://${provider.social_instagram}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '8px 12px', borderRadius: '10px', background: '#F4F8F8', color: '#444B5A', textDecoration: 'none', fontSize: '12px', fontWeight: 600 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="url(#ig2)" strokeWidth="2" strokeLinecap="round"><defs><linearGradient id="ig2" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#F77737"/><stop offset="50%" stopColor="#C13584"/><stop offset="100%" stopColor="#833AB4"/></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                      Instagram
                    </a>
                  )}
                </div>
              )}

              {/* View full profile CTA */}
              <Link
                href={`/${lang}/providers/${provider.id}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '13px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', borderRadius: '12px', textDecoration: 'none', textAlign: 'center' }}
              >
                {isTh ? 'ดูโปรไฟล์เต็มพร้อมผลงาน →' : 'View Full Profile & Portfolio →'}
              </Link>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes drawerSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function SearchProvidersClient({ lang, dict, companies, provinces }: SearchProvidersClientProps) {
  const t = dict.search;
  const isTh = lang === 'th';
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [sort, setSort] = useState<SortKey>('relevance');
  const [drawerProvider, setDrawerProvider] = useState<Company | null>(null);

  const filtered = companies
    .filter(p => {
      if (verifiedOnly && !p.verified) return false;
      if (selectedProvince && p.province !== selectedProvince) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'views') return (b.views ?? 0) - (a.views ?? 0);
      if (sort === 'az') return a.name.localeCompare(b.name);
      if (b.premium !== a.premium) return b.premium ? 1 : -1;
      if (b.verified !== a.verified) return b.verified ? 1 : -1;
      return (b.views ?? 0) - (a.views ?? 0);
    });

  return (
    <div style={{ fontFamily: "'Inter', 'Noto Sans Thai', sans-serif", minHeight: '100vh', background: '#F4F5F7' }}>
      <PublicNav locale={lang} dict={dict} dark={false} />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(140deg, #0E1017 0%, #0F6F73 100%)', padding: '48px 24px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 80% at 80% 50%, rgba(43,190,197,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: 'white', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            {isTh ? 'ค้นหาผู้ให้บริการ' : 'Find Service Providers'}
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', marginBottom: '32px' }}>
            {isTh ? 'ค้นหาผู้ให้บริการ B2B ที่ผ่านการตรวจสอบทั่วไทย — ไม่ต้องสมัครสมาชิก' : 'Browse verified Thai B2B service providers — no account needed'}
          </p>
          <SearchCard lang={lang} />
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px', alignItems: 'start' }}>

        {/* Filter rail */}
        <div style={{ position: 'sticky', top: '80px', background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#171A21', marginBottom: '16px' }}>{t.filters}</div>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              style={{ padding: '5px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: `1.5px solid ${verifiedOnly ? '#0F6F73' : '#E4E7ED'}`, background: verifiedOnly ? '#F0F9F9' : 'transparent', color: verifiedOnly ? '#0F6F73' : '#6B7385' }}
            >
              ✓ {isTh ? 'ยืนยันแล้ว' : 'Verified'}
            </button>
          </div>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9AA0AE', marginBottom: '8px' }}>{t.province}</div>
          {provinces.map(p => (
            <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: selectedProvince === p ? '#0F6F73' : '#444B5A', cursor: 'pointer', marginBottom: '8px', fontWeight: selectedProvince === p ? 600 : 400 }}>
              <input type="checkbox" checked={selectedProvince === p} onChange={e => setSelectedProvince(e.target.checked ? p : '')} style={{ accentColor: '#0F6F73', width: '14px', height: '14px' }} />
              {p}
            </label>
          ))}
        </div>

        {/* Provider grid */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', color: '#6B7385' }}>
              {isTh ? 'แสดง' : 'Showing'} <strong style={{ color: '#171A21' }}>{filtered.length}</strong> {t.providersFound}
            </div>
            <select value={sort} onChange={e => setSort(e.target.value as SortKey)} style={{ fontSize: '13px', color: '#444B5A', border: '1px solid #E4E7ED', borderRadius: '8px', padding: '6px 12px', background: 'white', fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
              <option value="relevance">{isTh ? 'เรียงตาม: ความเกี่ยวข้อง' : 'Sort: Relevance'}</option>
              <option value="views">{isTh ? 'เรียงตาม: ยอดเข้าชม' : 'Sort: Most Viewed'}</option>
              <option value="az">{isTh ? 'เรียงตาม: A–Z' : 'Sort: A–Z'}</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', border: '2px dashed #E4E7ED', borderRadius: '16px', background: 'white' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#171A21', marginBottom: '8px' }}>
                {isTh ? 'ไม่พบผู้ให้บริการที่ตรงกัน — ให้ผู้ให้บริการมาหาคุณ' : 'No exact match — let providers come to you'}
              </div>
              <p style={{ fontSize: '13px', color: '#6B7385', lineHeight: 1.6, maxWidth: '360px', margin: '0 auto 20px' }}>
                {isTh ? 'ประกาศคำขอและผู้ให้บริการที่ตรงกันทุกรายจะได้รับแจ้งผ่าน LINE ทันที ' : 'Broadcast your request and every matching provider gets pinged on LINE instantly. '}
                <strong style={{ color: '#F77F00' }}>{isTh ? 'ฟรี 100%' : '100% free'}</strong>
                {isTh ? ' — ไม่มีค่าคอมมิชชั่น' : ' — no commission.'}
              </p>
              <Link href={`/${lang}/signup`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 22px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', borderRadius: '12px', textDecoration: 'none' }}>
                {isTh ? 'ประกาศคำขอของฉัน — ฟรี' : 'Broadcast my request — Free'}
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {filtered.map(p => {
                const name = isTh && p.name_th ? p.name_th : p.name;
                const desc = isTh && p.description_th ? p.description_th : p.description;
                const initial = p.logo_initial ?? p.name.slice(0, 2).toUpperCase();
                return (
                  <div
                    key={p.id}
                    onClick={() => setDrawerProvider(p)}
                    style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '20px', cursor: 'pointer', transition: 'transform 200ms, box-shadow 200ms' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 24px rgba(15,111,115,0.12)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
                  >
                    {/* Top row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>
                        {initial}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: '#171A21', lineHeight: 1.3 }}>{name}</div>
                          {p.premium && <span style={{ background: 'linear-gradient(135deg, #F77F00, #E06B00)', color: 'white', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '999px', flexShrink: 0 }}>✦ Pro</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#9AA0AE', marginTop: '3px', flexWrap: 'wrap' }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {p.province}
                          {p.verified && <span style={{ background: '#171A21', color: 'white', fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '999px' }}>{isTh ? 'ยืนยันแล้ว' : 'Verified'}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p style={{ fontSize: '13px', color: '#6B7385', lineHeight: 1.6, marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {desc}
                    </p>

                    {/* Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                      {p.services.slice(0, 3).map((s, i) => (
                        <span key={s} style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: i === 0 ? '#F0F9F9' : 'transparent', color: i === 0 ? '#0F6F73' : '#6B7385', border: i === 0 ? '1px solid transparent' : '1px solid #E4E7ED' }}>{s}</span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F4F5F7', paddingTop: '12px' }}>
                      <span style={{ fontSize: '12px', color: '#9AA0AE' }}>{(p.views ?? 0).toLocaleString()} {isTh ? 'การเข้าชม' : 'profile views'}</span>
                      <button style={{ padding: '7px 16px', background: p.premium ? 'linear-gradient(135deg, #0F6F73, #1A9DA3)' : 'transparent', color: p.premium ? 'white' : '#0F6F73', border: p.premium ? 'none' : '1.5px solid #0F6F73', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        {t.viewProfile}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Signup banner */}
      <div style={{ background: 'linear-gradient(135deg, #171A21, #0F6F73)', borderRadius: '20px', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', margin: '0 24px 48px', flexWrap: 'wrap', maxWidth: '1200px', marginLeft: 'auto', marginRight: 'auto' }}>
        <div>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'white', marginBottom: '5px' }}>
            {isTh ? 'ต้องการให้ผู้ให้บริการมาหาคุณทันที?' : 'Want providers to come to you — instantly?'}
          </h3>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0 }}>
            {isTh ? 'ประกาศคำขอ และผู้ให้บริการที่ตรงกันทุกรายจะได้รับแจ้งผ่าน LINE ทันที ' : 'Broadcast your request and every matching provider gets notified on LINE in real time. '}
            <strong style={{ color: '#F77F00' }}>{isTh ? 'ฟรี 100%' : '100% free'}</strong>
            {isTh ? ' — ไม่มีค่าคอมมิชชั่น' : ' — no hidden fees, no commission.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          <Link href={`/${lang}/signup`} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #F77F00, #E06B00)', color: 'white', fontWeight: 700, fontSize: '13px', borderRadius: '10px', textDecoration: 'none' }}>
            {isTh ? 'สร้างบัญชีฟรี' : 'Create Free Account'}
          </Link>
          <Link href={`/${lang}/login`} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.10)', color: 'white', fontWeight: 600, fontSize: '13px', borderRadius: '10px', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.2)' }}>
            {isTh ? 'เข้าสู่ระบบ' : 'Sign In'}
          </Link>
        </div>
      </div>

      {/* Profile Drawer */}
      {drawerProvider && (
        <ProfileDrawer
          provider={drawerProvider}
          lang={lang}
          isTh={isTh}
          dict={dict}
          onClose={() => setDrawerProvider(null)}
        />
      )}
    </div>
  );
}
