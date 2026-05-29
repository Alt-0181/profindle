'use client';

import { useState } from 'react';
import type { Dictionary } from '@/dictionaries';

const PROVINCES = [
  'Bangkok', 'Chiang Mai', 'Phuket', 'Khon Kaen', 'Chon Buri',
  'Nakhon Ratchasima', 'Udon Thani', 'Songkhla', 'Surat Thani', 'Nonthaburi',
  'Other',
];

const TEAM_SIZES = ['1-5', '6-15', '16-50', '51-200', '200+'];

const INDUSTRIES = [
  'Advertising / Marketing / Promotion / PR',
  'Architecture / Interior Design',
  'Consulting',
  'Computer / IT',
  'Design / Creative',
  'Education / Training',
  'HR / Recruitment',
  'Legal / Law',
  'Logistics / Supply Chain',
  'Manufacturing',
  'Media / Publishing',
  'Other',
];

interface MyCompanyFormProps {
  lang: string;
  dict: Dictionary;
}

const DEMO = {
  nameEn: 'Jaidee Solutions Co., Ltd.',
  nameTh: 'บริษัท ใจดี โซลูชั่นส์ จำกัด',
  descEn: '',
  descTh: '',
  industry: 'Computer / IT',
  province: 'Bangkok',
  address: '',
  teamSize: '6-15',
  foundedYear: '',
  website: '',
  phone: '',
  emailPublic: 'somchai@jaidee.co.th',
};

export function MyCompanyForm({ lang, dict }: MyCompanyFormProps) {
  const t = dict.myCompany;
  const [form, setForm] = useState(DEMO);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (key: string, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', fontSize: '14px', padding: '10px 14px',
    border: '1.5px solid #E4E7ED', borderRadius: '12px',
    background: 'white', outline: 'none', color: '#171A21', fontFamily: 'inherit',
    transition: 'all 150ms',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px',
  };

  const sectionStyle: React.CSSProperties = {
    background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)',
    padding: '28px', marginBottom: '20px',
  };

  return (
    <form onSubmit={handleSave}>
      {/* Basic Information */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#171A21' }}>{t.basicInfo}</div>
            <div style={{ fontSize: '13px', color: '#9AA0AE', marginTop: '1px' }}>{t.basicInfoSub}</div>
          </div>
        </div>

        {/* Bilingual company name */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>{t.companyNameEn} <span style={{ background: '#F0F9F9', color: '#0F6F73', fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>EN</span></label>
              <input type="text" value={form.nameEn} onChange={(e) => set('nameEn', e.target.value)} style={inputStyle} placeholder="Acme Co., Ltd." />
            </div>
            <div>
              <label style={labelStyle}>{t.companyNameTh} <span style={{ background: '#FFF6EC', color: '#E06B00', fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>TH</span></label>
              <input type="text" value={form.nameTh} onChange={(e) => set('nameTh', e.target.value)} style={inputStyle} placeholder="บริษัท … จำกัด" />
            </div>
          </div>
        </div>

        {/* Bilingual description */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>{t.descriptionEn} <span style={{ background: '#F0F9F9', color: '#0F6F73', fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>EN</span></label>
              <textarea value={form.descEn} onChange={(e) => set('descEn', e.target.value)} rows={4} style={{ ...inputStyle, minHeight: '96px', resize: 'vertical' }} placeholder={t.descPh} />
            </div>
            <div>
              <label style={labelStyle}>{t.descriptionTh} <span style={{ background: '#FFF6EC', color: '#E06B00', fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>TH</span></label>
              <textarea value={form.descTh} onChange={(e) => set('descTh', e.target.value)} rows={4} style={{ ...inputStyle, minHeight: '96px', resize: 'vertical' }} placeholder={t.descPh} />
            </div>
          </div>
        </div>

        {/* Industry + Province */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>{t.industry}</label>
            <select value={form.industry} onChange={(e) => set('industry', e.target.value)} style={inputStyle}>
              <option value="">{t.selectIndustry}</option>
              {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>{t.province}</label>
            <select value={form.province} onChange={(e) => set('province', e.target.value)} style={inputStyle}>
              <option value="">{t.selectProvince}</option>
              {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Team size + Founded year */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>{t.teamSize}</label>
            <select value={form.teamSize} onChange={(e) => set('teamSize', e.target.value)} style={inputStyle}>
              <option value="">{t.selectTeamSize}</option>
              {TEAM_SIZES.map((s) => <option key={s} value={s}>{s} {lang === 'th' ? 'คน' : 'employees'}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>{t.foundedYear}</label>
            <input type="number" value={form.foundedYear} onChange={(e) => set('foundedYear', e.target.value)} min={1900} max={2026} style={inputStyle} placeholder="2020" />
          </div>
        </div>

        {/* Address + Website */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>{t.address}</label>
            <input type="text" value={form.address} onChange={(e) => set('address', e.target.value)} style={inputStyle} placeholder={t.addressPh} />
          </div>
          <div>
            <label style={labelStyle}>{t.website}</label>
            <input type="url" value={form.website} onChange={(e) => set('website', e.target.value)} style={inputStyle} placeholder={t.websitePh} />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div style={sectionStyle}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#171A21', marginBottom: '20px' }}>{t.contactInfo}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>{t.phone}</label>
            <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} style={inputStyle} placeholder={t.phonePh} />
          </div>
          <div>
            <label style={labelStyle}>{t.emailPublic}</label>
            <input type="email" value={form.emailPublic} onChange={(e) => set('emailPublic', e.target.value)} style={inputStyle} placeholder={t.emailPublicPh} />
          </div>
        </div>
      </div>

      {/* Verification */}
      <div style={sectionStyle}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{t.verification}</div>
        <div style={{ fontSize: '13px', color: '#9AA0AE', marginBottom: '20px' }}>{t.verificationSub}</div>
        <div style={{
          border: '2px dashed #C8CDD7', borderRadius: '14px', padding: '32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
          cursor: 'pointer', transition: 'all 150ms',
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'white', boxShadow: '0 2px 8px rgba(23,26,33,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#171A21' }}>{t.uploadDoc}</div>
            <div style={{ fontSize: '12px', color: '#9AA0AE', marginTop: '4px' }}>{t.uploadDocSub}</div>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div style={{
        position: 'sticky', bottom: 0, background: 'white',
        borderTop: '1px solid #E4E7ED', padding: '16px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px',
        marginTop: '20px',
      }}>
        {saved && (
          <span style={{ fontSize: '13px', color: '#0F6F73', fontWeight: 600 }}>✓ {t.savedSuccess}</span>
        )}
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '10px 24px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)',
            color: 'white', fontWeight: 600, fontSize: '14px',
            border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? t.saving : t.saveChanges}
        </button>
      </div>
    </form>
  );
}
