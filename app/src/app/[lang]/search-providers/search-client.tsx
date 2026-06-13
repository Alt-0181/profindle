'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

// ─── Project Detail View ─────────────────────────────────────────────────────

function ProjectDetail({ project, isTh, onBack, phone, email, providerName }: {
  project: PortfolioProject;
  isTh: boolean;
  onBack: () => void;
  phone: string | null;
  email: string | null;
  providerName: string;
}) {
  const [slideIdx, setSlideIdx] = useState(0);
  const results = project.results
    ? parseResults(isTh && project.results_th ? project.results_th : project.results)
    : [];
  const slides = [project.cover_color, '#F77F00', '#171A21']; // 3 demo slides until real images stored

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, color: '#0F6F73', cursor: 'pointer', padding: '0', marginBottom: '14px' }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        {isTh ? `กลับไป ${providerName}` : `Back to ${providerName}`}
      </button>

      {/* Cover carousel */}
      <div style={{ width: '100%', aspectRatio: '4/5', maxHeight: '560px', borderRadius: '14px', background: coverGradient(project.cover_color), position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', marginBottom: '18px' }}>
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.65) 100%)' }} />

        {/* Track */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', transition: 'transform 280ms cubic-bezier(0.4,0,0.2,1)', transform: `translateX(-${slideIdx * 100}%)` }}>
          {slides.map((c, i) => (
            <div key={i} style={{ flex: '0 0 100%', height: '100%', background: coverGradient(c) }} />
          ))}
        </div>

        {/* Counter — always visible */}
        <div style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(14,16,23,0.55)', color: 'white', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', backdropFilter: 'blur(4px)', zIndex: 3 }}>
          {slideIdx + 1}/{slides.length}
        </div>

        {/* Prev arrow — always visible, dimmed when disabled */}
        <div
          onClick={() => slideIdx > 0 && setSlideIdx(i => i - 1)}
          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: slideIdx === 0 ? 0.3 : 1, zIndex: 3, cursor: slideIdx === 0 ? 'default' : 'pointer', boxShadow: '0 2px 8px rgba(14,16,23,0.2)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#171A21" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
        </div>

        {/* Next arrow — always visible, dimmed when disabled */}
        <div
          onClick={() => slideIdx < slides.length - 1 && setSlideIdx(i => i + 1)}
          style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: slideIdx === slides.length - 1 ? 0.3 : 1, zIndex: 3, cursor: slideIdx === slides.length - 1 ? 'default' : 'pointer', boxShadow: '0 2px 8px rgba(14,16,23,0.2)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#171A21" strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>

        {/* Bottom bar: title left + dots right, same row */}
        <div style={{ position: 'relative', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', zIndex: 2 }}>
          <div style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1.25, color: 'white' }}>{project.title}</div>
          <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
            {slides.map((_, i) => (
              <div key={i} onClick={() => setSlideIdx(i)} style={{ width: i === slideIdx ? '18px' : '6px', height: '6px', borderRadius: i === slideIdx ? '3px' : '50%', background: i === slideIdx ? 'white' : 'rgba(255,255,255,0.5)', transition: 'all 220ms', cursor: 'pointer' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Meta: Client + Year */}
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
      {project.category && (
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            {isTh ? 'บริการที่ส่งมอบ' : 'Services Delivered'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', background: '#F0F9F9', color: '#0F6F73', fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '999px' }}>{project.category}</span>
          </div>
        </div>
      )}

      {/* Project Summary */}
      {(project.description || project.description_th) && (
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            {isTh ? 'สรุปผลงาน' : 'Project Summary'}
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
            {isTh ? 'อยากได้ผลงานแบบนี้?' : 'Want a project like this?'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, '')}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', border: '1px solid #E4E7ED', borderRadius: '12px', textDecoration: 'none', color: '#171A21', transition: 'border-color 150ms, background 150ms' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#F0F9F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#0F6F73' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.92 3.38C1.86 2.58 2.42 2 3.22 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.15 6.15l1.48-1.48a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Phone</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#171A21', marginTop: '1px' }}>{phone}</div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F6F73', flexShrink: 0 }}>{isTh ? 'โทร →' : 'Call →'}</span>
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', border: '1px solid #E4E7ED', borderRadius: '12px', textDecoration: 'none', color: '#171A21' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#FFF1E0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#F77F00' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22 7 12 13 2 7"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#171A21', marginTop: '1px' }}>{email}</div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F6F73', flexShrink: 0 }}>{isTh ? 'อีเมล →' : 'Email →'}</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Portfolio Section ────────────────────────────────────────────────────────

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
        <div style={{ padding: '32px 18px', textAlign: 'center', background: '#FAFBFC', border: '1px dashed #E4E7ED', borderRadius: '12px', color: '#9AA0AE', fontSize: '13px' }}>
          {isTh ? `ไม่มีผลงานในหมวด ${activeFilter}` : `No projects in ${activeFilter}`}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {filtered.map(p => (
            <button key={p.id} onClick={() => onSelectProject(p)}
              style={{ background: 'white', border: '1px solid #E4E7ED', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', padding: 0, textAlign: 'left', fontFamily: 'inherit', transition: 'transform 180ms, box-shadow 180ms, border-color 180ms', display: 'flex', flexDirection: 'column' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 22px rgba(15,111,115,0.14)'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#0F6F73'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = ''; (e.currentTarget as HTMLButtonElement).style.borderColor = '#E4E7ED'; }}
            >
              {/* 4:3 thumbnail */}
              <div style={{ width: '100%', aspectRatio: '4/3', background: coverGradient(p.cover_color), position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />
                <div style={{ position: 'relative', padding: '10px 12px', color: 'white' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, lineHeight: 1.3 }}>{p.title}</div>
                </div>
              </div>
              <div style={{ padding: '8px 12px 10px' }}>
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

// ─── Profile Drawer (full-width overlay) ─────────────────────────────────────

function ProfileDrawer({ provider, lang, isTh, dict, onClose }: {
  provider: Company;
  lang: string;
  isTh: boolean;
  dict: Dictionary;
  onClose: () => void;
}) {
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const sb = createClient();
    sb.from('portfolio_projects')
      .select('*')
      .eq('company_id', provider.id)
      .order('sort_order')
      .then(({ data }) => setPortfolio(data ?? []));
  }, [provider.id]);

  const openProject = (p: PortfolioProject) => {
    setSelectedProject(p);
    requestAnimationFrame(() => drawerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const backToProfile = () => {
    setSelectedProject(null);
    requestAnimationFrame(() => drawerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const displayName = isTh && provider.name_th ? provider.name_th : provider.name;
  const initial = provider.logo_initial ?? provider.name.slice(0, 2).toUpperCase();
  // Pad hero content so it aligns with the max-width body content
  const heroPad = 'max(28px, calc((100vw - 1200px)/2 + 28px))';

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(14,16,23,0.6)', backdropFilter: 'blur(4px)', zIndex: 500, display: 'flex', alignItems: 'stretch', justifyContent: 'center' }}
        onClick={onClose}
      >
        {/* Full-width drawer */}
        <div
          ref={drawerRef}
          style={{ width: '100%', height: '100vh', overflowY: 'auto', background: 'white', animation: 'profileSlideIn 250ms cubic-bezier(0.4,0,0.2,1)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Hero — gradient spans full width, content is padded to align with body */}
          <div style={{
            background: 'linear-gradient(135deg, #0E1017, #0F6F73)',
            paddingTop: '28px', paddingBottom: '24px',
            paddingLeft: heroPad, paddingRight: heroPad,
            position: 'relative',
          }}>
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

          {/* Body — max-width centered */}
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 28px 60px' }}>

            {/* Stats — always shown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {[
                { val: (provider.views ?? 0).toLocaleString(), label: isTh ? 'การเข้าชม' : 'Profile Views' },
                { val: portfolio.length > 0 ? String(portfolio.length) : '—', label: isTh ? 'ผลงาน' : 'Projects' },
                { val: provider.founded_year ? String(provider.founded_year) : '—', label: isTh ? 'ก่อตั้ง' : 'Est. Since' },
              ].map(s => (
                <div key={s.label} style={{ background: '#F4F8F8', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, background: 'linear-gradient(90deg, #0F6F73, #F77F00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.val}</div>
                  <div style={{ fontSize: '11px', color: '#9AA0AE', marginTop: '3px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* About — always shown */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                {isTh ? 'เกี่ยวกับบริษัท' : 'About'}
              </div>
              <p style={{ fontSize: '14px', color: '#444B5A', lineHeight: 1.7, margin: 0 }}>
                {isTh && provider.description_th ? provider.description_th : provider.description}
              </p>
            </div>

            {/* Services — always shown */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                {isTh ? 'บริการที่ให้' : 'Services Offered'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', margin: '-3px' }}>
                {provider.services?.map(s => (
                  <span key={s} style={{ display: 'inline-flex', alignItems: 'center', background: '#F0F9F9', color: '#0F6F73', fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '999px', margin: '3px' }}>{s}</span>
                ))}
              </div>
            </div>

            {/* Profile view: Portfolio + Contact (hidden when viewing a project) */}
            {!selectedProject && (
              <>
                {portfolio.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                      {isTh ? 'ผลงานเด่น' : 'Portfolio Highlights'}
                    </div>
                    <PortfolioSection projects={portfolio} isTh={isTh} onSelectProject={openProject} />
                  </div>
                )}

                {/* Contact Information */}
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                    {isTh ? 'ข้อมูลติดต่อ' : 'Contact Information'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {provider.phone && (
                      <a href={`tel:${provider.phone.replace(/\s/g, '')}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', border: '1px solid #E4E7ED', borderRadius: '12px', textDecoration: 'none', color: '#171A21', transition: 'border-color 150ms, background 150ms' }}>
                        <span style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#F0F9F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#0F6F73' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.92 3.38C1.86 2.58 2.42 2 3.22 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.15 6.15l1.48-1.48a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        </span>
                        <div style={{ flex: 1 }}><div style={{ fontSize: '11px', fontWeight: 600, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Phone</div><div style={{ fontSize: '14px', fontWeight: 500, color: '#171A21', marginTop: '1px' }}>{provider.phone}</div></div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F6F73', flexShrink: 0 }}>{isTh ? 'โทร →' : 'Call →'}</span>
                      </a>
                    )}
                    {provider.email && (
                      <a href={`mailto:${provider.email}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', border: '1px solid #E4E7ED', borderRadius: '12px', textDecoration: 'none', color: '#171A21' }}>
                        <span style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#FFF1E0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#F77F00' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22 7 12 13 2 7"/></svg>
                        </span>
                        <div style={{ flex: 1 }}><div style={{ fontSize: '11px', fontWeight: 600, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</div><div style={{ fontSize: '14px', fontWeight: 500, color: '#171A21', marginTop: '1px' }}>{provider.email}</div></div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F6F73', flexShrink: 0 }}>{isTh ? 'อีเมล →' : 'Email →'}</span>
                      </a>
                    )}
                    {provider.website && (
                      <a href={provider.website.startsWith('http') ? provider.website : `https://${provider.website}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', border: '1px solid #E4E7ED', borderRadius: '12px', textDecoration: 'none', color: '#171A21' }}>
                        <span style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#F0F9F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#0F6F73' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        </span>
                        <div style={{ flex: 1 }}><div style={{ fontSize: '11px', fontWeight: 600, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Website</div><div style={{ fontSize: '14px', fontWeight: 500, color: '#171A21', marginTop: '1px' }}>{provider.website.replace(/^https?:\/\//, '')}</div></div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F6F73', flexShrink: 0 }}>{isTh ? 'เยี่ยมชม →' : 'Visit →'}</span>
                      </a>
                    )}
                    {provider.line_id && (
                      <a href={`https://line.me/R/ti/p/${encodeURIComponent(provider.line_id)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', border: '1px solid #E4E7ED', borderRadius: '12px', textDecoration: 'none', color: '#171A21' }}>
                        <span style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#06C755', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M19.365 9.89c.50 0 .866.37.866.87s-.368.87-.866.87H17.61v1.05h1.754c.498 0 .866.37.866.87s-.368.87-.866.87H16.74a.87.87 0 0 1-.866-.87V8.14c0-.498.368-.868.866-.868h2.624c.498 0 .866.37.866.87s-.368.87-.866.87H17.61v.878h1.754zm-6.735 3.65a.868.868 0 0 1-.607-.247l-2.627-2.78v2.16a.866.866 0 1 1-1.732 0V8.14a.866.866 0 0 1 1.474-.618l2.627 2.78V8.14a.866.866 0 1 1 1.732 0v5.4a.868.868 0 0 1-.866.868v.002zm-5.74 0a.866.866 0 0 1-.866-.868V8.14a.866.866 0 1 1 1.732 0v5.4a.866.866 0 0 1-.866.868v-.002zM24 10.314C24 4.943 18.617.572 12 .572S0 4.943 0 10.314c0 4.814 4.27 8.842 10.035 9.608.392.084.923.258 1.058.592.12.302.079.776.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.07 9.436-6.966C23.176 14.143 24 12.33 24 10.314z"/></svg>
                        </span>
                        <div style={{ flex: 1 }}><div style={{ fontSize: '11px', fontWeight: 600, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.04em' }}>LINE Official</div><div style={{ fontSize: '14px', fontWeight: 500, color: '#171A21', marginTop: '1px' }}>{provider.line_id}</div></div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F6F73', flexShrink: 0 }}>{isTh ? 'เพิ่ม →' : 'Add →'}</span>
                      </a>
                    )}
                  </div>

                  {/* Socials */}
                  {(provider.social_facebook || provider.social_instagram) && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                      {provider.social_facebook && (
                        <a href={`https://${provider.social_facebook}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '8px 12px', borderRadius: '10px', background: '#F4F8F8', color: '#444B5A', textDecoration: 'none', fontSize: '12px', fontWeight: 600, transition: 'background 150ms, color 150ms' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12a10 10 0 1 0-11.6 9.9V15h-2.5v-3h2.5V9.8c0-2.5 1.5-3.8 3.8-3.8 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.5 3h-2.4v6.9A10 10 0 0 0 24 12z"/></svg>
                          Facebook
                        </a>
                      )}
                      {provider.social_instagram && (
                        <a href={`https://${provider.social_instagram}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '8px 12px', borderRadius: '10px', background: '#F4F8F8', color: '#444B5A', textDecoration: 'none', fontSize: '12px', fontWeight: 600 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C13584" strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                          Instagram
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Project detail view (replaces portfolio + contact) */}
            {selectedProject && (
              <ProjectDetail
                project={selectedProject}
                isTh={isTh}
                onBack={backToProfile}
                phone={provider.phone ?? null}
                email={provider.email ?? null}
                providerName={displayName}
              />
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes profileSlideIn {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
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
      <div style={{ background: 'linear-gradient(140deg, #0E1017 0%, #0F6F73 100%)', padding: '32px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 80% at 80% 50%, rgba(43,190,197,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '540px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 26px)', fontWeight: 700, color: 'white', marginBottom: '4px', letterSpacing: '-0.03em' }}>
            {isTh ? 'ค้นหาผู้ให้บริการ' : 'Find Service Providers'}
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '18px' }}>
            {isTh ? 'ค้นหาผู้ให้บริการ B2B ที่ผ่านการตรวจสอบทั่วไทย — ไม่ต้องสมัครสมาชิก' : 'Browse verified Thai B2B service providers — no account needed'}
          </p>
          <SearchCard lang={lang} />
        </div>
      </div>

      {/* Results area */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 24px 60px' }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '13px', color: '#9AA0AE' }}>
            {isTh ? 'แสดง' : 'Showing'} <strong style={{ color: '#171A21' }}>{filtered.length}</strong> {isTh ? 'ผู้ให้บริการ' : `provider${filtered.length !== 1 ? 's' : ''}`}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              style={{ padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: `1.5px solid ${verifiedOnly ? '#0F6F73' : '#E4E7ED'}`, background: verifiedOnly ? '#F0F9F9' : 'white', color: verifiedOnly ? '#0F6F73' : '#6B7385' }}
            >
              ✓ {isTh ? 'ยืนยันแล้ว' : 'Verified'}
            </button>
            <select value={sort} onChange={e => setSort(e.target.value as SortKey)} style={{ fontSize: '13px', color: '#444B5A', border: '1px solid #E4E7ED', borderRadius: '8px', padding: '7px 12px', background: 'white', fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
              <option value="relevance">{isTh ? 'เรียง: ความเกี่ยวข้อง' : 'Sort: Relevance'}</option>
              <option value="views">{isTh ? 'เรียง: ยอดเข้าชม' : 'Sort: Most viewed'}</option>
              <option value="az">{isTh ? 'เรียง: A–Z' : 'Sort: A–Z'}</option>
            </select>
          </div>
        </div>

        {/* Province filter chips */}
        {provinces.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
            {provinces.map(p => (
              <button key={p} onClick={() => setSelectedProvince(selectedProvince === p ? '' : p)} style={{ fontSize: '12px', padding: '5px 10px', borderRadius: '999px', border: '1px solid #E4E7ED', background: selectedProvince === p ? '#0F6F73' : 'white', color: selectedProvince === p ? 'white' : '#4A5060', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms' }}>
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Provider grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: 'linear-gradient(135deg, #F0F9F9, #E6F4F4)', borderRadius: '16px', border: '1px dashed rgba(15,111,115,0.25)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div style={{ fontWeight: 700, fontSize: '17px', color: '#171A21', marginBottom: '6px' }}>
              {isTh ? 'ไม่พบผู้ให้บริการที่ตรงกัน — ให้ผู้ให้บริการมาหาคุณ' : 'No exact match — let providers come to you'}
            </div>
            <p style={{ fontSize: '13px', color: '#6B7385', lineHeight: 1.6, maxWidth: '440px', margin: '0 auto 18px' }}>
              {isTh ? 'ประกาศคำขอและผู้ให้บริการที่ตรงกันทุกรายจะได้รับแจ้งผ่าน LINE ทันที ' : 'Broadcast your request and every matching service provider on Profindle gets pinged on LINE instantly. '}
              <strong style={{ color: '#F77F00' }}>{isTh ? 'ฟรี 100%' : '100% free'}</strong>
              {isTh ? ' — ไม่มีค่าคอมมิชชั่น' : ' — no commission, no hidden fees.'}
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
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '18px', flexShrink: 0 }}>
                      {initial}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#171A21' }}>{name}</div>
                        {p.verified && <span style={{ background: '#171A21', color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '999px' }}>{isTh ? 'ยืนยันแล้ว' : 'Verified'}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#9AA0AE', marginTop: '2px' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {p.province}
                      </div>
                    </div>
                    {p.premium && <span style={{ background: 'linear-gradient(135deg, #F77F00, #E06B00)', color: 'white', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '999px', flexShrink: 0 }}>✦ Pro</span>}
                  </div>

                  <p style={{ fontSize: '13px', color: '#6B7385', lineHeight: 1.6, marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {desc}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                    {p.services.slice(0, 3).map((s, i) => (
                      <span key={s} style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: i === 0 ? '#F0F9F9' : 'transparent', color: i === 0 ? '#0F6F73' : '#6B7385', border: i === 0 ? '1px solid transparent' : '1px solid #E4E7ED' }}>{s}</span>
                    ))}
                  </div>

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

        {/* Signup banner */}
        <div style={{ background: 'linear-gradient(135deg, #171A21, #0F6F73)', borderRadius: '20px', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', marginTop: '28px', flexWrap: 'wrap' }}>
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
          <div style={{ display: 'flex', gap: '10px', flexShrink: 0, flexWrap: 'wrap' }}>
            <Link href={`/${lang}/signup`} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #F77F00, #E06B00)', color: 'white', fontWeight: 700, fontSize: '13px', borderRadius: '10px', textDecoration: 'none' }}>
              {isTh ? 'สร้างบัญชีฟรี' : 'Create Free Account'}
            </Link>
            <Link href={`/${lang}/login`} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.10)', color: 'white', fontWeight: 600, fontSize: '13px', borderRadius: '10px', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.2)' }}>
              {isTh ? 'เข้าสู่ระบบ' : 'Sign In'}
            </Link>
          </div>
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
