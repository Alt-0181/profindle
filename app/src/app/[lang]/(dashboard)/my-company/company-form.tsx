'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Dictionary } from '@/dictionaries';
import { SERVICES } from '@/lib/services';

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


function deriveIndustries(selected: string[]): string[] {
  if (!selected.length) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const s of selected) {
    const svc = SERVICES.find(v => v.label === s);
    if (svc && !seen.has(svc.industry)) { seen.add(svc.industry); result.push(svc.industry); }
  }
  return result;
}

function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase(); const t = target.toLowerCase();
  if (t.includes(q)) return true;
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) { if (t[i] === q[qi]) qi++; }
  return qi === q.length;
}

interface MyCompanyFormProps {
  lang: string;
  dict: Dictionary;
  initialData?: {
    nameEn: string; nameTh: string; descEn: string; descTh: string;
    province: string; address: string;
    teamSize: string; foundedYear: string; website: string;
    phone: string; emailPublic: string;
    lineIdType: 'oa' | 'id' | 'phone'; lineIdValue: string;
    dbdCertPath: string | null; dbdCertName: string | null;
    services: string[];
    logoUrl: string | null; bannerUrl: string | null;
  };
}

const EMPTY = {
  nameEn: '', nameTh: '', descEn: '', descTh: '',
  province: '', address: '',
  teamSize: '', foundedYear: '', website: '',
  phone: '', emailPublic: '', lineIdType: 'id' as 'oa' | 'id' | 'phone', lineIdValue: '',
};

export function MyCompanyForm({ lang, dict, initialData }: MyCompanyFormProps) {
  const t = dict.myCompany;
  const router = useRouter();
  const [form, setForm] = useState(initialData ?? EMPTY);
  const [selectedServices, setSelectedServices] = useState<string[]>(initialData?.services ?? []);
  const [serviceSearch, setServiceSearch] = useState('');
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  // Only treat as "done" if we have both a path AND a name (i.e. new-format uploads)
  const hasNamedCert = !!(initialData?.dbdCertPath && initialData?.dbdCertName);
  const [uploadDone, setUploadDone] = useState(hasNamedCert);
  const [uploadError, setUploadError] = useState('');
  const [dbdPath, setDbdPath] = useState<string | null>(initialData?.dbdCertPath ?? null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!dbdPath || uploadFile) return;
    const supabase = createClient();
    supabase.storage.from('company-docs').createSignedUrl(dbdPath, 3600).then(({ data }) => {
      if (data?.signedUrl) setPreviewUrl(data.signedUrl);
    });
  }, [dbdPath]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadError('');
    setUploadDone(false);
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const ext = file.name.split('.').pop() ?? 'pdf';
      const path = `${user.id}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('company-docs').upload(path, file, { contentType: file.type || 'application/octet-stream' });
      if (error) throw error;
      setDbdPath(path);
      setUploadDone(true);
      // Save path + original name to DB if company already exists
      await supabase.from('companies').update({ dbd_certificate_url: path, dbd_certificate_name: file.name }).eq('user_id', user.id);
    } catch (err: any) {
      setUploadError(err.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getCertFileName = () => {
    if (uploadFile) return uploadFile.name;
    if (initialData?.dbdCertName) return initialData.dbdCertName;
    return null;
  };

  const [logoUrl, setLogoUrl] = useState<string | null>(initialData?.logoUrl ?? null);
  const [logoDisplayUrl, setLogoDisplayUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState('');
  const [bannerUrl, setBannerUrl] = useState<string | null>(initialData?.bannerUrl ?? null);
  const [bannerDisplayUrl, setBannerDisplayUrl] = useState<string | null>(null);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerError, setBannerError] = useState('');
  const [bannerHover, setBannerHover] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    setLogoError('');
    const blob = URL.createObjectURL(file);
    setLogoDisplayUrl(blob);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'logo');
      const res = await fetch('/api/company-upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      setLogoUrl(data.url);
      setLogoDisplayUrl(data.url + '?v=' + Date.now());
      URL.revokeObjectURL(blob);
    } catch (err: any) {
      setLogoError(err.message);
      setLogoDisplayUrl(null);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerUploading(true);
    setBannerError('');
    const blob = URL.createObjectURL(file);
    setBannerDisplayUrl(blob);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'banner');
      const res = await fetch('/api/company-upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      setBannerUrl(data.url);
      setBannerDisplayUrl(data.url + '?v=' + Date.now());
      URL.revokeObjectURL(blob);
    } catch (err: any) {
      setBannerError(err.message);
      setBannerDisplayUrl(null);
    } finally {
      setBannerUploading(false);
    }
  };

  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const handleDownload = async () => {
    if (!dbdPath || downloading) return;
    const fileName = getCertFileName() ?? 'DBD_Certificate.pdf';
    setDownloading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.storage.from('company-docs').createSignedUrl(dbdPath, 300);
      if (error || !data?.signedUrl) throw new Error('Could not generate download link');
      const response = await fetch(data.signedUrl);
      if (!response.ok) throw new Error('File fetch failed');
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = fileName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(objectUrl); }, 1000);
    } catch (err: any) {
      setDownloadError(lang === 'th' ? 'ดาวน์โหลดไม่สำเร็จ — กรุณาลองใหม่' : 'Download failed — please try again');
    } finally {
      setDownloading(false);
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
        services: selectedServices.length > 0 ? selectedServices : null,
        industry: deriveIndustries(selectedServices)[0] || null,
        province: form.province || null,
        address: form.address || null,
        team_size: form.teamSize || null,
        founded_year: form.foundedYear ? Number(form.foundedYear) : null,
        website: website || null,
        phone: form.phone || null,
        email: form.emailPublic || null,
        line_id: form.lineIdValue ? `${form.lineIdType}:${form.lineIdValue.trim()}` : null,
        ...(dbdPath ? { dbd_certificate_url: dbdPath, dbd_certificate_name: uploadFile?.name ?? initialData?.dbdCertName ?? null } : {}),
        ...(logoUrl ? { logo_url: logoUrl } : {}),
        ...(bannerUrl ? { banner_url: bannerUrl } : {}),
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

  const logoSrc = logoDisplayUrl ?? logoUrl;
  const bannerSrc = bannerDisplayUrl ?? bannerUrl;
  const logoInitial = (form.nameEn || form.nameTh || 'A').slice(0, 2).toUpperCase();

  return (
    <form onSubmit={handleSave}>
      {/* Profile Branding */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#171A21' }}>
              {lang === 'th' ? 'แบรนด์โปรไฟล์' : 'Profile Branding'}
            </div>
            <div style={{ fontSize: '13px', color: '#9AA0AE', marginTop: '1px' }}>
              {lang === 'th' ? 'อัพโหลดโลโก้และแบนเนอร์เพื่อสร้างความโดดเด่น' : 'Upload your logo and banner to stand out in search'}
            </div>
          </div>
        </div>

        {/* Banner upload */}
        <input ref={bannerInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBannerChange} />
        <div
          onClick={() => !bannerUploading && bannerInputRef.current?.click()}
          onMouseEnter={() => setBannerHover(true)}
          onMouseLeave={() => setBannerHover(false)}
          style={{
            position: 'relative', width: '100%', paddingBottom: '38%',
            borderRadius: '14px', overflow: 'hidden',
            cursor: bannerUploading ? 'wait' : 'pointer',
            marginBottom: '20px',
            border: `2px dashed ${bannerSrc ? 'transparent' : '#C8CDD7'}`,
            background: bannerSrc ? 'none' : 'linear-gradient(135deg, #0E1017, #0F6F73)',
          }}
        >
          {bannerSrc && (
            <img src={bannerSrc} alt="Banner" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          )}

          {/* Overlay */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {!bannerSrc && !bannerUploading && (
              <>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                  {lang === 'th' ? 'อัพโหลดแบนเนอร์ของคุณ' : 'Upload your banner'}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                  {lang === 'th' ? 'ขนาดปกเฟซบุ๊ก (820×312px) หรือกว้างกว่า' : 'Facebook cover size (820×312px) or wider'}
                </div>
              </>
            )}
            {bannerUploading && (
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', background: 'rgba(0,0,0,0.5)', padding: '8px 20px', borderRadius: '999px' }}>
                {lang === 'th' ? 'กำลังอัพโหลด…' : 'Uploading…'}
              </div>
            )}
            {bannerSrc && !bannerUploading && bannerHover && (
              <div style={{ background: 'rgba(0,0,0,0.55)', padding: '8px 18px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>
                  {lang === 'th' ? 'เปลี่ยนแบนเนอร์' : 'Change Banner'}
                </span>
              </div>
            )}
          </div>
        </div>
        {bannerError && <div style={{ fontSize: '12px', color: '#FF5A5F', marginBottom: '12px' }}>{bannerError}</div>}

        {/* Logo upload */}
        <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
          <div
            onClick={() => !logoUploading && logoInputRef.current?.click()}
            style={{
              width: '86px', height: '86px', borderRadius: '18px', flexShrink: 0,
              background: logoSrc ? 'none' : 'linear-gradient(135deg, #0E1017, #0F6F73)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: logoUploading ? 'wait' : 'pointer', position: 'relative', overflow: 'hidden',
              border: '2.5px solid rgba(255,255,255,0.15)',
              boxShadow: '0 2px 12px rgba(14,16,23,0.15)',
            }}
          >
            {logoSrc ? (
              <img src={logoSrc} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '26px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{logoInitial}</span>
            )}
            {logoUploading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'white' }}>…</div>
              </div>
            )}
          </div>
          <div style={{ paddingTop: '6px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#171A21', marginBottom: '5px' }}>
              {lang === 'th' ? 'โลโก้บริษัท' : 'Company Logo'}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7385', lineHeight: 1.65 }}>
              {lang === 'th'
                ? 'คลิกที่กรอบเพื่ออัพโหลดโลโก้\nแนะนำ: ภาพสี่เหลี่ยม PNG หรือ JPG ขนาดไม่ต่ำกว่า 200×200px'
                : <>Click the square to upload your logo.<br />Recommended: square PNG or JPG, min 200×200px.</>
              }
            </div>
            {logoError && <div style={{ fontSize: '12px', color: '#FF5A5F', marginTop: '5px' }}>{logoError}</div>}
          </div>
        </div>
      </div>

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

        {/* Services multi-select with fuzzy search */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>
            {lang === 'th' ? 'บริการของคุณ' : 'Services'}
          </label>

          {/* Selected service tags */}
          {selectedServices.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {selectedServices.map(s => (
                <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#F0F9F9', color: '#0F6F73', fontSize: '12px', fontWeight: 600, padding: '4px 10px 4px 12px', borderRadius: '999px', border: '1px solid rgba(15,111,115,0.2)' }}>
                  {s}
                  <button
                    type="button"
                    onClick={() => setSelectedServices(prev => prev.filter(x => x !== s))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9AA0AE', padding: '0 0 0 2px', fontSize: '16px', lineHeight: 1, display: 'flex', alignItems: 'center' }}
                  >×</button>
                </span>
              ))}
            </div>
          )}

          {/* Search input */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={serviceSearch}
              onChange={e => { setServiceSearch(e.target.value); setShowServiceSuggestions(true); }}
              onFocus={() => setShowServiceSuggestions(true)}
              onBlur={() => setTimeout(() => setShowServiceSuggestions(false), 150)}
              placeholder={lang === 'th' ? 'พิมพ์เพื่อค้นหาบริการ เช่น "กราฟิก", "Marketing"…' : 'Type to search, e.g. "Design", "Marketing", "IT"…'}
              style={inputStyle}
            />
            {showServiceSuggestions && serviceSearch.length >= 1 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'white', border: '1px solid #E4E7ED', borderRadius: '12px', boxShadow: '0 8px 24px rgba(23,26,33,0.12)', zIndex: 50, maxHeight: '280px', overflowY: 'auto' }}>
                {SERVICES.filter(s => !selectedServices.includes(s.label) && fuzzyMatch(serviceSearch, s.label)).slice(0, 8).map(s => (
                  <div
                    key={s.label}
                    onMouseDown={() => { setSelectedServices(prev => [...prev, s.label]); setServiceSearch(''); setShowServiceSuggestions(false); setSaved(false); }}
                    style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F4F5F7' }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#F8FFFE'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'white'}
                  >
                    <span style={{ fontSize: '13px', color: '#171A21' }}>{s.label}</span>
                    <span style={{ fontSize: '11px', color: '#9AA0AE' }}>{s.industry.split(' / ')[0]}</span>
                  </div>
                ))}
                {SERVICES.filter(s => !selectedServices.includes(s.label) && fuzzyMatch(serviceSearch, s.label)).length === 0 && (
                  <div style={{ padding: '12px 14px', fontSize: '13px', color: '#9AA0AE' }}>No matching services</div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Province */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>{t.province}</label>
          <select value={form.province} onChange={(e) => set('province', e.target.value)} style={inputStyle}>
            <option value="">{t.selectProvince}</option>
            {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>{t.phone}</label>
            <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} style={inputStyle} placeholder={t.phonePh} />
          </div>
          <div>
            <label style={labelStyle}>{t.emailPublic}</label>
            <input type="email" value={form.emailPublic} onChange={(e) => set('emailPublic', e.target.value)} style={inputStyle} placeholder={t.emailPublicPh} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>
            LINE <span style={{ fontWeight: 400, color: '#9AA0AE', fontSize: '12px' }}>({lang === 'th' ? 'ไม่บังคับ' : 'optional'})</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '8px' }}>
            <select
              value={form.lineIdType}
              onChange={(e) => setForm(f => ({ ...f, lineIdType: e.target.value as 'oa' | 'id' | 'phone' }))}
              style={inputStyle}
            >
              <option value="oa">{lang === 'th' ? 'Official Account' : 'Official Account'}</option>
              <option value="id">{lang === 'th' ? 'LINE ID' : 'LINE ID'}</option>
              <option value="phone">{lang === 'th' ? 'เบอร์โทรศัพท์' : 'Phone Number'}</option>
            </select>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              {form.lineIdType === 'oa' && (
                <span style={{ position: 'absolute', left: '14px', fontSize: '14px', fontWeight: 700, color: '#06C755', pointerEvents: 'none', userSelect: 'none' }}>@</span>
              )}
              <input
                type={form.lineIdType === 'phone' ? 'tel' : 'text'}
                value={form.lineIdValue}
                onChange={(e) => setForm(f => ({ ...f, lineIdValue: e.target.value }))}
                style={{ ...inputStyle, paddingLeft: form.lineIdType === 'oa' ? '28px' : '14px' }}
                placeholder={
                  form.lineIdType === 'oa' ? (lang === 'th' ? 'profindle' : 'profindle') :
                  form.lineIdType === 'phone' ? (lang === 'th' ? '0812345678' : '0812345678') :
                  (lang === 'th' ? 'yourlineid' : 'yourlineid')
                }
              />
            </div>
          </div>
          <div style={{ fontSize: '11.5px', color: '#9AA0AE', marginTop: '5px' }}>
            {lang === 'th'
              ? 'ผู้ให้บริการจะเห็น LINE ของคุณบนหน้าคำขอ'
              : 'Providers will see your LINE contact on the broadcast detail page'}
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
            {uploadDone && (
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F6F73' }}>
                ✓ {getCertFileName()}
              </div>
            )}
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

        {/* File attachment card — only show when we know the filename */}
        {getCertFileName() && !uploading && (
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#F0F9F9', borderRadius: '10px', border: '1px solid rgba(15,111,115,0.15)' }} onClick={e => e.stopPropagation()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
            </svg>
            <span style={{ fontSize: '13px', color: '#0F6F73', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {getCertFileName()}
            </span>
            <button onClick={handleDownload} disabled={downloading} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '7px', background: 'white', border: '1px solid rgba(15,111,115,0.2)', color: '#0F6F73', fontSize: '12px', fontWeight: 600, cursor: downloading ? 'wait' : 'pointer', fontFamily: 'inherit', flexShrink: 0, opacity: downloading ? 0.6 : 1 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              {downloading ? '…' : (lang === 'th' ? 'ดาวน์โหลด' : 'Download')}
            </button>
          </div>
        )}
        {downloadError && (
          <div style={{ marginTop: '6px', fontSize: '12px', color: '#FF5A5F', paddingLeft: '4px' }}>{downloadError}</div>
        )}
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
