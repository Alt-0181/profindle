'use client';
import { useState } from 'react';

const SAMPLE = `[
  {
    "name": "Acme Digital Co., Ltd.",
    "name_th": "บริษัท แอคมี ดิจิทัล จำกัด",
    "description": "Performance marketing and web builds for Thai SMEs.",
    "description_th": "การตลาดสายผลลัพธ์และทำเว็บสำหรับ SME ไทย",
    "province": "Bangkok",
    "services": ["Digital Marketing", "Web Development", "SEO / SEM"],
    "website": "https://acmedigital.co.th",
    "phone": "021234567",
    "email": "hello@acmedigital.co.th",
    "line_id": "@acmedigital",
    "address": "https://maps.app.goo.gl/xxxxx",
    "industry": "Advertising / Marketing / PR"
  }
]`;

export function ImportClient({ lang }: { lang: string }) {
  const isTh = lang === 'th';
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [urls, setUrls] = useState('');
  const [enriching, setEnriching] = useState(false);
  const [enrichInfo, setEnrichInfo] = useState<any>(null);

  const enrich = async () => {
    setError(''); setEnrichInfo(null);
    const list = urls.split(/[\s,]+/).map((u) => u.trim()).filter(Boolean);
    if (list.length === 0) { setError('Paste at least one URL.'); return; }
    if (list.length > 12) { setError('Max 12 URLs per batch — fetching is slow. Split into batches.'); return; }
    setEnriching(true);
    try {
      const res = await fetch('/api/admin/enrich-urls', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ urls: list }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.error ?? 'Enrich failed'); }
      else {
        setText(JSON.stringify(data.companies ?? [], null, 2));
        setEnrichInfo(data);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Enrich failed');
    } finally {
      setEnriching(false);
    }
  };

  const run = async () => {
    setError(''); setResult(null);
    let companies: any;
    try {
      const parsed = JSON.parse(text);
      companies = Array.isArray(parsed) ? parsed : parsed.companies;
      if (!Array.isArray(companies)) throw new Error('Expected an array (or { "companies": [...] }).');
    } catch (e: any) {
      setError('Invalid JSON: ' + (e?.message ?? 'parse error'));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/admin/import-companies', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ companies }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.error ?? 'Import failed'); }
      else { setResult(data); }
    } catch (e: any) {
      setError(e?.message ?? 'Import failed');
    } finally {
      setBusy(false);
    }
  };

  const label: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#171A21', marginBottom: '6px' };

  return (
    <div className="page-body" style={{ maxWidth: '820px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{isTh ? 'นำเข้าผู้ให้บริการ (Seeded)' : 'Import providers (seeded)'}</h1>
      <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '20px' }}>
        {isTh
          ? 'วาง JSON รายชื่อบริษัท เพื่อสร้างโปรไฟล์แบบยังไม่ยืนยัน (claimed=false). บริการต้องตรงกับแคตตาล็อก มิฉะนั้นจะถูกข้าม.'
          : 'Paste a JSON array of companies to create unclaimed (claimed=false) profiles. Services must match the catalog or they’re dropped. Duplicates (same name/website) are skipped.'}
      </p>

      {/* Enrich from URLs — the app fetches each site and drafts the JSON below */}
      <div style={{ background: 'white', border: '1px solid rgba(15,111,115,0.15)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
        <label style={label}>{isTh ? '① เติมข้อมูลจากลิงก์เว็บไซต์ (อัตโนมัติ)' : '① Enrich from website URLs (optional)'}</label>
        <p style={{ fontSize: '12px', color: '#6B7385', marginBottom: '8px' }}>
          {isTh
            ? 'วางลิงก์เว็บไซต์ (สูงสุด 12 ต่อครั้ง) ระบบจะดึงข้อมูลและร่าง JSON ให้ด้านล่างเพื่อตรวจก่อนนำเข้า'
            : 'Paste website URLs (max 12 per batch). The app fetches each and drafts the JSON below for you to review before importing.'}
        </p>
        <textarea
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder={"https://acmedigital.co.th\nhttps://another-agency.com"}
          rows={4}
          style={{ width: '100%', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '12px', padding: '10px 12px', border: '1.5px solid #E4E7ED', borderRadius: '10px', background: 'white', color: '#171A21', outline: 'none', resize: 'vertical' }}
        />
        <button onClick={enrich} disabled={enriching || !urls.trim()} style={{ marginTop: '10px', padding: '9px 18px', background: '#0F6F73', color: 'white', fontWeight: 600, fontSize: '13px', border: 'none', borderRadius: '10px', cursor: (enriching || !urls.trim()) ? 'not-allowed' : 'pointer', opacity: (enriching || !urls.trim()) ? 0.5 : 1, fontFamily: 'inherit' }}>
          {enriching ? (isTh ? 'กำลังดึงข้อมูล…' : 'Fetching…') : (isTh ? 'ดึงข้อมูล → สร้าง JSON' : 'Fetch → build JSON')}
        </button>
        {enrichInfo && (
          <div style={{ fontSize: '12px', color: '#0F6F73', marginTop: '8px' }}>
            ✓ {isTh ? 'ดึงสำเร็จ' : 'Enriched'} {enrichInfo.enriched} · {isTh ? 'ล้มเหลว' : 'failed'} {enrichInfo.failed}
            {enrichInfo.errors?.length > 0 && (
              <span style={{ color: '#E06B00' }}> — {enrichInfo.errors.map((e: any) => e.url).join(', ')}</span>
            )}
          </div>
        )}
      </div>

      <label style={label}>{isTh ? '② JSON (ตรวจแล้วกดนำเข้า)' : '② Companies JSON (review, then import)'}</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={SAMPLE}
        rows={16}
        style={{ width: '100%', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '12px', padding: '12px 14px', border: '1.5px solid #E4E7ED', borderRadius: '12px', background: 'white', color: '#171A21', outline: 'none', resize: 'vertical' }}
      />

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '12px' }}>
        <button onClick={run} disabled={busy || !text.trim()} style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', borderRadius: '12px', cursor: (busy || !text.trim()) ? 'not-allowed' : 'pointer', opacity: (busy || !text.trim()) ? 0.5 : 1, fontFamily: 'inherit' }}>
          {busy ? (isTh ? 'กำลังนำเข้า…' : 'Importing…') : (isTh ? 'นำเข้า' : 'Import')}
        </button>
        <button onClick={() => setText(SAMPLE)} style={{ padding: '10px 16px', background: 'transparent', border: '1.5px solid #E4E7ED', color: '#444B5A', fontWeight: 600, fontSize: '13px', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
          {isTh ? 'ใส่ตัวอย่าง' : 'Load sample'}
        </button>
      </div>

      {error && (
        <p style={{ fontSize: '13px', color: '#D32F2F', background: '#FFF5F5', border: '1px solid #FFCDD2', borderRadius: '8px', padding: '10px 14px', marginTop: '14px' }}>{error}</p>
      )}

      {result && (
        <div style={{ marginTop: '16px', background: 'white', border: '1px solid rgba(15,111,115,0.12)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F6F73', marginBottom: '8px' }}>
            ✓ {isTh ? 'นำเข้า' : 'Imported'} {result.inserted} · {isTh ? 'ข้าม' : 'skipped'} {result.skipped} · {isTh ? 'ไม่ถูกต้อง' : 'invalid'} {result.invalid}
          </div>
          {result.skippedNames?.length > 0 && (
            <div style={{ fontSize: '12px', color: '#9AA0AE', marginBottom: '6px' }}>{isTh ? 'ข้าม (ซ้ำ)' : 'Skipped (duplicates)'}: {result.skippedNames.join(', ')}</div>
          )}
          {result.unknownServices?.length > 0 && (
            <div style={{ fontSize: '12px', color: '#E06B00' }}>{isTh ? 'บริการที่ไม่รู้จัก (ถูกตัดออก)' : 'Unknown services (dropped)'}: {result.unknownServices.join(', ')}</div>
          )}
        </div>
      )}
    </div>
  );
}
