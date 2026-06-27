'use client';

import { useState } from 'react';

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
  user_email: string | null;
}

interface Props {
  companies: Company[];
  lang: string;
}

export function AdminClient({ companies: initial, lang }: Props) {
  const [companies, setCompanies] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);

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
      setCompanies(prev =>
        prev.map(c => c.id === companyId ? { ...c, [field]: !current } : c)
      );
    } catch {
      alert('Action failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const pending = companies.filter(c => !c.verified && c.dbd_certificate_url);
  const verified = companies.filter(c => c.verified);
  const premium = companies.filter(c => c.premium);

  const kpis = [
    { label: 'Total Companies', value: companies.length },
    { label: 'Verified', value: verified.length },
    { label: 'Pending Review', value: pending.length, warn: pending.length > 0 },
    { label: 'Premium', value: premium.length },
  ];

  return (
    <div className="page-body">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>Admin Panel</h1>
        <p style={{ fontSize: '13px', color: '#9AA0AE' }}>Manage company verification and premium status</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {kpis.map(kpi => (
          <div key={kpi.label} style={{ background: 'white', borderRadius: '14px', border: `1px solid ${kpi.warn ? 'rgba(247,127,0,0.3)' : 'rgba(15,111,115,0.10)'}`, padding: '20px' }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: kpi.warn ? '#E06B00' : '#171A21' }}>{kpi.value}</div>
            <div style={{ fontSize: '12px', color: '#9AA0AE', marginTop: '4px' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Pending verification queue */}
      {pending.length > 0 && (
        <div style={{ background: 'white', borderRadius: '16px', border: '1.5px solid rgba(247,127,0,0.3)', overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg,#FFFBF5,#FFF8EE)', borderBottom: '1px solid rgba(247,127,0,0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#171A21' }}>Verification Queue</span>
            <span style={{ background: '#FFF6EC', color: '#E06B00', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>{pending.length} pending</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F4F5F7' }}>
                {['Company', 'Email', 'Document', 'Joined', 'Actions'].map(col => (
                  <th key={col} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9AA0AE' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pending.map((c, i) => (
                <tr key={c.id} style={{ borderTop: i > 0 ? '1px solid #F4F5F7' : undefined }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#171A21' }}>{c.name}</div>
                    {c.name_th && <div style={{ fontSize: '11px', color: '#9AA0AE' }}>{c.name_th}</div>}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#444B5A' }}>{c.user_email || '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    {c.dbd_certificate_url
                      ? <a href={c.dbd_certificate_url} target="_blank" rel="noopener" style={{ fontSize: '12px', color: '#0F6F73', fontWeight: 600, textDecoration: 'none' }}>View document →</a>
                      : <span style={{ fontSize: '12px', color: '#9AA0AE' }}>No document</span>}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: '#9AA0AE' }}>
                    {new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => toggle(c.id, 'verified', false)}
                      disabled={loading === `${c.id}-verified`}
                      style={{ padding: '7px 16px', borderRadius: '8px', background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)', color: 'white', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', opacity: loading === `${c.id}-verified` ? 0.6 : 1, fontFamily: 'inherit' }}
                    >
                      {loading === `${c.id}-verified` ? '…' : '✓ Verify'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* All companies table */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F4F5F7' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#171A21' }}>All Companies</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F4F5F7' }}>
              {['Company', 'Email', 'Services', 'Verified', 'Premium', 'Joined'].map(col => (
                <th key={col} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9AA0AE' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {companies.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#9AA0AE', fontSize: '14px' }}>No companies yet</td></tr>
            ) : companies.map((c, i) => (
              <tr key={c.id} style={{ borderTop: i > 0 ? '1px solid #F4F5F7' : undefined }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#171A21' }}>{c.name}</div>
                  {c.industry && <div style={{ fontSize: '11px', color: '#9AA0AE' }}>{c.industry}</div>}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '12px', color: '#6B7385' }}>{c.user_email || '—'}</td>
                <td style={{ padding: '14px 16px', maxWidth: '200px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(c.services || []).slice(0, 3).map(s => (
                      <span key={s} style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '999px', background: '#F0F9F9', color: '#0F6F73', fontWeight: 500 }}>{s}</span>
                    ))}
                    {(c.services || []).length > 3 && (
                      <span style={{ fontSize: '10px', color: '#9AA0AE' }}>+{c.services.length - 3}</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <button
                    onClick={() => toggle(c.id, 'verified', c.verified)}
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
                <td style={{ padding: '14px 16px' }}>
                  <button
                    onClick={() => toggle(c.id, 'premium', c.premium)}
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
                <td style={{ padding: '14px 16px', fontSize: '12px', color: '#9AA0AE' }}>
                  {new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
