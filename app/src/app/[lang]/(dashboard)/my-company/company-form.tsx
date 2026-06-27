'use client';

import { useState, useRef, useEffect } from 'react';
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

const SERVICES: { label: string; industry: string }[] = [

  // === ACCOUNTING / FINANCE / AUDIT ===
  { label: 'Accounting', industry: 'Accounting / Finance / Audit' },
  { label: 'Audit & Assurance', industry: 'Accounting / Finance / Audit' },
  { label: 'Bookkeeping', industry: 'Accounting / Finance / Audit' },
  { label: 'Debt Consulting', industry: 'Accounting / Finance / Audit' },
  { label: 'Financial Planning', industry: 'Accounting / Finance / Audit' },
  { label: 'Payroll Services', industry: 'Accounting / Finance / Audit' },
  { label: 'Tax Filing', industry: 'Accounting / Finance / Audit' },
  { label: 'Tax Planning', industry: 'Accounting / Finance / Audit' },

  // === ADVERTISING / MARKETING / PROMOTION / PR ===
  { label: 'Advertising', industry: 'Advertising / Marketing / Promotion / PR' },
  { label: 'Brand Strategy', industry: 'Advertising / Marketing / Promotion / PR' },
  { label: 'Content Marketing', industry: 'Advertising / Marketing / Promotion / PR' },
  { label: 'Copywriting', industry: 'Advertising / Marketing / Promotion / PR' },
  { label: 'Digital Marketing', industry: 'Advertising / Marketing / Promotion / PR' },
  { label: 'Influencer Marketing', industry: 'Advertising / Marketing / Promotion / PR' },
  { label: 'PR / Public Relations', industry: 'Advertising / Marketing / Promotion / PR' },
  { label: 'SEO / SEM', industry: 'Advertising / Marketing / Promotion / PR' },
  { label: 'Social Media Marketing', industry: 'Advertising / Marketing / Promotion / PR' },

  // === ARCHITECTURE / INTERIOR DESIGN ===
  { label: 'Architecture', industry: 'Architecture / Interior Design' },
  { label: 'Interior Design', industry: 'Architecture / Interior Design' },
  { label: 'Space Planning', industry: 'Architecture / Interior Design' },

  // === COMPUTER / IT / SOFTWARE ===
  { label: 'AI / Machine Learning', industry: 'Computer / IT / Software' },
  { label: 'Blockchain / Crypto Development', industry: 'Computer / IT / Software' },
  { label: 'Cloud Computing', industry: 'Computer / IT / Software' },
  { label: 'Cybersecurity', industry: 'Computer / IT / Software' },
  { label: 'Data Analytics', industry: 'Computer / IT / Software' },
  { label: 'Data Recovery', industry: 'Computer / IT / Software' },
  { label: 'Desktop Application', industry: 'Computer / IT / Software' },
  { label: 'E-commerce Development', industry: 'Computer / IT / Software' },
  { label: 'ERP / CRM Systems', industry: 'Computer / IT / Software' },
  { label: 'Game Development', industry: 'Computer / IT / Software' },
  { label: 'IoT Solutions', industry: 'Computer / IT / Software' },
  { label: 'IT Consulting', industry: 'Computer / IT / Software' },
  { label: 'IT Project Management', industry: 'Computer / IT / Software' },
  { label: 'IT Support & Helpdesk', industry: 'Computer / IT / Software' },
  { label: 'Mobile App Development', industry: 'Computer / IT / Software' },
  { label: 'Network & Infrastructure', industry: 'Computer / IT / Software' },
  { label: 'QA / Software Testing', industry: 'Computer / IT / Software' },
  { label: 'RPA / Process Automation', industry: 'Computer / IT / Software' },
  { label: 'Software Development', industry: 'Computer / IT / Software' },
  { label: 'Web Development', industry: 'Computer / IT / Software' },
  { label: 'Website Maintenance', industry: 'Computer / IT / Software' },
  { label: 'WordPress Development', industry: 'Computer / IT / Software' },

  // === CONSULTING / BUSINESS ADVISORY ===
  { label: 'Business Consulting', industry: 'Consulting / Business Advisory' },
  { label: 'Management Consulting', industry: 'Consulting / Business Advisory' },
  { label: 'Market Research', industry: 'Consulting / Business Advisory' },
  { label: 'Operations Consulting', industry: 'Consulting / Business Advisory' },
  { label: 'Strategy Consulting', industry: 'Consulting / Business Advisory' },
  { label: 'Survey & Research', industry: 'Consulting / Business Advisory' },

  // === CONSTRUCTION / ENGINEERING ===
  { label: 'Civil Engineering', industry: 'Construction / Engineering' },
  { label: 'Construction', industry: 'Construction / Engineering' },
  { label: 'Project Management', industry: 'Construction / Engineering' },
  { label: 'Renovation', industry: 'Construction / Engineering' },

  // === DESIGN / CREATIVE ===
  { label: 'Art & Illustration', industry: 'Design / Creative' },
  { label: 'Branding & Identity', industry: 'Design / Creative' },
  { label: 'Graphic Design', industry: 'Design / Creative' },
  { label: 'Motion Graphics', industry: 'Design / Creative' },
  { label: 'Packaging Design', industry: 'Design / Creative' },
  { label: 'Presentation Design', industry: 'Design / Creative' },
  { label: 'UI/UX Design', industry: 'Design / Creative' },

  // === EDUCATION / TRAINING ===
  { label: 'Coaching', industry: 'Education / Training' },
  { label: 'Corporate Training', industry: 'Education / Training' },
  { label: 'E-Learning', industry: 'Education / Training' },
  { label: 'Language Instruction', industry: 'Education / Training' },
  { label: 'Private Tutoring', industry: 'Education / Training' },

  // === EVENT MANAGEMENT / MICE ===
  { label: 'Catering', industry: 'Event Management' },
  { label: 'Conference & MICE', industry: 'Event Management' },
  { label: 'Corporate Events', industry: 'Event Management' },
  { label: 'DJ / Entertainment', industry: 'Event Management' },
  { label: 'Event Emcee / MC', industry: 'Event Management' },
  { label: 'Event Management', industry: 'Event Management' },
  { label: 'Exhibition Organizer', industry: 'Event Management' },
  { label: 'Floral Design', industry: 'Event Management' },
  { label: 'Stage & Lighting', industry: 'Event Management' },
  { label: 'Talent Booking', industry: 'Event Management' },
  { label: 'Venue Sourcing', industry: 'Event Management' },

  // === HEALTHCARE / MEDICAL / WELLNESS ===
  { label: 'Corporate Wellness', industry: 'Healthcare / Medical / Wellness' },
  { label: 'Healthcare Consulting', industry: 'Healthcare / Medical / Wellness' },
  { label: 'Occupational Health', industry: 'Healthcare / Medical / Wellness' },

  // === HR / RECRUITMENT ===
  { label: 'Event Staffing', industry: 'HR / Recruitment' },
  { label: 'Executive Search', industry: 'HR / Recruitment' },
  { label: 'HR Consulting', industry: 'HR / Recruitment' },
  { label: 'Recruitment', industry: 'HR / Recruitment' },
  { label: 'Temporary Staffing', industry: 'HR / Recruitment' },

  // === LEGAL / LAW / COMPLIANCE ===
  { label: 'Business Licensing', industry: 'Legal / Law / Compliance' },
  { label: 'Company Registration', industry: 'Legal / Law / Compliance' },
  { label: 'Contract Review', industry: 'Legal / Law / Compliance' },
  { label: 'FDA / Regulatory Filing', industry: 'Legal / Law / Compliance' },
  { label: 'Legal Consulting', industry: 'Legal / Law / Compliance' },
  { label: 'Patent & Trademark', industry: 'Legal / Law / Compliance' },
  { label: 'Visa & Work Permit', industry: 'Legal / Law / Compliance' },

  // === LOGISTICS / SUPPLY CHAIN ===
  { label: 'Freight & Shipping', industry: 'Logistics / Supply Chain' },
  { label: 'Logistics', industry: 'Logistics / Supply Chain' },
  { label: 'Supply Chain Consulting', industry: 'Logistics / Supply Chain' },

  // === MAINTENANCE & TECHNICAL ===
  { label: 'AC Service & Repair', industry: 'Maintenance / Technical Services' },
  { label: 'Electrical Services', industry: 'Maintenance / Technical Services' },
  { label: 'Facility Maintenance', industry: 'Maintenance / Technical Services' },
  { label: 'Pest Control', industry: 'Maintenance / Technical Services' },
  { label: 'Plumbing Services', industry: 'Maintenance / Technical Services' },
  { label: 'Repair Services', industry: 'Maintenance / Technical Services' },

  // === MANUFACTURING & OEM ===
  { label: 'Clothing Manufacturing', industry: 'Manufacturing / OEM' },
  { label: 'Cosmetics Manufacturing', industry: 'Manufacturing / OEM' },
  { label: 'Food & Supplement Manufacturing', industry: 'Manufacturing / OEM' },
  { label: 'OEM / Contract Manufacturing', industry: 'Manufacturing / OEM' },
  { label: 'Packaging Manufacturing', industry: 'Manufacturing / OEM' },

  // === MEDIA, PHOTO & VIDEO ===
  { label: 'Animation', industry: 'Media / Photography / Video' },
  { label: 'Color Grading', industry: 'Media / Photography / Video' },
  { label: 'Drone Photography', industry: 'Media / Photography / Video' },
  { label: 'Live Streaming', industry: 'Media / Photography / Video' },
  { label: 'Photography', industry: 'Media / Photography / Video' },
  { label: 'Podcast Production', industry: 'Media / Photography / Video' },
  { label: 'Product Photography', industry: 'Media / Photography / Video' },
  { label: 'Subtitling', industry: 'Media / Photography / Video' },
  { label: 'VFX & CGI', industry: 'Media / Photography / Video' },
  { label: 'Video Editing', industry: 'Media / Photography / Video' },
  { label: 'Video Production', industry: 'Media / Photography / Video' },
  { label: 'Videography', industry: 'Media / Photography / Video' },

  // === MUSIC & AUDIO ===
  { label: 'Audio Recording', industry: 'Music / Audio' },
  { label: 'Jingle Production', industry: 'Music / Audio' },
  { label: 'Mixing & Mastering', industry: 'Music / Audio' },
  { label: 'Music Production', industry: 'Music / Audio' },
  { label: 'Sound Design', industry: 'Music / Audio' },
  { label: 'Sound Engineering', industry: 'Music / Audio' },
  { label: 'Voiceover', industry: 'Music / Audio' },

  // === PRINT & PRODUCTION ===
  { label: 'Brochure & Flyer', industry: 'Print / Production' },
  { label: 'Printing', industry: 'Print / Production' },
  { label: 'Signage', industry: 'Print / Production' },

  // === REAL ESTATE & PROPERTY ===
  { label: 'Property Management', industry: 'Real Estate / Property' },
  { label: 'Real Estate Consulting', industry: 'Real Estate / Property' },

  // === SECURITY SERVICES ===
  { label: 'Bodyguard', industry: 'Security / Safety' },
  { label: 'Security Services', industry: 'Security / Safety' },

  // === TRANSLATION & LOCALIZATION ===
  { label: 'Interpretation', industry: 'Translation / Localization' },
  { label: 'Localization', industry: 'Translation / Localization' },
  { label: 'Proofreading', industry: 'Translation / Localization' },
  { label: 'Translation', industry: 'Translation / Localization' },

  // === TRAVEL & HOSPITALITY ===
  { label: 'Hospitality Consulting', industry: 'Travel / Tourism / Hospitality' },
  { label: 'Tourism Planning', industry: 'Travel / Tourism / Hospitality' },

  // === VEHICLE RENTAL ===
  { label: 'Car Rental', industry: 'Vehicle Rental' },
  { label: 'Van Rental', industry: 'Vehicle Rental' },
  { label: 'Vehicle Rental', industry: 'Vehicle Rental' },

  // === WRITING & CONTENT ===
  { label: 'Article Writing', industry: 'Writing / Content' },
  { label: 'Data Entry', industry: 'Writing / Content' },
  { label: 'Script Writing', industry: 'Writing / Content' },

  // === TRADING / DISTRIBUTION / IMPORT-EXPORT ===
  { label: 'Brand Distribution / Sole Agent', industry: 'Trading / Distribution / Import-Export' },
  { label: 'Cross-border E-commerce', industry: 'Trading / Distribution / Import-Export' },
  { label: 'Franchise Distribution', industry: 'Trading / Distribution / Import-Export' },
  { label: 'Import / Export', industry: 'Trading / Distribution / Import-Export' },
  { label: 'Product Distribution', industry: 'Trading / Distribution / Import-Export' },
  { label: 'Wholesale Trading', industry: 'Trading / Distribution / Import-Export' },

  // === CONSUMER GOODS / BRAND MANAGEMENT ===
  { label: 'Brand Licensing / IP Licensing', industry: 'Consumer Goods / Brand Management' },
  { label: 'Consumer Brand Management', industry: 'Consumer Goods / Brand Management' },
  { label: 'E-commerce Brand Management', industry: 'Consumer Goods / Brand Management' },
  { label: 'Private Label / House Brand', industry: 'Consumer Goods / Brand Management' },
  { label: 'Product Portfolio Management', industry: 'Consumer Goods / Brand Management' },
  { label: 'Retail Channel Management', industry: 'Consumer Goods / Brand Management' },
];

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
    dbdCertPath: string | null; dbdCertName: string | null;
    services: string[];
  };
}

const EMPTY = {
  nameEn: '', nameTh: '', descEn: '', descTh: '',
  province: '', address: '',
  teamSize: '', foundedYear: '', website: '',
  phone: '', emailPublic: '',
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
        ...(dbdPath ? { dbd_certificate_url: dbdPath, dbd_certificate_name: uploadFile?.name ?? initialData?.dbdCertName ?? null } : {}),
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

        {/* Services multi-select with fuzzy search */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>
            {lang === 'th' ? 'บริการของคุณ' : 'Services'}
            <span style={{ fontSize: '11px', color: '#9AA0AE', fontWeight: 400, marginLeft: '6px' }}>
              {lang === 'th' ? '— อุตสาหกรรมจะถูกเติมอัตโนมัติ' : '— industry will be auto-detected'}
            </span>
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

          {/* Auto-derived industries */}
          {selectedServices.length > 0 && (
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: '#6B7385', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1A9DA3" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {lang === 'th' ? 'อุตสาหกรรม:' : 'Industries:'}
              </span>
              {deriveIndustries(selectedServices).map(ind => (
                <span key={ind} style={{ background: '#F0F9F9', color: '#0F6F73', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', border: '1px solid rgba(15,111,115,0.2)', fontSize: '11px' }}>{ind}</span>
              ))}
            </div>
          )}
          {selectedServices.length === 0 && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#9AA0AE' }}>
              {lang === 'th'
                ? 'เพิ่มบริการที่นี่ หรือสร้างโปรเจกต์พอร์ตโฟลิโอเพื่อให้ระบบตรวจจับอุตสาหกรรมโดยอัตโนมัติ'
                : 'Add services here, or create portfolio projects — your industry will be set automatically.'}
            </div>
          )}
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
