'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Dictionary } from '@/dictionaries';

const PROVINCES = [
  'Bangkok', 'Amnat Charoen', 'Ang Thong', 'Bueng Kan', 'Buri Ram',
  'Chachoengsao', 'Chai Nat', 'Chaiyaphum', 'Chanthaburi', 'Chiang Mai',
  'Chiang Rai', 'Chon Buri', 'Chumphon', 'Kalasin', 'Kamphaeng Phet',
  'Kanchanaburi', 'Khon Kaen', 'Krabi', 'Lampang', 'Lamphun',
  'Loei', 'Lop Buri', 'Mae Hong Son', 'Maha Sarakham', 'Mukdahan',
  'Nakhon Nayok', 'Nakhon Pathom', 'Nakhon Phanom', 'Nakhon Ratchasima', 'Nakhon Sawan',
  'Nakhon Si Thammarat', 'Nan', 'Narathiwat', 'Nong Bua Lam Phu', 'Nong Khai',
  'Nonthaburi', 'Pathum Thani', 'Pattani', 'Phang Nga', 'Phatthalung',
  'Phayao', 'Phetchabun', 'Phetchaburi', 'Phichit', 'Phitsanulok',
  'Phra Nakhon Si Ayutthaya', 'Phrae', 'Phuket', 'Prachin Buri', 'Prachuap Khiri Khan',
  'Ranong', 'Ratchaburi', 'Rayong', 'Roi Et', 'Sa Kaeo',
  'Sakon Nakhon', 'Samut Prakan', 'Samut Sakhon', 'Samut Songkhram', 'Sara Buri',
  'Satun', 'Sing Buri', 'Si Sa Ket', 'Songkhla', 'Sukhothai',
  'Suphan Buri', 'Surat Thani', 'Surin', 'Tak', 'Trang',
  'Trat', 'Ubon Ratchathani', 'Udon Thani', 'Uthai Thani', 'Uttaradit',
  'Yala', 'Yasothon',
];

const TEAM_SIZES = ['1-5', '6-15', '16-50', '51-200', '200+'];

const INDUSTRIES = [
  'Accounting / Finance / Audit',
  'Advertising / Marketing / Promotion / PR',
  'Architecture / Interior Design',
  'Computer / IT / Software',
  'Consulting / Business Advisory',
  'Construction / Engineering',
  'Design / Creative',
  'E-commerce / Retail',
  'Education / Training',
  'Event Management / MICE',
  'Healthcare / Medical',
  'HR / Recruitment',
  'Insurance / Financial Services',
  'Legal / Law',
  'Logistics / Supply Chain',
  'Manufacturing',
  'Media / Publishing',
  'Photography / Videography',
  'Real Estate / Property',
  'Research & Market Research',
  'Security / Safety',
  'Translation / Localization',
  'Travel / Tourism / Hospitality',
  'Other',
];

interface MyCompanyFormProps {
  lang: string;
  dict: Dictionary;
  initialData?: {
    nameEn: string; nameTh: string; descEn: string; descTh: string;
    industry: string; province: string; address: string;
    teamSize: string; foundedYear: string; website: string;
    phone: string; emailPublic: string;
  };
}

const EMPTY = {
  nameEn: '', nameTh: '', descEn: '', descTh: '',
  industry: '', province: '', address: '',
  teamSize: '', foundedYear: '', website: '',
  phone: '', emailPublic: '',
};

export function MyCompanyForm({ lang, dict, initialData }: MyCompanyFormProps) {
  const t = dict.myCompany;
  const router = useRouter();
  const [form, setForm] = useState(initialData ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadError('');
    setUploadDone(false);
    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const ext = file.name.split('.').pop() ?? 'pdf';
      const path = `${user.id}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('company-docs').upload(path, file, { contentType: file.type || 'application/octet-stream' });
      if (error) throw error;
      setUploadDone(true);
    } catch (err: any) {
      setUploadError(err.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const set = (key: string, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Normalize website: add https:// if no protocol given
      let website = form.website.trim();
      if (website && !website.match(/^https?:\/\//i)) {
        website = 'https://' + website;
      }

      const payload = {
        name: form.nameEn || null,
        name_th: form.nameTh || null,
        description: form.descEn || null,
        description_th: form.descTh || null,
        industry: form.industry || null,
        province: form.province || null,
        address: form.address || null,
        team_size: form.teamSize || null,
        founded_year: form.foundedYear ? Number(form.foundedYear) : null,
        website: website || null,
        phone: form.phone || null,
        email: form.emailPublic || null,
        updated_at: new Date().toISOString(),
      };

      // Check if company exists for this user
      const { data: existing } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let error;
      if (existing?.id) {
        ({ error } = await supabase.from('companies').update(payload).eq('id', existing.id));
      } else {
        ({ error } = await supabase.from('companies').insert({ ...payload, user_id: user.id }));
      }

      if (error) throw error;
      setSaved(true);
      router.refresh();
    } catch (err: any) {
      console.error('Save failed:', err.message);
    } finally {
      setSaving(false);
    }
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
              <input type="text" value={form.nameEn} onChange={(e) => set('nameEn', e.target.value)} style={inputStyle} placeholder="Acme" />
            </div>
            <div>
              <label style={labelStyle}>{t.companyNameTh} <span style={{ background: '#FFF6EC', color: '#E06B00', fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>TH</span></label>
              <input type="text" value={form.nameTh} onChange={(e) => set('nameTh', e.target.value)} style={inputStyle} placeholder="แอคมี" />
            </div>
          </div>
          {/* Brand vs legal name hint */}
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 14px', background: '#F0F9F9', borderRadius: '10px', border: '1px solid rgba(15,111,115,0.12)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A9DA3" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span style={{ fontSize: '12px', color: '#6B7385', lineHeight: 1.55 }}>
              {lang === 'th'
                ? <>ใส่ <strong style={{ color: '#444B5A' }}>ชื่อทางการค้า</strong> ที่ลูกค้ารู้จัก (เช่น "Google") ไม่ใช่ชื่อนิติบุคคลจดทะเบียน (เช่น "Alphabet Inc.") — ชื่อนี้จะแสดงในผลการค้นหาและโปรไฟล์</>
                : <>Use your <strong style={{ color: '#444B5A' }}>trading / brand name</strong> — what clients know you as (e.g. "Acme"), not your DBD-registered legal entity name (e.g. "Acme Holdings Co., Ltd."). This is what appears in search results and your public profile.</>
              }
            </span>
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
            <input type="text" value={form.website} onChange={(e) => set('website', e.target.value)} style={inputStyle} placeholder={t.websitePh} />
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
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${uploadDone ? '#0F6F73' : '#C8CDD7'}`,
            borderRadius: '14px', padding: '32px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
            cursor: 'pointer', transition: 'all 150ms',
            background: uploadDone ? '#F0F9F9' : 'white',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#1A9DA3'; e.currentTarget.style.background = '#F0F9F9'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = uploadDone ? '#0F6F73' : '#C8CDD7'; e.currentTarget.style.background = uploadDone ? '#F0F9F9' : 'white'; }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'white', boxShadow: '0 2px 8px rgba(23,26,33,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {uploadDone
              ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
              : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            }
          </div>
          <div style={{ textAlign: 'center' }}>
            {uploading && <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F6F73' }}>Uploading…</div>}
            {uploadDone && <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F6F73' }}>✓ {uploadFile?.name}</div>}
            {!uploading && !uploadDone && (
              <>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#171A21' }}>{t.uploadDoc}</div>
                <div style={{ fontSize: '12px', color: '#9AA0AE', marginTop: '4px' }}>{t.uploadDocSub}</div>
              </>
            )}
            {uploadError && <div style={{ fontSize: '12px', color: '#FF5A5F', marginTop: '4px' }}>{uploadError}</div>}
            {uploadDone && <div style={{ fontSize: '12px', color: '#9AA0AE', marginTop: '4px' }}>{lang === 'th' ? 'คลิกเพื่ออัปโหลดใหม่' : 'Click to replace'}</div>}
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
