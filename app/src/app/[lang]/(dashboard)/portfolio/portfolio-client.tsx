'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Dictionary } from '@/dictionaries';
import { createClient } from '@/lib/supabase/client';

interface Project {
  id: string;
  title: string;
  client: string;
  confidential: boolean;
  year: string;
  budget: string;
  category: string;
  descEn: string;
  descTh: string;
  resultsEn: string;
  resultsTh: string;
  images: string[];
  coverImage?: string | null;
}

interface PortfolioClientProps {
  lang: string;
  dict: Dictionary;
  companyId: string | null;
  initialProjects: Project[];
}

export function PortfolioClient({ lang, dict, companyId, initialProjects }: PortfolioClientProps) {
  const t = dict.portfolio;
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [form, setForm] = useState({
    title: '', client: '',
    year: new Date().getFullYear().toString(),
    descEn: '', descTh: '', resultsEn: '', resultsTh: '',
    budget: '', confidential: false,
  });
  const [clientSearch, setClientSearch] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>(Array(5).fill(null));
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>(Array(5).fill(null));

  const KNOWN_CLIENTS = ['Kasikorn Bank', 'SCB', 'PTT', 'CP Group', 'Siam Cement', 'True Corporation', 'AIS', 'Dtac', 'Central Group', 'The Mall Group', 'Big C', "Lotus's", 'Robinson', 'Bangkok Bank', 'Krungthai Bank'];
  const clientSuggestions = clientSearch.length >= 2
    ? KNOWN_CLIENTS.filter((c) => c.toLowerCase().includes(clientSearch.toLowerCase())).slice(0, 6)
    : [];

  const inputStyle: React.CSSProperties = {
    width: '100%', fontSize: '14px', padding: '10px 14px',
    border: '1.5px solid #E4E7ED', borderRadius: '12px',
    background: 'white', outline: 'none', color: '#171A21', fontFamily: 'inherit',
  };

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSlotClick = (i: number) => {
    setActiveSlot(i);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeSlot === null) return;
    const newFiles = [...imageFiles];
    newFiles[activeSlot] = file;
    setImageFiles(newFiles);
    const newPreviews = [...imagePreviews];
    if (newPreviews[activeSlot]) URL.revokeObjectURL(newPreviews[activeSlot]!);
    newPreviews[activeSlot] = URL.createObjectURL(file);
    setImagePreviews(newPreviews);
  };

  const resetModal = () => {
    setForm({
      title: '', client: '',
      year: new Date().getFullYear().toString(),
      descEn: '', descTh: '', resultsEn: '', resultsTh: '',
      budget: '', confidential: false,
    });
    setClientSearch('');
    imagePreviews.forEach((url) => { if (url) URL.revokeObjectURL(url); });
    setImageFiles(Array(5).fill(null));
    setImagePreviews(Array(5).fill(null));
    setSaveError('');
  };

  const openEdit = (proj: Project) => {
    setEditingId(proj.id);
    setForm({
      title: proj.title,
      client: proj.confidential ? '' : proj.client,
      year: proj.year,
      descEn: proj.descEn,
      descTh: proj.descTh,
      resultsEn: proj.resultsEn,
      resultsTh: proj.resultsTh,
      budget: proj.budget,
      confidential: proj.confidential,
    });
    setClientSearch(proj.confidential ? '' : proj.client);
    setImagePreviews([
      proj.images[0] ?? null,
      proj.images[1] ?? null,
      proj.images[2] ?? null,
      proj.images[3] ?? null,
      proj.images[4] ?? null,
    ]);
    setShowModal(true);
  };

  const handleEdit = async () => {
    if (!form.title || saving || !editingId) return;
    setSaving(true);
    setSaveError('');

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !companyId) throw new Error('No company profile');

      const existing = projects.find(p => p.id === editingId);
      const imageUrls: string[] = existing?.images ? [...existing.images] : [];

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        if (!file) continue;
        const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
        const path = `${user.id}/${editingId}/${i}.${ext}`;
        await supabase.storage.from('portfolio-images').upload(path, file, { upsert: true });
        const { data: urlData } = supabase.storage.from('portfolio-images').getPublicUrl(path);
        imageUrls[i] = urlData.publicUrl;
      }

      const { error } = await supabase.from('portfolio_projects').update({
        title: form.title,
        client: form.confidential ? null : form.client || null,
        confidential: form.confidential,
        year: form.year ? parseInt(form.year) : null,
        budget: form.budget || null,
        description: form.descEn || null,
        description_th: form.descTh || null,
        results: form.resultsEn || null,
        results_th: form.resultsTh || null,
        images: imageUrls,
      }).eq('id', editingId);
      if (error) throw error;

      setProjects(projects.map(p => p.id === editingId ? {
        ...p,
        title: form.title,
        client: form.confidential ? (lang === 'th' ? 'ไม่เปิดเผย' : 'Confidential') : form.client,
        confidential: form.confidential,
        year: form.year,
        budget: form.budget,
        descEn: form.descEn,
        descTh: form.descTh,
        resultsEn: form.resultsEn,
        resultsTh: form.resultsTh,
        images: imageUrls,
        coverImage: imageUrls[0] ?? p.coverImage ?? null,
      } : p));

      setShowModal(false);
      setEditingId(null);
      resetModal();
      router.refresh();
    } catch (err: any) {
      setSaveError(lang === 'th' ? 'บันทึกไม่สำเร็จ — กรุณาลองใหม่' : err.message ?? 'Save failed — please try again');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!form.title || saving) return;
    setSaving(true);
    setSaveError('');

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !companyId) throw new Error('No company profile yet');

      const projectId = crypto.randomUUID();
      const imageUrls: string[] = [];

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        if (!file) continue;
        const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
        const path = `${user.id}/${projectId}/${i}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from('portfolio-images').upload(path, file);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from('portfolio-images').getPublicUrl(path);
        imageUrls.push(urlData.publicUrl);
      }

      const { error: insertErr } = await supabase.from('portfolio_projects').insert({
        id: projectId,
        company_id: companyId,
        title: form.title,
        client: form.confidential ? null : form.client || null,
        confidential: form.confidential,
        year: form.year ? parseInt(form.year) : null,
        budget: form.budget || null,
        description: form.descEn || null,
        description_th: form.descTh || null,
        results: form.resultsEn || null,
        results_th: form.resultsTh || null,
        images: imageUrls,
      });
      if (insertErr) throw insertErr;

      setProjects([...projects, {
        id: projectId,
        title: form.title,
        client: form.confidential ? (lang === 'th' ? 'ไม่เปิดเผย' : 'Confidential') : form.client,
        year: form.year,
        coverImage: imageUrls[0] ?? null,
      }]);

      setShowModal(false);
      resetModal();
      router.refresh();
    } catch (err: any) {
      setSaveError(lang === 'th' ? 'บันทึกไม่สำเร็จ — กรุณาลองใหม่' : err.message ?? 'Save failed — please try again');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{t.title}</h1>
          <p style={{ fontSize: '14px', color: '#6B7385' }}>{t.subtitle}</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t.addProject}
        </button>
      </div>

      {/* Portfolio grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {projects.map((proj) => (
          <div key={proj.id} onClick={() => openEdit(proj)} style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', overflow: 'hidden', cursor: 'pointer', transition: 'all 200ms' }}>
            <div style={{ aspectRatio: '4/3', background: 'linear-gradient(135deg, #F0F9F9, #D4EEEF)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {proj.coverImage ? (
                <img src={proj.coverImage} alt={proj.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#A8DCDF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                </svg>
              )}
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{proj.title}</div>
              <div style={{ fontSize: '12px', color: '#9AA0AE' }}>{proj.client} · {proj.year}</div>
            </div>
          </div>
        ))}

        {/* Add card */}
        <div onClick={() => setShowModal(true)} style={{
          aspectRatio: '4/3', border: '2px dashed #C8CDD7', borderRadius: '16px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
          cursor: 'pointer', transition: 'all 150ms', background: 'transparent',
        }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F0F9F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#9AA0AE' }}>
            {projects.length === 0 ? t.noProjects : t.addProject}
          </span>
          {projects.length === 0 && <span style={{ fontSize: '12px', color: '#C8CDD7', textAlign: 'center', maxWidth: '160px' }}>{t.noProjectsSub}</span>}
        </div>
      </div>

      {/* Add project modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(14,16,23,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', maxWidth: '580px', width: '100%', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(14,16,23,0.3)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#171A21' }}>{editingId ? (lang === 'th' ? 'แก้ไขโปรเจกต์' : 'Edit Project') : t.addProject}</h3>
              <button onClick={() => { setShowModal(false); setEditingId(null); resetModal(); }} style={{ width: '32px', height: '32px', border: 'none', background: '#F4F5F7', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Image slots */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>{t.images}</label>
                <p style={{ fontSize: '12px', color: '#9AA0AE', marginBottom: '10px' }}>{t.imagesSub}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      onClick={() => handleSlotClick(i)}
                      style={{
                        aspectRatio: '4/3',
                        border: imagePreviews[i] ? '2px solid #0F6F73' : '2px dashed #C8CDD7',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        background: 'white',
                        transition: 'border-color 150ms',
                      }}
                    >
                      {imagePreviews[i] ? (
                        <img src={imagePreviews[i]!} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8CDD7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      )}
                      {i === 0 && (
                        <span style={{ position: 'absolute', bottom: '3px', left: '4px', fontSize: '9px', fontWeight: 700, color: imagePreviews[i] ? 'white' : '#9AA0AE', textShadow: imagePreviews[i] ? '0 1px 3px rgba(0,0,0,0.6)' : 'none' }}>
                          {lang === 'th' ? 'หน้าปก' : 'Cover'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>{t.projectTitle}</label>
                <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder={t.titlePh} style={inputStyle} />
              </div>

              {/* Client autocomplete */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>{t.client}</label>
                <input
                  type="text"
                  value={form.confidential ? (lang === 'th' ? 'ไม่เปิดเผย' : 'Confidential') : clientSearch}
                  onChange={(e) => { setClientSearch(e.target.value); set('client', e.target.value); }}
                  disabled={form.confidential}
                  placeholder={t.clientPh}
                  style={{ ...inputStyle, opacity: form.confidential ? 0.5 : 1 }}
                />
                {clientSuggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'white', border: '1px solid #E4E7ED', borderRadius: '12px', boxShadow: '0 8px 24px rgba(23,26,33,0.12)', zIndex: 50, maxHeight: '260px', overflowY: 'auto' }}>
                    {clientSuggestions.map((c) => (
                      <div key={c} onClick={() => { set('client', c); setClientSearch(c); }} style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '13px', color: '#171A21', borderBottom: '1px solid #F4F5F7' }}>
                        {c}
                      </div>
                    ))}
                    {clientSearch && !KNOWN_CLIENTS.find((c) => c.toLowerCase() === clientSearch.toLowerCase()) && (
                      <div onClick={() => { set('client', clientSearch); setClientSearch(clientSearch); }} style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '13px', color: '#0F6F73', fontWeight: 600 }}>
                        + {t.addClient.replace('{name}', clientSearch)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Confidential toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px 14px', border: `1.5px solid ${form.confidential ? '#F77F00' : '#E4E7ED'}`, borderRadius: '12px', background: form.confidential ? '#FFF8F0' : 'transparent', transition: 'all 150ms' }}>
                <input type="checkbox" checked={form.confidential} onChange={(e) => { set('confidential', e.target.checked); if (e.target.checked) setClientSearch(''); }} style={{ width: '20px', height: '20px', accentColor: '#F77F00', borderRadius: '4px', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: form.confidential ? '#E06B00' : '#444B5A' }}>{t.confidential}</span>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>{t.year}</label>
                  <input type="number" value={form.year} onChange={(e) => set('year', e.target.value)} min={2000} max={2030} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>{t.budget}</label>
                  <select value={form.budget} onChange={(e) => set('budget', e.target.value)} style={inputStyle}>
                    <option value="">—</option>
                    <option>Under ฿50,000</option>
                    <option>฿50,000 – 100,000</option>
                    <option>฿100,000 – 300,000</option>
                    <option>฿300,000 – 500,000</option>
                    <option>Over ฿500,000</option>
                  </select>
                </div>
              </div>

              {/* Bilingual descriptions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>
                    {t.descEn}
                    <span style={{ background: '#F0F9F9', color: '#0F6F73', fontSize: '10px', padding: '1px 6px', borderRadius: '999px', fontWeight: 600 }}>EN</span>
                  </label>
                  <textarea value={form.descEn} onChange={(e) => set('descEn', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} />
                </div>
                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>
                    {t.descTh}
                    <span style={{ background: '#FFF6EC', color: '#E06B00', fontSize: '10px', padding: '1px 6px', borderRadius: '999px', fontWeight: 600 }}>TH</span>
                  </label>
                  <textarea value={form.descTh} onChange={(e) => set('descTh', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} />
                </div>
              </div>

              {saveError && (
                <p style={{ fontSize: '13px', color: '#D32F2F', background: '#FFF5F5', border: '1px solid #FFCDD2', borderRadius: '8px', padding: '10px 14px' }}>
                  {saveError}
                </p>
              )}

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '8px' }}>
                <button onClick={() => { setShowModal(false); setEditingId(null); resetModal(); }} style={{ padding: '10px 20px', background: 'transparent', border: '1.5px solid #E4E7ED', color: '#444B5A', fontWeight: 600, fontSize: '14px', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {dict.common.cancel}
                </button>
                <button onClick={editingId ? handleEdit : handleAdd} disabled={!form.title || saving} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', borderRadius: '12px', cursor: (form.title && !saving) ? 'pointer' : 'not-allowed', opacity: (form.title && !saving) ? 1 : 0.5, fontFamily: 'inherit' }}>
                  {saving ? (lang === 'th' ? 'กำลังบันทึก…' : 'Saving…') : t.saveBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
