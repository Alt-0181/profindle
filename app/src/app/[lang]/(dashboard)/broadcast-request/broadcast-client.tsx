'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Dictionary } from '@/dictionaries';
import { SERVICES, searchServices } from '@/lib/services';

interface BroadcastClientProps {
  lang: string;
  dict: Dictionary;
}

const BUDGETS = [
  { id: 'discuss', label: 'To be discussed' },
  { id: 'under50k', label: 'Under ฿50,000' },
  { id: '50k-100k', label: '฿50,000 – 100,000' },
  { id: '100k-500k', label: '฿100,000 – 500,000' },
  { id: '500k-1m', label: '฿500,000 – 1,000,000' },
  { id: '1m-5m', label: '฿1,000,000 – 5,000,000' },
  { id: 'above5m', label: 'Above ฿5,000,000' },
];

const TIMELINES = [
  { id: 'asap', label: 'ASAP / Urgent' },
  { id: '1month', label: 'Within 1 month' },
  { id: '3months', label: '1–3 months' },
  { id: '6months', label: '3–6 months' },
];

const POPULAR_SERVICES = ['Digital Marketing', 'Web Development', 'SEO / SEM', 'Accounting', 'Legal Consulting', 'Recruitment', 'Branding & Identity', 'Mobile App Development'];

export function BroadcastRequestClient({ lang, dict }: BroadcastClientProps) {
  const t = dict.broadcast;
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    service: '',
    serviceIndustry: '',
    descEn: '',
    descTh: '',
    title: '',
    budget: '',
    timeline: '',
    timelineDate: '',
    location: 'anywhere',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [matched, setMatched] = useState<number | null>(null);
  const [notified, setNotified] = useState<number | null>(null);
  const [pushErrors, setPushErrors] = useState<string[]>([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (step === 3 && form.service) {
      setPreviewLoading(true);
      fetch(`/api/broadcasts/preview?category=${encodeURIComponent(form.service)}`)
        .then((r) => r.json())
        .then((d) => setPreviewCount(d.count ?? 0))
        .catch(() => setPreviewCount(null))
        .finally(() => setPreviewLoading(false));
    }
  }, [step, form.service]);

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const budgetLabel = BUDGETS.find((b) => b.id === form.budget)?.label ?? form.budget;
      const timelineLabel = form.timeline === 'specific_date'
        ? (form.timelineDate ? new Date(form.timelineDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '')
        : (TIMELINES.find((t) => t.id === form.timeline)?.label ?? form.timeline);
      const res = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: form.service,
          title: form.title || null,
          descriptionEn: form.descEn || null,
          descriptionTh: form.descTh || null,
          budgetBand: budgetLabel,
          timeline: timelineLabel,
          locationPref: form.location !== 'anywhere' ? form.location : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Submission failed');
      setMatched(data.matched ?? data.notified ?? 0);
      setNotified(data.notified ?? 0);
      setPushErrors(data.pushErrors ?? []);
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredServices = serviceSearch ? searchServices(serviceSearch, 8).map(s => ({ service: s.label, industry: s.industry })) : [];

  const steps = [
    { num: 1, label: t.step1 },
    { num: 2, label: t.step2 },
    { num: 3, label: t.step4 },
  ];

  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 16px', borderRadius: '999px', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
    border: `1.5px solid ${active ? '#0F6F73' : '#E4E7ED'}`,
    background: active ? '#0F6F73' : 'transparent',
    color: active ? 'white' : '#444B5A',
    transition: 'all 150ms',
  });

  const cardStyle: React.CSSProperties = {
    background: 'white', borderRadius: '18px', border: '1px solid rgba(15,111,115,0.10)',
    padding: '28px', marginBottom: '16px',
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: '580px', margin: '0 auto', paddingTop: '40px' }}>
        <div style={{ ...cardStyle, textAlign: 'center', padding: '48px 28px' }}>
          <div style={{ width: '84px', height: '84px', borderRadius: '999px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#171A21', marginBottom: '8px' }}>{t.successTitle}</h2>
          <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '24px' }}>{t.successSub}</p>
          <div style={{ background: '#F0F9F9', borderRadius: '14px', padding: '20px', marginBottom: '28px' }}>
            <div style={{ fontSize: '36px', fontWeight: 700, color: '#0F6F73', marginBottom: '4px' }}>{matched ?? 0}</div>
            <div style={{ fontSize: '14px', color: '#6B7385' }}>{t.matchCount.replace('{count}', String(matched ?? 0))}</div>
            {notified != null && (
              <div style={{ fontSize: '12px', color: notified > 0 ? '#9AA0AE' : '#DC2626', marginTop: '6px' }}>
                {notified > 0 ? `${notified} notified via LINE` : 'LINE notification failed'}
              </div>
            )}
            {pushErrors.length > 0 && (
              <div style={{ marginTop: '10px', padding: '10px 12px', background: '#FFF5F5', border: '1px solid #FCA5A5', borderRadius: '8px', fontSize: '11px', color: '#DC2626', textAlign: 'left', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {pushErrors.map((e, i) => <div key={i}>{e}</div>)}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', marginBottom: '28px' }}>
            {[t.nextStep1, t.nextStep2, t.nextStep3].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '999px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: '14px', color: '#444B5A' }}>{s}</span>
              </div>
            ))}
          </div>
          <button onClick={() => { setSubmitted(false); setStep(1); setMatched(null); setNotified(null); setSubmitError(''); setForm({ service: '', serviceIndustry: '', descEn: '', descTh: '', title: '', budget: '', timeline: '', timelineDate: '', location: 'anywhere' }); }} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
            {t.newBroadcast}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '940px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{t.title}</h1>
        <p style={{ fontSize: '14px', color: '#6B7385' }}>{t.subtitle}</p>
      </div>

      {/* Plan banner */}
      <div style={{ background: 'linear-gradient(135deg, #FFFBF5, #FFF8EE)', border: '1px solid rgba(247,127,0,0.25)', borderRadius: '12px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #F77F00, #E06B00)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <div style={{ fontSize: '12.5px', color: '#444B5A' }}>
          {t.freePlanBanner.replace('{remaining}', '4')}
          {' '}<Link href={`/${lang}/package`} style={{ color: '#0F6F73', fontWeight: 600 }}>{lang === 'th' ? 'อัปเกรด →' : 'Upgrade →'}</Link>
        </div>
      </div>

      {/* Stepper */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
        {steps.map((s) => (
          <div key={s.num} onClick={() => s.num < step && setStep(s.num)} style={{
            padding: '12px 14px', borderRadius: '12px', cursor: s.num < step ? 'pointer' : 'default',
            border: `1.5px solid ${step === s.num ? '#0F6F73' : 'rgba(15,111,115,0.12)'}`,
            background: step === s.num ? '#F0F9F9' : 'white',
            boxShadow: step === s.num ? '0 2px 8px rgba(15,111,115,0.12)' : 'none',
            display: 'flex', flexDirection: 'column', gap: '6px',
          }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '999px', background: step > s.num ? '#0F6F73' : '#F4F5F7', color: step > s.num ? 'white' : '#9AA0AE', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {step > s.num ? '✓' : s.num}
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: step === s.num ? '#0F6F73' : '#9AA0AE' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Service */}
      {step === 1 && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{t.step1Title}</h2>
          <p style={{ fontSize: '13px', color: '#9AA0AE', marginBottom: '20px' }}>{t.step1Sub}</p>

          {/* Popular services */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
              {lang === 'th' ? 'บริการยอดนิยม' : 'Popular Services'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {POPULAR_SERVICES.map((s) => (
                <button key={s} onClick={() => { set('service', s); setStep(2); }} style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
                  border: `1px solid ${form.service === s ? '#0F6F73' : '#E4E7ED'}`,
                  borderRadius: '999px', background: form.service === s ? '#F0F9F9' : 'white',
                  color: form.service === s ? '#0F6F73' : '#444B5A',
                  fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms',
                }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1.5px solid #E4E7ED', borderRadius: '14px', padding: '12px 16px', minHeight: '56px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9AA0AE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {form.service && (
                <span style={{ background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontSize: '13px', fontWeight: 600, padding: '4px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {form.service}
                  <button onClick={() => set('service', '')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', lineHeight: 1 }}>×</button>
                </span>
              )}
              <input
                type="text" value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                placeholder={form.service ? '' : (lang === 'th' ? 'หรือค้นหาบริการ…' : 'Or search services…')}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: '#444B5A', background: 'transparent', fontFamily: 'inherit' }}
              />
            </div>
            {filteredServices.length > 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'white', border: '1.5px solid rgba(15,111,115,0.18)', borderRadius: '14px', boxShadow: '0 12px 48px rgba(15,111,115,0.22)', zIndex: 50, maxHeight: '340px', overflowY: 'auto' }}>
                {filteredServices.map((item) => (
                  <div key={item.service} onClick={() => { set('service', item.service); set('serviceIndustry', item.industry); setServiceSearch(''); setStep(2); }}
                    style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '13px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#F0F9F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#171A21' }}>{item.service}</div>
                      <div style={{ fontSize: '11px', color: '#9AA0AE' }}>{item.industry}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => form.service && setStep(2)} disabled={!form.service} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', borderRadius: '12px', cursor: form.service ? 'pointer' : 'not-allowed', opacity: form.service ? 1 : 0.5, fontFamily: 'inherit' }}>
              {dict.common.next} →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Details + Budget & Delivery */}
      {step === 2 && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{t.step2Title}</h2>
          <p style={{ fontSize: '13px', color: '#9AA0AE', marginBottom: '20px' }}>{t.step2Sub}</p>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px', display: 'block' }}>
              {t.titleOptional}
            </label>
            <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder={t.titlePh} style={{ width: '100%', fontSize: '14px', padding: '10px 14px', border: '1.5px solid #E4E7ED', borderRadius: '12px', background: 'white', outline: 'none', color: '#171A21', fontFamily: 'inherit' }} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>
              {t.descTh}
              <span style={{ fontSize: '11.5px', color: form.descTh.length > 280 ? '#F77F00' : '#9AA0AE', fontWeight: 400 }}>{form.descTh.length} / 300</span>
            </label>
            <textarea value={form.descTh} onChange={(e) => set('descTh', e.target.value.slice(0, 300))} rows={4} placeholder={t.descPh} style={{ width: '100%', fontSize: '14px', padding: '10px 14px', border: '1.5px solid #E4E7ED', borderRadius: '12px', background: 'white', outline: 'none', color: '#171A21', fontFamily: 'inherit', resize: 'vertical', minHeight: '100px' }} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>
              {t.descEn} <span style={{ fontSize: '11px', color: '#9AA0AE', fontWeight: 400 }}>({dict.common.optional})</span>
              <span style={{ fontSize: '11.5px', color: form.descEn.length > 280 ? '#F77F00' : '#9AA0AE', fontWeight: 400 }}>{form.descEn.length} / 300</span>
            </label>
            <textarea value={form.descEn} onChange={(e) => set('descEn', e.target.value.slice(0, 300))} rows={3} placeholder={t.descPh} style={{ width: '100%', fontSize: '14px', padding: '10px 14px', border: '1.5px solid #E4E7ED', borderRadius: '12px', background: 'white', outline: 'none', color: '#171A21', fontFamily: 'inherit', resize: 'vertical', minHeight: '80px' }} />
          </div>

          <div style={{ borderTop: '1px solid #F4F5F7', paddingTop: '24px', marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#171A21', marginBottom: '10px' }}>{t.budget}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {BUDGETS.map((b) => (
                <button key={b.id} onClick={() => set('budget', b.id)} style={chipStyle(form.budget === b.id)}>{b.label}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#171A21', marginBottom: '10px' }}>{t.timeline}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: form.timeline === 'specific_date' ? '12px' : '0' }}>
              {TIMELINES.map((tl) => (
                <button key={tl.id} onClick={() => set('timeline', tl.id)} style={chipStyle(form.timeline === tl.id)}>{tl.label}</button>
              ))}
              <button onClick={() => set('timeline', 'specific_date')} style={chipStyle(form.timeline === 'specific_date')}>
                {lang === 'th' ? '📅 เลือกวันที่' : '📅 Pick a date'}
              </button>
            </div>
            {form.timeline === 'specific_date' && (
              <input
                type="date"
                value={form.timelineDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => set('timelineDate', e.target.value)}
                style={{ padding: '10px 14px', border: '1.5px solid #0F6F73', borderRadius: '12px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', color: '#171A21', background: 'white', cursor: 'pointer' }}
              />
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep(1)} style={{ padding: '10px 20px', background: 'transparent', border: '1.5px solid #E4E7ED', color: '#444B5A', fontWeight: 600, fontSize: '14px', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
              ← {dict.common.back}
            </button>
            {(() => {
              const timelineReady = form.timeline && (form.timeline !== 'specific_date' || form.timelineDate);
              const canNext = !!(form.descTh && form.budget && timelineReady);
              return (
                <button onClick={() => canNext && setStep(3)} disabled={!canNext} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', borderRadius: '12px', cursor: canNext ? 'pointer' : 'not-allowed', opacity: canNext ? 1 : 0.5, fontFamily: 'inherit' }}>
                  {dict.common.next} →
                </button>
              );
            })()}
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{t.step4Title}</h2>
          <p style={{ fontSize: '13px', color: '#9AA0AE', marginBottom: '20px' }}>{t.step4Sub}</p>

          {(() => {
            const timelineDisplay = form.timeline === 'specific_date'
              ? (form.timelineDate ? new Date(form.timelineDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')
              : (TIMELINES.find((tl) => tl.id === form.timeline)?.label || '—');
            const rows = [
              { label: lang === 'th' ? 'บริการ' : 'Service', value: form.service },
              ...(form.title ? [{ label: lang === 'th' ? 'ชื่อโปรเจกต์' : 'Project Title', value: form.title }] : []),
              { label: lang === 'th' ? 'คำอธิบาย (ไทย)' : 'Description (TH)', value: form.descTh || '—' },
              ...(form.descEn ? [{ label: lang === 'th' ? 'คำอธิบาย (อังกฤษ)' : 'Description (EN)', value: form.descEn }] : []),
              { label: lang === 'th' ? 'งบประมาณ' : 'Budget', value: BUDGETS.find((b) => b.id === form.budget)?.label || '—' },
              { label: lang === 'th' ? 'วันที่ส่งงาน' : 'Service Delivered Date', value: timelineDisplay },
            ];
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {rows.map((row) => (
                  <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '12px', padding: '14px 0', borderBottom: '1px solid #F4F5F7' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9AA0AE' }}>{row.label}</span>
                    <span style={{ fontSize: '14px', color: '#171A21', whiteSpace: 'pre-wrap' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            );
          })()}

          <div style={{ background: 'linear-gradient(135deg, #F0F9F9, #E6F5F5)', border: '1.5px solid #2BBEC5', borderRadius: '14px', padding: '16px 20px', margin: '20px 0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F6F73', minWidth: '40px', textAlign: 'center' }}>
              {previewLoading ? '…' : (previewCount ?? '?')}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#171A21' }}>
                {lang === 'th' ? 'ผู้ให้บริการที่ตรงกัน' : 'Matching providers will be notified'}
              </div>
              <div style={{ fontSize: '12px', color: '#444B5A', marginTop: '2px' }}>
                {lang === 'th' ? 'ผู้ให้บริการ Premium ที่มีบริการตรงกันจะได้รับการแจ้งเตือนทาง LINE' : 'Premium providers with matching services get a LINE notification'}
              </div>
            </div>
          </div>

          {submitError && (
            <div style={{ background: '#FFF5F5', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#DC2626' }}>
              {submitError}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep(2)} style={{ padding: '10px 20px', background: 'transparent', border: '1.5px solid #E4E7ED', color: '#444B5A', fontWeight: 600, fontSize: '14px', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
              ← {dict.common.back}
            </button>
            <button onClick={handleSubmit} disabled={submitting} style={{ padding: '10px 28px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? t.submitting : t.submitBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
