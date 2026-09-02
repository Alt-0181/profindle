'use client';

import React, { useState, useEffect } from 'react';
import { SERVICES, ALL_INDUSTRIES } from '@/lib/services';

// Open a company's DBD document in a new tab via a super-admin signed URL. The
// stored value is a private-bucket path, not a usable URL, so it must be signed.
async function openAdminDoc(path: string | null | undefined) {
  if (!path) return;
  try {
    const res = await fetch(`/api/admin/dbd-url?path=${encodeURIComponent(path)}`);
    const { signedUrl } = await res.json();
    if (signedUrl) window.open(signedUrl, '_blank', 'noopener,noreferrer');
    else alert('Could not open document.');
  } catch {
    alert('Could not open document.');
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  name_th: string | null;
  industry: string | null;
  verified: boolean;
  premium: boolean;
  created_at: string;
  dbd_certificate_url: string | null;
  services: string[];
  email: string | null;
  user_id: string | null;
  user_email: string | null;
  user_meta?: { role?: string; display_name?: string; full_name?: string; created_at?: string } | null;
  line_user_id?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  province?: string | null;
  team_size?: string | null;
  founded_year?: number | null;
  description?: string | null;
}

export interface AuthUser {
  id: string;
  email?: string;
  created_at: string;
  user_metadata?: { role?: string; display_name?: string; full_name?: string };
}

export interface Broadcast {
  id: string;
  created_at: string;
  status: string;
  category: string;
  budget_band: string | null;
  timeline: string | null;
  buyer_company_name: string | null;
  match_count: number;
}

export interface EarlyBirdClaim {
  id: string;
  company_name: string | null;
  user_email: string | null;
  status: 'pending' | 'granted' | 'dismissed';
  created_at: string;
  resolved_at: string | null;
}

interface Template {
  id: string;
  name: string;
  content: string;
  updated_at: string | null;
}

interface PlatformService {
  id: string;
  label: string;
  industry: string;
  created_at: string;
}

interface Props {
  companies: Company[];
  users: AuthUser[];
  broadcasts: Broadcast[];
  earlyBirdClaims: EarlyBirdClaim[];
  lang: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const card = {
  background: 'white',
  borderRadius: '16px',
  border: '1px solid rgba(15,111,115,0.10)',
  overflow: 'hidden' as const,
};

const thStyle = {
  textAlign: 'left' as const,
  padding: '10px 16px',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  color: '#9AA0AE',
};

const tdStyle = { padding: '14px 16px' };

const primaryBtn = {
  padding: '7px 16px',
  borderRadius: '8px',
  background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)',
  color: 'white',
  fontSize: '12px',
  fontWeight: 700,
  border: 'none',
  cursor: 'pointer' as const,
  fontFamily: 'inherit',
};

const dangerBtn = {
  padding: '5px 12px',
  borderRadius: '8px',
  background: '#FFF0F0',
  color: '#C0392B',
  fontSize: '11px',
  fontWeight: 700,
  border: '1px solid rgba(192,57,43,0.2)',
  cursor: 'pointer' as const,
  fontFamily: 'inherit',
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, warn }: { label: string; value: number | string; warn?: boolean }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '14px',
      border: `1px solid ${warn ? 'rgba(247,127,0,0.3)' : 'rgba(15,111,115,0.10)'}`,
      padding: '20px',
    }}>
      <div style={{ fontSize: '32px', fontWeight: 700, color: warn ? '#E06B00' : '#171A21' }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#9AA0AE', marginTop: '4px' }}>{label}</div>
    </div>
  );
}

// ─── Company Detail Panel ─────────────────────────────────────────────────────

function CompanyDetailPanel({ company, onClose, onUpdate, onDelete }: {
  company: Company;
  onClose: () => void;
  onUpdate: (updated: Partial<Company>) => void;
  onDelete: () => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [lineUidInput, setLineUidInput] = useState(company.line_user_id ?? '');
  const [editingLine, setEditingLine] = useState(false);
  const [lineError, setLineError] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(company.name ?? '');
  const [nameThInput, setNameThInput] = useState(company.name_th ?? '');

  const startEditName = () => {
    setNameInput(company.name ?? '');
    setNameThInput(company.name_th ?? '');
    setEditingName(true);
  };

  const saveName = async () => {
    const name = nameInput.trim();
    if (!name) return;
    const nameTh = nameThInput.trim() || name;
    setLoading('rename');
    try {
      const res = await fetch('/api/admin/companies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id, action: 'rename', name, name_th: nameTh }),
      });
      if (!res.ok) throw new Error('Failed');
      onUpdate({ name, name_th: nameTh } as Partial<Company>);
      setEditingName(false);
    } catch {
      alert('Failed to rename. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const toggle = async (field: 'verified' | 'premium', current: boolean) => {
    setLoading(field);
    try {
      const res = await fetch('/api/admin/companies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id, field, value: !current }),
      });
      if (!res.ok) throw new Error('Failed');
      onUpdate({ [field]: !current });
    } catch {
      alert('Failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const saveLineUid = async () => {
    setLoading('line');
    setLineError('');
    try {
      const val = lineUidInput.trim() || null;
      const res = await fetch('/api/admin/companies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id, field: 'line_user_id', value: val }),
      });
      if (!res.ok) throw new Error('Failed');
      onUpdate({ line_user_id: val });
      setEditingLine(false);
    } catch {
      setLineError('Failed to save. Try again.');
    } finally {
      setLoading(null);
    }
  };

  const roleBadge = (role?: string) => {
    if (role === 'super_admin') return { bg: '#F0F0FF', color: '#5B4EBB', label: 'Super Admin' };
    if (role === 'admin') return { bg: '#E8F5E9', color: '#2E7D32', label: 'Admin' };
    return { bg: '#F4F5F7', color: '#9AA0AE', label: 'User' };
  };

  const role = company.user_meta?.role;
  const badge = roleBadge(role);
  const displayName = company.user_meta?.display_name || company.user_meta?.full_name || '—';

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 100, backdropFilter: 'blur(2px)' }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '480px', maxWidth: '100vw',
        background: 'white', zIndex: 101, overflowY: 'auto',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid #F4F5F7', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              {editingName ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#9AA0AE', marginBottom: '2px' }}>NAME (EN / PRIMARY)</div>
                    <input value={nameInput} onChange={e => setNameInput(e.target.value)} autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                      style={{ width: '100%', fontSize: '15px', fontWeight: 700, padding: '6px 10px', border: '1.5px solid #0F6F73', borderRadius: '8px', outline: 'none', fontFamily: 'inherit', color: '#171A21', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#9AA0AE', marginBottom: '2px' }}>ชื่อ (ไทย)</div>
                    <input value={nameThInput} onChange={e => setNameThInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                      placeholder="เว้นว่างเพื่อใช้ชื่อเดียวกับ EN"
                      style={{ width: '100%', fontSize: '14px', padding: '6px 10px', border: '1.5px solid #E4E7ED', borderRadius: '8px', outline: 'none', fontFamily: 'inherit', color: '#171A21', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                    <button onClick={saveName} disabled={loading === 'rename'} style={{ ...primaryBtn, fontSize: '11px', padding: '6px 14px', opacity: loading === 'rename' ? 0.6 : 1 }}>{loading === 'rename' ? '…' : 'Save'}</button>
                    <button onClick={() => setEditingName(false)} style={{ ...dangerBtn, padding: '6px 12px' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#171A21' }}>{company.name}</div>
                  <button onClick={startEditName} title="Edit name" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9AA0AE', fontSize: '14px', padding: 0, fontFamily: 'inherit' }}>✎</button>
                </div>
              )}
              {!editingName && company.name_th && company.name_th !== company.name && <div style={{ fontSize: '12px', color: '#9AA0AE', marginTop: '2px' }}>{company.name_th}</div>}
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                {company.verified && <span style={{ fontSize: '11px', background: '#ECFDF5', color: '#059669', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>✓ Verified</span>}
                {company.premium && <span style={{ fontSize: '11px', background: '#FFF8EE', color: '#E06B00', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>⭐ Premium</span>}
                {company.industry && <span style={{ fontSize: '11px', background: '#F0F9F9', color: '#0F6F73', padding: '2px 8px', borderRadius: '999px', fontWeight: 500 }}>{company.industry}</span>}
              </div>
            </div>
            <button onClick={onClose} style={{ background: '#F4F5F7', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px', color: '#6B7385', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', flexShrink: 0 }}>×</button>
          </div>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Account */}
          <section>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9AA0AE', marginBottom: '10px' }}>Account</div>
            <div style={{ background: '#F4F5F7', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Row label="Email" value={company.user_email || '—'} mono />
              <Row label="Display Name" value={displayName} />
              <Row label="Role" value={<span style={{ background: badge.bg, color: badge.color, fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>{badge.label}</span>} />
              <Row label="Joined" value={company.user_meta?.created_at ? fmt(company.user_meta.created_at) : fmt(company.created_at)} />
              {company.user_id && <Row label="User ID" value={company.user_id.slice(0, 16) + '…'} mono />}
            </div>
          </section>

          {/* Company */}
          <section>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9AA0AE', marginBottom: '10px' }}>Company</div>
            <div style={{ background: '#F4F5F7', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {company.description && <Row label="About" value={company.description} />}
              {company.founded_year && <Row label="Founded" value={String(company.founded_year)} />}
              {company.team_size && <Row label="Team Size" value={company.team_size} />}
              {company.province && <Row label="Province" value={company.province} />}
              <Row label="Company Added" value={fmt(company.created_at)} />
              {company.dbd_certificate_url
                ? <Row label="DBD Document" value={<button onClick={() => openAdminDoc(company.dbd_certificate_url)} style={{ color: '#0F6F73', fontWeight: 600, textDecoration: 'none', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>View →</button>} />
                : <Row label="DBD Document" value="Not uploaded" />}
            </div>
          </section>

          {/* Contact */}
          <section>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9AA0AE', marginBottom: '10px' }}>Contact</div>
            <div style={{ background: '#F4F5F7', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Row label="Email" value={company.email || '—'} />
              <Row label="Phone" value={company.phone || '—'} />
              <Row label="Website" value={company.website ? <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ color: '#0F6F73', textDecoration: 'none', fontSize: '12px' }}>{company.website}</a> : '—'} />
              <Row label="Address" value={company.address || '—'} />
            </div>
          </section>

          {/* LINE */}
          <section>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9AA0AE', marginBottom: '10px' }}>LINE</div>
            <div style={{ background: '#F4F5F7', borderRadius: '12px', padding: '16px' }}>
              {editingLine ? (
                <div>
                  <div style={{ fontSize: '12px', color: '#444B5A', marginBottom: '8px' }}>Enter LINE User ID (starts with U…)</div>
                  <input
                    value={lineUidInput}
                    onChange={e => setLineUidInput(e.target.value)}
                    placeholder="Uc669f3dea99d8bde…"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid rgba(15,111,115,0.3)', fontSize: '12px', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' as const, marginBottom: '8px' }}
                  />
                  {lineError && <div style={{ fontSize: '11px', color: '#C0392B', marginBottom: '8px' }}>{lineError}</div>}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={saveLineUid} disabled={loading === 'line'} style={{ ...primaryBtn, flex: 1, opacity: loading === 'line' ? 0.6 : 1 }}>
                      {loading === 'line' ? 'Saving…' : 'Save UID'}
                    </button>
                    <button onClick={() => { setEditingLine(false); setLineUidInput(company.line_user_id ?? ''); setLineError(''); }} style={{ ...dangerBtn, flex: 0 }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    {company.line_user_id
                      ? <><div style={{ fontSize: '12px', fontWeight: 600, color: '#059669', marginBottom: '2px' }}>✓ Connected</div><code style={{ fontSize: '11px', color: '#6B7385', fontFamily: 'monospace' }}>{company.line_user_id.slice(0, 20)}…</code></>
                      : <div style={{ fontSize: '12px', color: '#9AA0AE' }}>Not connected</div>}
                  </div>
                  <button onClick={() => setEditingLine(true)} style={{ ...primaryBtn, fontSize: '11px', padding: '5px 12px' }}>
                    {company.line_user_id ? 'Change UID' : 'Set UID'}
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Services */}
          {company.services?.length > 0 && (
            <section>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9AA0AE', marginBottom: '10px' }}>Services ({company.services.length})</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {company.services.map(s => (
                  <span key={s} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '999px', background: '#F0F9F9', color: '#0F6F73', fontWeight: 500 }}>{s}</span>
                ))}
              </div>
            </section>
          )}

          {/* Actions */}
          <section>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9AA0AE', marginBottom: '10px' }}>Actions</div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => toggle('verified', company.verified)}
                disabled={loading === 'verified'}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  background: company.verified ? '#ECFDF5' : 'linear-gradient(135deg,#0F6F73,#1A9DA3)',
                  color: company.verified ? '#059669' : 'white',
                  opacity: loading === 'verified' ? 0.6 : 1,
                }}
              >
                {loading === 'verified' ? '…' : company.verified ? '✓ Verified' : 'Mark Verified'}
              </button>
              <button
                onClick={() => toggle('premium', company.premium)}
                disabled={loading === 'premium'}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  background: company.premium ? '#FFF8EE' : '#F4F5F7',
                  color: company.premium ? '#E06B00' : '#6B7385',
                  opacity: loading === 'premium' ? 0.6 : 1,
                }}
              >
                {loading === 'premium' ? '…' : company.premium ? '⭐ Premium' : 'Set Premium'}
              </button>
            </div>
            {company.user_id && (
              <button
                disabled={loading === 'unclaim'}
                style={{ width: '100%', marginTop: '10px', padding: '10px', fontSize: '13px', fontWeight: 700, borderRadius: '10px', border: '1.5px solid rgba(15,111,115,0.3)', background: 'white', color: '#0F6F73', cursor: 'pointer', fontFamily: 'inherit', opacity: loading === 'unclaim' ? 0.6 : 1 }}
                onClick={async () => {
                  if (!confirm(`Release the claim on "${company.name}"?\n\nThe listing stays (reverts to unclaimed); the owner link, contact details, uploaded docs/logo and portfolio are removed. Use this instead of deleting.`)) return;
                  setLoading('unclaim');
                  try {
                    const res = await fetch('/api/admin/companies', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ companyId: company.id, action: 'unclaim' }),
                    });
                    if (!res.ok) throw new Error('Failed');
                    onUpdate({ user_id: null, verified: false, premium: false } as Partial<Company>);
                    onClose();
                  } catch {
                    alert('Failed to release claim. Please try again.');
                    setLoading(null);
                  }
                }}
              >
                {loading === 'unclaim' ? '…' : 'Release claim (revert to unclaimed)'}
              </button>
            )}
            <button
              disabled={loading === 'delete'}
              style={{ ...dangerBtn, width: '100%', marginTop: '10px', padding: '10px', fontSize: '13px', opacity: loading === 'delete' ? 0.6 : 1 }}
              onClick={async () => {
                if (!confirm(`Delete company "${company.name}"? This cannot be undone.`)) return;
                setLoading('delete');
                try {
                  const res = await fetch('/api/admin/companies', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ companyId: company.id }),
                  });
                  if (!res.ok) throw new Error('Failed');
                  onDelete();
                  onClose();
                } catch {
                  alert('Failed to delete company. Please try again.');
                  setLoading(null);
                }
              }}
            >
              {loading === 'delete' ? '…' : 'Delete Company'}
            </button>
          </section>
        </div>
      </div>
    </>
  );
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '8px', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '11px', fontWeight: 600, color: '#9AA0AE', paddingTop: '1px' }}>{label}</span>
      <span style={{ fontSize: '13px', color: '#171A21', fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}

// ─── Tab 1: Companies ─────────────────────────────────────────────────────────

function CompaniesTab({ companies: initial }: { companies: Company[] }) {
  const [companies, setCompanies] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);
  const [selected, setSelected] = useState<Company | null>(null);

  const toggle = async (companyId: string, field: 'verified' | 'premium', current: boolean) => {
    const key = `${companyId}-${field}`;
    setLoading(key);
    try {
      const res = await fetch('/api/admin/companies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, field, value: !current }),
      });
      if (!res.ok) throw new Error('Failed');
      setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, [field]: !current } : c));
    } catch {
      alert('Action failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleUpdate = (companyId: string, updates: Partial<Company>) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, ...updates } : c));
    setSelected(prev => prev?.id === companyId ? { ...prev, ...updates } : prev);
  };

  const pending = companies.filter(c => !c.verified && c.dbd_certificate_url);
  const verified = companies.filter(c => c.verified);
  const premium = companies.filter(c => c.premium);

  return (
    <div>
      {selected && (
        <CompanyDetailPanel
          company={selected}
          onClose={() => setSelected(null)}
          onUpdate={(updates) => handleUpdate(selected.id, updates)}
          onDelete={() => setCompanies(prev => prev.filter(c => c.id !== selected.id))}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <KpiCard label="Total Companies" value={companies.length} />
        <KpiCard label="Verified" value={verified.length} />
        <KpiCard label="Pending Review" value={pending.length} warn={pending.length > 0} />
        <KpiCard label="Premium" value={premium.length} />
      </div>

      {pending.length > 0 && (
        <div style={{ ...card, border: '1.5px solid rgba(247,127,0,0.3)', marginBottom: '20px' }}>
          <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg,#FFFBF5,#FFF8EE)', borderBottom: '1px solid rgba(247,127,0,0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#171A21' }}>Verification Queue</span>
            <span style={{ background: '#FFF6EC', color: '#E06B00', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>{pending.length} pending</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
            <thead>
              <tr style={{ background: '#F4F5F7' }}>
                {['Company', 'Email', 'Document', 'Joined', 'Actions'].map(col => (
                  <th key={col} style={thStyle}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pending.map((c, i) => (
                <tr key={c.id} style={{ borderTop: i > 0 ? '1px solid #F4F5F7' : undefined }}>
                  <td style={tdStyle}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#171A21' }}>{c.name}</div>
                    {c.name_th && <div style={{ fontSize: '11px', color: '#9AA0AE' }}>{c.name_th}</div>}
                  </td>
                  <td style={{ ...tdStyle, fontSize: '13px', color: '#444B5A' }}>{c.user_email || '—'}</td>
                  <td style={tdStyle}>
                    {c.dbd_certificate_url
                      ? <button onClick={() => openAdminDoc(c.dbd_certificate_url)} style={{ fontSize: '12px', color: '#0F6F73', fontWeight: 600, textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>View document →</button>
                      : <span style={{ fontSize: '12px', color: '#9AA0AE' }}>No document</span>}
                  </td>
                  <td style={{ ...tdStyle, fontSize: '12px', color: '#9AA0AE' }}>{fmt(c.created_at)}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => toggle(c.id, 'verified', false)}
                      disabled={loading === `${c.id}-verified`}
                      style={{ ...primaryBtn, opacity: loading === `${c.id}-verified` ? 0.6 : 1 }}
                    >
                      {loading === `${c.id}-verified` ? '…' : '✓ Verify'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <div style={card}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F4F5F7' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#171A21' }}>All Companies</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ background: '#F4F5F7' }}>
              {['Company', 'Services', 'Verified', 'Premium', 'LINE', 'Joined'].map(col => (
                <th key={col} style={thStyle}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {companies.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#9AA0AE', fontSize: '14px' }}>No companies yet</td></tr>
            ) : companies.map((c, i) => (
              <tr
                key={c.id}
                onClick={() => setSelected(c)}
                style={{ borderTop: i > 0 ? '1px solid #F4F5F7' : undefined, cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F8FFFE')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                <td style={tdStyle}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#171A21' }}>{c.name}</div>
                  {c.user_email && <div style={{ fontSize: '11px', color: '#9AA0AE' }}>{c.user_email}</div>}
                </td>
                <td style={{ ...tdStyle, maxWidth: '200px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(c.services || []).slice(0, 3).map(s => (
                      <span key={s} style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '999px', background: '#F0F9F9', color: '#0F6F73', fontWeight: 500 }}>{s}</span>
                    ))}
                    {(c.services || []).length > 3 && (
                      <span style={{ fontSize: '10px', color: '#9AA0AE' }}>+{c.services.length - 3}</span>
                    )}
                  </div>
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={e => { e.stopPropagation(); toggle(c.id, 'verified', c.verified); }}
                    disabled={loading === `${c.id}-verified`}
                    style={{
                      padding: '5px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      background: c.verified ? '#ECFDF5' : '#F4F5F7',
                      color: c.verified ? '#059669' : '#9AA0AE',
                      opacity: loading === `${c.id}-verified` ? 0.6 : 1,
                    }}
                  >
                    {loading === `${c.id}-verified` ? '…' : c.verified ? '✓ Verified' : 'Unverified'}
                  </button>
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={e => { e.stopPropagation(); toggle(c.id, 'premium', c.premium); }}
                    disabled={loading === `${c.id}-premium`}
                    style={{
                      padding: '5px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      background: c.premium ? '#FFF8EE' : '#F4F5F7',
                      color: c.premium ? '#E06B00' : '#9AA0AE',
                      opacity: loading === `${c.id}-premium` ? 0.6 : 1,
                    }}
                  >
                    {loading === `${c.id}-premium` ? '…' : c.premium ? '⭐ Premium' : 'Free'}
                  </button>
                </td>
                <td style={tdStyle}>
                  {c.line_user_id
                    ? <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>✓ LINE</span>
                    : <span style={{ fontSize: '11px', color: '#9AA0AE' }}>—</span>}
                </td>
                <td style={{ ...tdStyle, fontSize: '12px', color: '#9AA0AE' }}>{fmt(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 2: Users ─────────────────────────────────────────────────────────────

function UsersTab({ users: initial }: { users: AuthUser[] }) {
  const [users, setUsers] = useState(initial);
  const [deleting, setDeleting] = useState<string | null>(null);

  const roleBadge = (role?: string) => {
    if (role === 'super_admin') return { bg: '#F0F0FF', color: '#5B4EBB', label: 'Super Admin' };
    if (role === 'admin') return { bg: '#E8F5E9', color: '#2E7D32', label: 'Admin' };
    return { bg: '#F4F5F7', color: '#9AA0AE', label: 'User' };
  };

  const deleteUser = async (userId: string, email?: string) => {
    if (!confirm(`Delete user ${email ?? userId}? This cannot be undone.`)) return;
    setDeleting(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const json = await res.json();
        alert(json.error || 'Failed to delete user');
        return;
      }
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch {
      alert('Failed to delete user. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <KpiCard label="Total Users" value={users.length} />
        <KpiCard label="Super Admins" value={users.filter(u => u.user_metadata?.role === 'super_admin').length} />
        <KpiCard label="Regular Users" value={users.filter(u => !u.user_metadata?.role || u.user_metadata.role === 'user').length} />
      </div>

      <div style={card}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F4F5F7' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#171A21' }}>All Users</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
          <thead>
            <tr style={{ background: '#F4F5F7' }}>
              {['Email', 'Display Name', 'Role', 'Joined', 'Actions'].map(col => (
                <th key={col} style={thStyle}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#9AA0AE', fontSize: '14px' }}>No users yet</td></tr>
            ) : users.map((u, i) => {
              const badge = roleBadge(u.user_metadata?.role);
              const displayName = u.user_metadata?.display_name || u.user_metadata?.full_name || '—';
              const isSuperAdmin = u.user_metadata?.role === 'super_admin';
              return (
                <tr key={u.id} style={{ borderTop: i > 0 ? '1px solid #F4F5F7' : undefined }}>
                  <td style={tdStyle}>
                    <div style={{ fontSize: '13px', color: '#171A21', fontWeight: 500 }}>{u.email || '—'}</div>
                    <div style={{ fontSize: '10px', color: '#9AA0AE', fontFamily: 'monospace' }}>{u.id.slice(0, 8)}…</div>
                  </td>
                  <td style={{ ...tdStyle, fontSize: '13px', color: '#444B5A' }}>{displayName}</td>
                  <td style={tdStyle}>
                    <span style={{ background: badge.bg, color: badge.color, fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>{badge.label}</span>
                  </td>
                  <td style={{ ...tdStyle, fontSize: '12px', color: '#9AA0AE' }}>{fmt(u.created_at)}</td>
                  <td style={tdStyle}>
                    {isSuperAdmin ? (
                      <span style={{ fontSize: '11px', color: '#C8CDD7' }}>Protected</span>
                    ) : (
                      <button
                        onClick={() => deleteUser(u.id, u.email)}
                        disabled={deleting === u.id}
                        style={{ ...dangerBtn, opacity: deleting === u.id ? 0.6 : 1 }}
                      >
                        {deleting === u.id ? '…' : 'Delete'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Early Bird Requests ─────────────────────────────────────────────────

function EarlyBirdTab({ claims: initial }: { claims: EarlyBirdClaim[] }) {
  const [claims, setClaims] = useState(initial);
  const [processing, setProcessing] = useState<string | null>(null);
  const [confirmClaim, setConfirmClaim] = useState<EarlyBirdClaim | null>(null);

  const statusBadge = (status: EarlyBirdClaim['status']) => {
    if (status === 'granted') return { bg: '#E8F5E9', color: '#2E7D32', label: 'Granted' };
    if (status === 'dismissed') return { bg: '#F4F5F7', color: '#9AA0AE', label: 'Dismissed' };
    return { bg: '#FFF3E0', color: '#E06B00', label: 'Pending' };
  };

  const act = async (claimId: string, action: 'grant' | 'dismiss') => {
    setProcessing(claimId);
    try {
      const res = await fetch('/api/admin/early-bird', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId, action }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json.error || 'Action failed. Please try again.');
        return;
      }
      setClaims(prev => prev.map(c => c.id === claimId
        ? { ...c, status: action === 'grant' ? 'granted' : 'dismissed', resolved_at: new Date().toISOString() }
        : c));
    } catch {
      alert('Action failed. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  // Pending first, then most recently resolved.
  const sorted = [...claims].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const pending = claims.filter(c => c.status === 'pending').length;
  const granted = claims.filter(c => c.status === 'granted').length;

  const grantBtn: React.CSSProperties = {
    padding: '6px 14px', borderRadius: '8px', background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)',
    color: 'white', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
  };
  const dismissBtn: React.CSSProperties = {
    padding: '6px 12px', borderRadius: '8px', background: '#F4F5F7',
    color: '#6B7385', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <KpiCard label="Pending Requests" value={pending} warn={pending > 0} />
        <KpiCard label="Granted" value={granted} />
        <KpiCard label="Total Requests" value={claims.length} />
      </div>

      <div style={card}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F4F5F7' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#171A21' }}>Early Bird Requests</span>
          <span style={{ fontSize: '12px', color: '#9AA0AE', marginLeft: '8px' }}>Companies that clicked “Claim Early Bird”. Grant to unlock Premium.</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
          <thead>
            <tr style={{ background: '#F4F5F7' }}>
              {['Company', 'Email', 'Requested', 'Status', 'Actions'].map(col => (
                <th key={col} style={thStyle}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#9AA0AE', fontSize: '14px' }}>No Early Bird requests yet</td></tr>
            ) : sorted.map((c, i) => {
              const badge = statusBadge(c.status);
              return (
                <tr key={c.id} style={{ borderTop: i > 0 ? '1px solid #F4F5F7' : undefined }}>
                  <td style={{ ...tdStyle, fontSize: '13px', color: '#171A21', fontWeight: 600 }}>{c.company_name || '—'}</td>
                  <td style={{ ...tdStyle, fontSize: '13px', color: '#444B5A' }}>{c.user_email || '—'}</td>
                  <td style={{ ...tdStyle, fontSize: '12px', color: '#9AA0AE' }}>{fmt(c.created_at)}</td>
                  <td style={tdStyle}>
                    <span style={{ background: badge.bg, color: badge.color, fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>{badge.label}</span>
                  </td>
                  <td style={tdStyle}>
                    {c.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setConfirmClaim(c)} disabled={processing === c.id} style={{ ...grantBtn, opacity: processing === c.id ? 0.6 : 1 }}>
                          {processing === c.id ? '…' : 'Grant Premium'}
                        </button>
                        <button onClick={() => act(c.id, 'dismiss')} disabled={processing === c.id} style={{ ...dismissBtn, opacity: processing === c.id ? 0.6 : 1 }}>
                          Dismiss
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#C8CDD7' }}>{c.resolved_at ? fmt(c.resolved_at) : '—'}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {/* Grant confirmation modal */}
      {confirmClaim && (
        <div
          onClick={() => setConfirmClaim(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(23,26,33,0.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'white', borderRadius: '20px', maxWidth: '420px', width: '100%', padding: '28px', boxShadow: '0 20px 60px rgba(23,26,33,0.35)', textAlign: 'center' }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg,#FFF3E0,#FFE0B2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span style={{ fontSize: '28px' }}>⭐</span>
            </div>
            <div style={{ fontSize: '19px', fontWeight: 700, color: '#171A21', marginBottom: '8px' }}>Grant Premium?</div>
            <p style={{ fontSize: '14px', color: '#6B7385', lineHeight: 1.55, margin: '0 0 4px' }}>
              This upgrades <strong style={{ color: '#171A21' }}>{confirmClaim.company_name || 'this company'}</strong> to the Premium plan immediately, unlocking all Premium features (including LINE alerts).
            </p>
            <p style={{ fontSize: '12.5px', color: '#9AA0AE', margin: '8px 0 24px' }}>{confirmClaim.user_email}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setConfirmClaim(null)}
                style={{ flex: 1, padding: '11px', borderRadius: '12px', background: '#F4F5F7', color: '#444B5A', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { const id = confirmClaim.id; setConfirmClaim(null); act(id, 'grant'); }}
                style={{ flex: 1, padding: '11px', borderRadius: '12px', background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)', color: 'white', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Grant Premium
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 3: Industries & Services ────────────────────────────────────────────

function ServicesTab() {
  const [services, setServices] = useState<PlatformService[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newIndustry, setNewIndustry] = useState(ALL_INDUSTRIES[0]);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/services');
      const json = await res.json();
      const fetched: PlatformService[] = json.services ?? [];

      if (fetched.length === 0) {
        // Seed from hardcoded list
        setSeeding(true);
        await Promise.all(
          SERVICES.map(s =>
            fetch('/api/admin/services', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(s),
            })
          )
        );
        setSeeding(false);
        const res2 = await fetch('/api/admin/services');
        const json2 = await res2.json();
        setServices(json2.services ?? []);
      } else {
        setServices(fetched);
      }
    } catch {
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addService = async () => {
    if (!newLabel.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newLabel.trim(), industry: newIndustry }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed');
      }
      const json = await res.json();
      setServices(prev => [...prev, json.service].sort((a, b) => a.industry.localeCompare(b.industry) || a.label.localeCompare(b.label)));
      setNewLabel('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add service');
    } finally {
      setAdding(false);
    }
  };

  const deleteService = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch('/api/admin/services', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed');
      setServices(prev => prev.filter(s => s.id !== id));
    } catch {
      setError('Failed to delete service');
    } finally {
      setDeletingId(null);
    }
  };

  const grouped = services.reduce<Record<string, PlatformService[]>>((acc, s) => {
    if (!acc[s.industry]) acc[s.industry] = [];
    acc[s.industry].push(s);
    return acc;
  }, {});

  const industryList = Object.keys(grouped).sort();

  return (
    <div>
      {/* Add service form */}
      <div style={{ ...card, marginBottom: '24px', padding: '20px' }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#171A21', marginBottom: '16px' }}>Add New Service</div>
        {error && <div style={{ color: '#C0392B', fontSize: '12px', marginBottom: '12px', padding: '8px 12px', background: '#FFF0F0', borderRadius: '8px' }}>{error}</div>}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Service Name</label>
            <input
              type="text"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addService()}
              placeholder="e.g. Machine Learning Operations"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid rgba(15,111,115,0.2)', fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ flex: '1 1 160px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Industry</label>
            <select
              value={newIndustry}
              onChange={e => setNewIndustry(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid rgba(15,111,115,0.2)', fontSize: '13px', fontFamily: 'inherit', outline: 'none', background: 'white', boxSizing: 'border-box' }}
            >
              {ALL_INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </select>
          </div>
          <button
            onClick={addService}
            disabled={adding || !newLabel.trim()}
            style={{ ...primaryBtn, padding: '9px 20px', opacity: adding || !newLabel.trim() ? 0.6 : 1, whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            {adding ? 'Adding…' : '+ Add Service'}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <KpiCard label="Total Services" value={services.length} />
        <KpiCard label="Industries" value={industryList.length} />
        <KpiCard label="Avg per Industry" value={industryList.length ? Math.round(services.length / industryList.length) : 0} />
      </div>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#9AA0AE' }}>{seeding ? 'Seeding initial services…' : 'Loading…'}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {industryList.map(industry => (
            <div key={industry} style={card}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F6F73' }}>{industry}</span>
                <span style={{ fontSize: '11px', background: '#F0F9F9', color: '#0F6F73', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>{grouped[industry].length} services</span>
              </div>
              <div style={{ padding: '14px 20px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {grouped[industry].map(svc => (
                  <div key={svc.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F4F5F7', borderRadius: '8px', padding: '5px 10px' }}>
                    <span style={{ fontSize: '12px', color: '#444B5A', fontWeight: 500 }}>{svc.label}</span>
                    <button
                      onClick={() => deleteService(svc.id)}
                      disabled={deletingId === svc.id}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0392B', fontSize: '14px', lineHeight: 1, padding: '0 2px', opacity: deletingId === svc.id ? 0.4 : 0.6, fontFamily: 'inherit' }}
                      title="Remove service"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab 4: LINE Templates ────────────────────────────────────────────────────

const TEMPLATE_VARS: Record<string, string[]> = {
  welcome: [],
  verified: ['{{company_name}}'],
};

function TemplatesTab() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [contents, setContents] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/templates')
      .then(r => r.json())
      .then(json => {
        setTemplates(json.templates ?? []);
        const map: Record<string, string> = {};
        (json.templates ?? []).forEach((t: Template) => { map[t.id] = t.content; });
        setContents(map);
      })
      .catch(() => setError('Failed to load templates'))
      .finally(() => setLoading(false));
  }, []);

  const save = async (id: string) => {
    setSaving(id);
    setError(null);
    try {
      const res = await fetch('/api/admin/templates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, content: contents[id] }),
      });
      if (!res.ok) throw new Error('Failed');
      setSaved(id);
      setTimeout(() => setSaved(null), 2000);
    } catch {
      setError('Failed to save template');
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <div style={{ padding: '48px', textAlign: 'center', color: '#9AA0AE' }}>Loading templates…</div>;

  return (
    <div>
      {error && <div style={{ color: '#C0392B', fontSize: '12px', marginBottom: '16px', padding: '10px 14px', background: '#FFF0F0', borderRadius: '8px' }}>{error}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {templates.map(t => {
          const vars = TEMPLATE_VARS[t.id] ?? [];
          return (
            <div key={t.id} style={{ ...card, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#171A21' }}>{t.name}</div>
                  <div style={{ fontSize: '11px', color: '#9AA0AE', marginTop: '2px' }}>ID: <code style={{ fontFamily: 'monospace', background: '#F4F5F7', padding: '1px 5px', borderRadius: '4px' }}>{t.id}</code></div>
                </div>
                {t.updated_at && (
                  <div style={{ fontSize: '11px', color: '#9AA0AE' }}>Last saved: {fmtTime(t.updated_at)}</div>
                )}
              </div>

              {vars.length > 0 && (
                <div style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#9AA0AE', fontWeight: 600 }}>Available variables:</span>
                  {vars.map(v => (
                    <code key={v} style={{ fontSize: '10px', background: '#F0F9F9', color: '#0F6F73', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>{v}</code>
                  ))}
                </div>
              )}

              <textarea
                value={contents[t.id] ?? ''}
                onChange={e => setContents(prev => ({ ...prev, [t.id]: e.target.value }))}
                rows={4}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid rgba(15,111,115,0.2)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  onClick={() => save(t.id)}
                  disabled={saving === t.id}
                  style={{ ...primaryBtn, opacity: saving === t.id ? 0.6 : 1, minWidth: '100px' }}
                >
                  {saving === t.id ? 'Saving…' : saved === t.id ? '✓ Saved!' : 'Save Template'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab 5: LINE Config ───────────────────────────────────────────────────────

function LineConfigTab({ companies: initial }: { companies: Company[] }) {
  const [companies, setCompanies] = useState(initial);
  const [unlinking, setUnlinking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const linked = companies.filter(c => c.line_user_id);

  const unlink = async (companyId: string) => {
    setUnlinking(companyId);
    setError(null);
    try {
      const res = await fetch('/api/admin/line/unlink', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });
      if (!res.ok) throw new Error('Failed');
      setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, line_user_id: null } : c));
    } catch {
      setError('Failed to unlink. Please try again.');
    } finally {
      setUnlinking(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <KpiCard label="Linked Accounts" value={linked.length} />
        <KpiCard label="Messages Sent" value="—" />
        <KpiCard label="Delivery Rate" value="—" />
      </div>

      <div style={{ padding: '12px 16px', background: '#FFFBF5', border: '1px solid rgba(247,127,0,0.2)', borderRadius: '10px', marginBottom: '20px', fontSize: '12px', color: '#9AA0AE' }}>
        Messages Sent and Delivery Rate statistics are available in the LINE Official Account Manager dashboard.
      </div>

      {error && <div style={{ color: '#C0392B', fontSize: '12px', marginBottom: '16px', padding: '10px 14px', background: '#FFF0F0', borderRadius: '8px' }}>{error}</div>}

      <div style={card}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F4F5F7' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#171A21' }}>Linked Companies</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '420px' }}>
          <thead>
            <tr style={{ background: '#F4F5F7' }}>
              {['Company', 'LINE UID', 'Linked Date', 'Actions'].map(col => (
                <th key={col} style={thStyle}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linked.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: '#9AA0AE', fontSize: '14px' }}>No linked LINE accounts yet</td></tr>
            ) : linked.map((c, i) => (
              <tr key={c.id} style={{ borderTop: i > 0 ? '1px solid #F4F5F7' : undefined }}>
                <td style={tdStyle}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#171A21' }}>{c.name}</div>
                  {c.industry && <div style={{ fontSize: '11px', color: '#9AA0AE' }}>{c.industry}</div>}
                </td>
                <td style={tdStyle}>
                  <code style={{ fontSize: '12px', fontFamily: 'monospace', background: '#F4F5F7', padding: '2px 6px', borderRadius: '4px', color: '#444B5A' }}>
                    {c.line_user_id ? `${c.line_user_id.slice(0, 12)}…` : '—'}
                  </code>
                </td>
                <td style={{ ...tdStyle, fontSize: '12px', color: '#9AA0AE' }}>{fmt(c.created_at)}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => unlink(c.id)}
                    disabled={unlinking === c.id}
                    style={{ ...dangerBtn, opacity: unlinking === c.id ? 0.6 : 1 }}
                  >
                    {unlinking === c.id ? '…' : 'Unlink'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 6: Requests ──────────────────────────────────────────────────────────

function RequestsTab({ broadcasts: initial }: { broadcasts: Broadcast[] }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const now = new Date();
  const thisMonth = initial.filter(b => {
    const d = new Date(b.created_at);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const categories = Array.from(new Set(initial.map(b => b.category).filter(Boolean))).sort();

  const filtered = initial.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && b.category !== categoryFilter) return false;
    return true;
  });

  const statusBadge = (status: string) => {
    if (status === 'active') return { bg: '#ECFDF5', color: '#059669', label: 'Active' };
    if (status === 'expired') return { bg: '#F4F5F7', color: '#9AA0AE', label: 'Expired' };
    return { bg: '#FFF8EE', color: '#E06B00', label: status };
  };

  const selectStyle = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1.5px solid rgba(15,111,115,0.2)',
    fontSize: '12px',
    fontFamily: 'inherit',
    outline: 'none',
    background: 'white',
    color: '#444B5A',
    cursor: 'pointer' as const,
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <KpiCard label="Total Requests" value={initial.length} />
        <KpiCard label="This Month" value={thisMonth.length} />
        <KpiCard label="Active" value={initial.filter(b => b.status === 'active').length} />
        <KpiCard label="Expired" value={initial.filter(b => b.status === 'expired').length} />
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
        <label style={{ fontSize: '12px', color: '#9AA0AE', fontWeight: 600 }}>Status:</label>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
        </select>
        <label style={{ fontSize: '12px', color: '#9AA0AE', fontWeight: 600 }}>Service:</label>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Services</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(statusFilter !== 'all' || categoryFilter !== 'all') && (
          <button onClick={() => { setStatusFilter('all'); setCategoryFilter('all'); }} style={{ ...dangerBtn, fontSize: '11px' }}>Clear filters</button>
        )}
      </div>

      <div style={card}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F4F5F7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#171A21' }}>Broadcast Requests</span>
          <span style={{ fontSize: '12px', color: '#9AA0AE' }}>{filtered.length} of {initial.length} shown</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '680px' }}>
          <thead>
            <tr style={{ background: '#F4F5F7' }}>
              {['ID', 'Buyer', 'Service', 'Budget', 'Timeline', 'Matches', 'Status', 'Date'].map(col => (
                <th key={col} style={thStyle}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#9AA0AE', fontSize: '14px' }}>No requests found</td></tr>
            ) : filtered.map((b, i) => {
              const badge = statusBadge(b.status);
              return (
                <tr key={b.id} style={{ borderTop: i > 0 ? '1px solid #F4F5F7' : undefined }}>
                  <td style={tdStyle}>
                    <code style={{ fontSize: '11px', fontFamily: 'monospace', color: '#9AA0AE' }}>{b.id.slice(0, 8)}</code>
                  </td>
                  <td style={{ ...tdStyle, fontSize: '13px', color: '#171A21', fontWeight: 500 }}>{b.buyer_company_name || '—'}</td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: '11px', background: '#F0F9F9', color: '#0F6F73', padding: '2px 7px', borderRadius: '999px', fontWeight: 500 }}>{b.category || '—'}</span>
                  </td>
                  <td style={{ ...tdStyle, fontSize: '12px', color: '#444B5A' }}>{b.budget_band || '—'}</td>
                  <td style={{ ...tdStyle, fontSize: '12px', color: '#444B5A' }}>{b.timeline || '—'}</td>
                  <td style={{ ...tdStyle, fontSize: '13px', color: '#171A21', fontWeight: 600, textAlign: 'center' as const }}>{b.match_count}</td>
                  <td style={tdStyle}>
                    <span style={{ background: badge.bg, color: badge.color, fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>{badge.label}</span>
                  </td>
                  <td style={{ ...tdStyle, fontSize: '12px', color: '#9AA0AE', whiteSpace: 'nowrap' }}>{fmt(b.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 7: Activity Logs ─────────────────────────────────────────────────────

function ActivityLogsTab() {
  return (
    <div style={{ ...card, padding: '60px', textAlign: 'center' }}>
      <div style={{ fontSize: '40px', marginBottom: '16px' }}>📋</div>
      <div style={{ fontSize: '18px', fontWeight: 700, color: '#171A21', marginBottom: '8px' }}>Activity Logging Coming Soon</div>
      <div style={{ fontSize: '13px', color: '#9AA0AE', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
        Detailed activity logs for admin actions, user sign-ins, company verifications, and LINE notifications will appear here.
      </div>
    </div>
  );
}

// ─── Claim / verification queue ───────────────────────────────────────────────
// Companies that uploaded a registration document but aren't verified yet —
// i.e. providers who claimed their profile and are awaiting super-admin review.

function ClaimsTab({ companies: initial }: { companies: Company[] }) {
  const [companies, setCompanies] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);

  const verify = async (companyId: string) => {
    setLoading(companyId);
    try {
      const res = await fetch('/api/admin/companies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, field: 'verified', value: true }),
      });
      if (!res.ok) throw new Error('Failed');
      setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, verified: true } : c));
    } catch {
      alert('Action failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const unverify = async (companyId: string) => {
    setLoading(companyId);
    try {
      const res = await fetch('/api/admin/companies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, field: 'verified', value: false }),
      });
      if (!res.ok) throw new Error('Failed');
      setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, verified: false } : c));
    } catch {
      alert('Action failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  // Only companies that went through the claim/upload flow (have a doc) belong here.
  const withDoc = companies.filter(c => c.dbd_certificate_url);
  const pending = withDoc.filter(c => !c.verified);
  const verified = withDoc.filter(c => c.verified);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <KpiCard label="Awaiting Verification" value={pending.length} warn={pending.length > 0} />
        <KpiCard label="Verified" value={verified.length} />
      </div>

      {/* ── Awaiting verification ─────────────────────────────────────────── */}
      <div style={card}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F4F5F7' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#171A21' }}>Awaiting Verification</span>
          <span style={{ fontSize: '13px', color: '#9AA0AE', marginLeft: '8px' }}>Providers who claimed their profile and uploaded a registration document. Verify to grant the Verified badge.</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
            <thead>
              <tr style={{ background: '#F4F5F7' }}>
                {['Company', 'Owner Email', 'Document', 'Joined', 'Actions'].map(col => <th key={col} style={thStyle}>{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#9AA0AE', fontSize: '14px' }}>No claim requests awaiting verification</td></tr>
              ) : pending.map((c, i) => (
                <tr key={c.id} style={{ borderTop: i > 0 ? '1px solid #F4F5F7' : undefined }}>
                  <td style={tdStyle}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#171A21' }}>{c.name}</div>
                    {c.name_th && <div style={{ fontSize: '11px', color: '#9AA0AE' }}>{c.name_th}</div>}
                  </td>
                  <td style={{ ...tdStyle, fontSize: '13px', color: '#444B5A' }}>{c.user_email || '—'}</td>
                  <td style={tdStyle}>
                    {c.dbd_certificate_url
                      ? <button onClick={() => openAdminDoc(c.dbd_certificate_url)} style={{ fontSize: '12px', color: '#0F6F73', fontWeight: 600, textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>View document →</button>
                      : <span style={{ fontSize: '12px', color: '#9AA0AE' }}>No document</span>}
                  </td>
                  <td style={{ ...tdStyle, fontSize: '12px', color: '#9AA0AE' }}>{fmt(c.created_at)}</td>
                  <td style={tdStyle}>
                    <button onClick={() => verify(c.id)} disabled={loading === c.id} style={{ ...primaryBtn, opacity: loading === c.id ? 0.6 : 1 }}>
                      {loading === c.id ? '…' : '✓ Verify'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Verified (kept for tracking) ──────────────────────────────────── */}
      <div style={{ ...card, marginTop: '20px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F4F5F7' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#171A21' }}>Verified</span>
          <span style={{ fontSize: '13px', color: '#9AA0AE', marginLeft: '8px' }}>Companies you have already verified. Undo if a document was approved by mistake.</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
            <thead>
              <tr style={{ background: '#F4F5F7' }}>
                {['Company', 'Owner Email', 'Document', 'Joined', 'Status'].map(col => <th key={col} style={thStyle}>{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {verified.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#9AA0AE', fontSize: '14px' }}>No verified companies yet</td></tr>
              ) : verified.map((c, i) => (
                <tr key={c.id} style={{ borderTop: i > 0 ? '1px solid #F4F5F7' : undefined }}>
                  <td style={tdStyle}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#171A21' }}>{c.name}</div>
                    {c.name_th && <div style={{ fontSize: '11px', color: '#9AA0AE' }}>{c.name_th}</div>}
                  </td>
                  <td style={{ ...tdStyle, fontSize: '13px', color: '#444B5A' }}>{c.user_email || '—'}</td>
                  <td style={tdStyle}>
                    {c.dbd_certificate_url
                      ? <button onClick={() => openAdminDoc(c.dbd_certificate_url)} style={{ fontSize: '12px', color: '#0F6F73', fontWeight: 600, textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>View document →</button>
                      : <span style={{ fontSize: '12px', color: '#9AA0AE' }}>No document</span>}
                  </td>
                  <td style={{ ...tdStyle, fontSize: '12px', color: '#9AA0AE' }}>{fmt(c.created_at)}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: '#0F6F73', background: 'rgba(15,111,115,0.09)', borderRadius: '999px', padding: '3px 10px' }}>✓ Verified</span>
                      <button onClick={() => unverify(c.id)} disabled={loading === c.id} style={{ fontSize: '12px', color: '#9AA0AE', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', textDecoration: 'underline', opacity: loading === c.id ? 0.6 : 1 }}>
                        {loading === c.id ? '…' : 'Undo'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Requests hub: Broadcast / Claim / Early Bird under one tab ────────────────

function RequestsHub({ broadcasts, earlyBirdClaims, companies }: { broadcasts: Broadcast[]; earlyBirdClaims: EarlyBirdClaim[]; companies: Company[] }) {
  const [sub, setSub] = useState<'broadcast' | 'claim' | 'earlybird'>('broadcast');
  const pendingClaims = companies.filter(c => !c.verified && c.dbd_certificate_url).length;
  const pendingEB = earlyBirdClaims.filter(c => c.status === 'pending').length;
  const SUBS: { id: 'broadcast' | 'claim' | 'earlybird'; label: string; badge: number }[] = [
    { id: 'broadcast', label: 'Broadcast', badge: 0 },
    { id: 'claim', label: 'Verification', badge: pendingClaims },
    { id: 'earlybird', label: 'Early Bird', badge: pendingEB },
  ];
  return (
    <div>
      <div style={{ display: 'inline-flex', gap: '4px', background: '#F4F5F7', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
        {SUBS.map(s => (
          <button
            key={s.id}
            onClick={() => setSub(s.id)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '9px', border: 'none',
              background: sub === s.id ? 'white' : 'transparent',
              color: sub === s.id ? '#0F6F73' : '#6B7385',
              fontWeight: sub === s.id ? 700 : 500, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: sub === s.id ? '0 1px 3px rgba(23,26,33,0.1)' : 'none', transition: 'all 0.12s',
            }}
          >
            {s.label}
            {s.badge > 0 && (
              <span style={{ fontSize: '11px', fontWeight: 700, minWidth: '18px', height: '18px', padding: '0 5px', borderRadius: '999px', background: 'linear-gradient(135deg,#F77F00,#E06B00)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{s.badge}</span>
            )}
          </button>
        ))}
      </div>
      {sub === 'broadcast' && <RequestsTab broadcasts={broadcasts} />}
      {sub === 'claim' && <ClaimsTab companies={companies} />}
      {sub === 'earlybird' && <EarlyBirdTab claims={earlyBirdClaims} />}
    </div>
  );
}

// ─── Main AdminClient component ───────────────────────────────────────────────

// ─── Tab: Traffic ─────────────────────────────────────────────────────────────

interface TrafficData {
  site: { totalAllTime: number; views30: number; unique30: number; humanEstimate: number; suspectedAutomated: number; thVisitors: number; views7: number; views24: number; capped: boolean };
  callerExcluded: boolean;
  excludedDevices: number;
  daily: { date: string; count: number }[];
  topPages: { key: string; count: number }[];
  topReferrers: { key: string; count: number }[];
  topCountries: { key: string; count: number }[];
  directCount: number;
  topCompanies: { id: string; name: string; views: number; claimed: boolean; premium: boolean }[];
}

function TrafficListCard({ title, rows }: { title: string; rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map(r => r.value));
  return (
    <div style={{ ...card, padding: '20px' }}>
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#171A21', marginBottom: '14px' }}>{title}</div>
      {rows.length === 0 ? (
        <div style={{ fontSize: '13px', color: '#9AA0AE' }}>No data yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {rows.map((r, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '3px', gap: '10px' }}>
                <span style={{ color: '#444B5A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</span>
                <span style={{ color: '#171A21', fontWeight: 700, flexShrink: 0 }}>{r.value.toLocaleString()}</span>
              </div>
              <div style={{ height: '5px', background: '#F0F9F9', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(r.value / max) * 100}%`, background: 'linear-gradient(90deg,#1A9DA3,#0F6F73)', borderRadius: '999px' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TrafficTab() {
  const [data, setData] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [excluding, setExcluding] = useState(false);

  useEffect(() => {
    fetch('/api/admin/traffic')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError('Failed to load traffic'))
      .finally(() => setLoading(false));
  }, []);

  const toggleExclude = async () => {
    if (!data) return;
    setExcluding(true);
    try {
      const res = await fetch('/api/admin/traffic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: data.callerExcluded ? 'remove' : 'add' }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error();
      setData({ ...data, callerExcluded: j.callerExcluded, excludedDevices: data.excludedDevices + (j.callerExcluded ? 1 : -1) });
    } catch {
      alert('Action failed. Please try again.');
    } finally {
      setExcluding(false);
    }
  };

  const [resetting, setResetting] = useState(false);
  const resetHistory = async () => {
    if (!confirm('Clear ALL traffic history and start counting from now?\n\nThis permanently deletes every recorded page view. It cannot be undone.')) return;
    setResetting(true);
    try {
      const res = await fetch('/api/admin/traffic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      if (!res.ok) throw new Error();
      // Reload the (now-empty) figures.
      const fresh = await fetch('/api/admin/traffic').then(r => r.json());
      setData(fresh);
    } catch {
      alert('Reset failed. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  if (loading) return <div style={{ padding: '48px', textAlign: 'center', color: '#9AA0AE' }}>Loading traffic…</div>;
  if (error || !data) return <div style={{ padding: '48px', textAlign: 'center', color: '#C0392B' }}>{error ?? 'No data'}</div>;

  const maxDay = Math.max(1, ...data.daily.map(d => d.count));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Data-quality control bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap', background: '#F0F9F9', border: '1px solid rgba(15,111,115,0.15)', borderRadius: '12px', padding: '12px 16px' }}>
        <div style={{ fontSize: '12.5px', color: '#444B5A', lineHeight: 1.5 }}>
          {data.callerExcluded
            ? '✓ Your own visits on this device/network are not counted.'
            : 'These numbers may include your own testing. Exclude this device to see real visitors only.'}
          <span style={{ color: '#9AA0AE' }}> · Bots filtered automatically · {data.excludedDevices} device(s) excluded</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
          <button onClick={toggleExclude} disabled={excluding} style={{
            padding: '8px 14px', borderRadius: '9px', border: '1.5px solid rgba(15,111,115,0.35)',
            background: data.callerExcluded ? 'white' : 'linear-gradient(135deg,#0F6F73,#1A9DA3)',
            color: data.callerExcluded ? '#0F6F73' : 'white', fontFamily: 'inherit', fontSize: '12.5px', fontWeight: 700,
            cursor: 'pointer', opacity: excluding ? 0.6 : 1,
          }}>
            {excluding ? '…' : data.callerExcluded ? 'Count my visits again' : 'Stop counting my visits'}
          </button>
          <button onClick={resetHistory} disabled={resetting} style={{
            padding: '8px 14px', borderRadius: '9px', border: '1.5px solid rgba(192,57,43,0.3)',
            background: 'white', color: '#C0392B', fontFamily: 'inherit', fontSize: '12.5px', fontWeight: 700,
            cursor: 'pointer', opacity: resetting ? 0.6 : 1,
          }}>
            {resetting ? '…' : 'Clear history'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' }}>
        <KpiCard label="🇹🇭 Thailand Visitors (30d)" value={data.site.thVisitors.toLocaleString()} />
        <KpiCard label="Real Humans (30d, est.)" value={data.site.humanEstimate.toLocaleString()} />
        <KpiCard label="Unique Visitors (30d)" value={data.site.unique30.toLocaleString()} />
        <KpiCard label="Page Views (30d)" value={data.site.views30.toLocaleString()} />
        <KpiCard label="Visits (24 hours)" value={data.site.views24.toLocaleString()} />
      </div>

      {data.site.suspectedAutomated > 0 && (
        <div style={{ fontSize: '12px', color: '#9AA0AE', marginTop: '-12px' }}>
          {data.site.suspectedAutomated} likely-automated visitor(s) filtered from the &ldquo;Real Humans&rdquo; estimate (each viewed 20+ pages in 30 days). Total all-time page views: {data.site.totalAllTime.toLocaleString()}.
        </div>
      )}

      <div style={{ ...card, padding: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#171A21', marginBottom: '16px' }}>Visits — last 30 days</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '120px' }}>
          {data.daily.map(d => (
            <div key={d.date} title={`${d.date}: ${d.count}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
              <div style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count > 0 ? '2px' : '0', background: 'linear-gradient(180deg,#1A9DA3,#0F6F73)', borderRadius: '3px 3px 0 0' }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9AA0AE', marginTop: '6px' }}>
          <span>{data.daily[0]?.date}</span>
          <span>{data.daily[data.daily.length - 1]?.date}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <TrafficListCard title="Top Pages (30d)" rows={data.topPages.map(p => ({ label: p.key, value: p.count }))} />
        <TrafficListCard title="Top Referrers (30d)" rows={[{ label: 'Direct / none', value: data.directCount }, ...data.topReferrers.map(r => ({ label: r.key, value: r.count }))]} />
        <TrafficListCard title="Top Countries (30d)" rows={data.topCountries.map(c => ({ label: c.key, value: c.count }))} />
      </div>

      <div style={card}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F4F5F7' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#171A21' }}>Top Companies by Profile Views</span>
          <span style={{ fontSize: '13px', color: '#9AA0AE', marginLeft: '8px' }}>All-time, deduped per viewer per day</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '420px' }}>
            <thead><tr style={{ background: '#F4F5F7' }}>{['Company', 'Tier', 'Profile Views'].map(c => <th key={c} style={thStyle}>{c}</th>)}</tr></thead>
            <tbody>
              {data.topCompanies.length === 0 ? (
                <tr><td colSpan={3} style={{ padding: '32px', textAlign: 'center', color: '#9AA0AE' }}>No views yet</td></tr>
              ) : data.topCompanies.map((c, i) => (
                <tr key={c.id} style={{ borderTop: i > 0 ? '1px solid #F4F5F7' : undefined }}>
                  <td style={{ ...tdStyle, fontSize: '14px', fontWeight: 600, color: '#171A21' }}>{c.name}</td>
                  <td style={{ ...tdStyle, fontSize: '12px', color: '#6B7385' }}>{c.premium ? 'Premium' : c.claimed ? 'Claimed' : 'Unclaimed'}</td>
                  <td style={{ ...tdStyle, fontSize: '14px', fontWeight: 700, color: '#0F6F73' }}>{(c.views ?? 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {data.site.capped && <div style={{ fontSize: '12px', color: '#9AA0AE' }}>Note: 30-day aggregates use the most recent 50,000 views.</div>}
    </div>
  );
}

const TABS = [
  { id: 'companies', label: 'Companies' },
  { id: 'traffic', label: 'Traffic' },
  { id: 'users', label: 'Users' },
  { id: 'requests', label: 'Requests' },
  { id: 'services', label: 'Industries & Services' },
  { id: 'templates', label: 'LINE Templates' },
  { id: 'line', label: 'LINE Config' },
  { id: 'logs', label: 'Activity Logs' },
];

export function AdminClient({ companies, users, broadcasts, earlyBirdClaims, lang: _lang }: Props) {
  const [activeTab, setActiveTab] = useState('companies');
  const pendingEarlyBird = earlyBirdClaims.filter(c => c.status === 'pending').length;
  const pendingClaims = companies.filter(c => !c.verified && c.dbd_certificate_url).length;
  const pendingRequests = pendingEarlyBird + pendingClaims;

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>Super Admin Panel</h1>
          <p style={{ fontSize: '13px', color: '#9AA0AE' }}>Manage all aspects of the Profindle platform</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0, flexWrap: 'wrap' }}>
          <a
            href={`/${_lang}/admin/import`}
            title="Bulk-add companies by pasting a JSON array (creates unclaimed profiles)"
            style={{ padding: '10px 20px', background: 'white', color: '#0F6F73', fontWeight: 600, fontSize: '13px', borderRadius: '12px', textDecoration: 'none', whiteSpace: 'nowrap', border: '1.5px solid rgba(15,111,115,0.4)' }}
          >
            ⬆ Import JSON
          </a>
          <a
            href={`/${_lang}/broadcast-request`}
            title="Post a broadcast as Profindle — for testing and live demos (no company or 4/month limit)"
            style={{ padding: '10px 20px', background: 'white', color: '#F77F00', fontWeight: 600, fontSize: '13px', borderRadius: '12px', textDecoration: 'none', whiteSpace: 'nowrap', border: '1.5px solid rgba(247,127,0,0.4)' }}
          >
            📣 Test broadcast
          </a>
          <a
            href={`/${_lang}/admin/reports`}
            style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '13px', borderRadius: '12px', textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            📊 Reports
          </a>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid #F4F5F7', marginBottom: '28px', overflowX: 'auto' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #0F6F73' : '2px solid transparent',
              marginBottom: '-2px',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? '#0F6F73' : '#9AA0AE',
              cursor: 'pointer',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s',
              display: 'inline-flex', alignItems: 'center', gap: '7px',
            }}
          >
            {tab.label}
            {tab.id === 'requests' && pendingRequests > 0 && (
              <span style={{ fontSize: '11px', fontWeight: 700, minWidth: '18px', height: '18px', padding: '0 5px', borderRadius: '999px', background: 'linear-gradient(135deg,#F77F00,#E06B00)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {pendingRequests}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'companies' && <CompaniesTab companies={companies} />}
      {activeTab === 'traffic' && <TrafficTab />}
      {activeTab === 'users' && <UsersTab users={users} />}
      {activeTab === 'requests' && <RequestsHub broadcasts={broadcasts} earlyBirdClaims={earlyBirdClaims} companies={companies} />}
      {activeTab === 'services' && <ServicesTab />}
      {activeTab === 'templates' && <TemplatesTab />}
      {activeTab === 'line' && <LineConfigTab companies={companies} />}
      {activeTab === 'logs' && <ActivityLogsTab />}
    </div>
  );
}
