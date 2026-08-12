'use client';

import { useState } from 'react';

type Result = {
  applied: boolean;
  scanned: number;
  companiesAffected: number;
  phoneCleared: number;
  emailCleared: number;
  lineCleared: number;
  sample: string[];
};

export function ScrubButton({ isTh }: { isTh: boolean }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Result | null>(null);
  const [done, setDone] = useState<Result | null>(null);
  const [error, setError] = useState('');

  const run = async (apply: boolean) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/scrub-contacts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ apply }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.error ?? 'Failed'); setLoading(false); return; }
      if (apply) { setDone(data); setPreview(null); } else { setPreview(data); }
    } catch {
      setError(isTh ? 'เกิดข้อผิดพลาด' : 'Something went wrong');
    }
    setLoading(false);
  };

  const btn: React.CSSProperties = {
    padding: '9px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
    fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
  };

  if (done) {
    return (
      <div style={{ fontSize: '13px', color: '#0F6F73', fontWeight: 600 }}>
        ✓ {isTh ? 'ทำความสะอาดเสร็จ' : 'Cleanup complete'} — {done.companiesAffected} {isTh ? 'บริษัท' : 'companies'} · {done.phoneCleared} phone · {done.emailCleared} email · {done.lineCleared} LINE {isTh ? 'ถูกลบ' : 'cleared'}.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {!preview ? (
        <button onClick={() => run(false)} disabled={loading} style={{ ...btn, alignSelf: 'flex-start', background: 'white', border: '1.5px solid #0F6F73', color: '#0F6F73' }}>
          {loading ? '…' : (isTh ? 'ตรวจสอบก่อนล้าง' : 'Preview cleanup')}
        </button>
      ) : (
        <>
          <div style={{ fontSize: '13px', color: '#444B5A', lineHeight: 1.6 }}>
            {isTh ? 'จะลบข้อมูลติดต่อส่วนบุคคลจาก' : 'Will clear personal contact from'} <strong>{preview.companiesAffected}</strong> {isTh ? 'บริษัทที่ยังไม่ยืนยัน' : 'unclaimed companies'}
            {' '}({preview.phoneCleared} phone, {preview.emailCleared} email, {preview.lineCleared} LINE){preview.scanned ? ` · ${isTh ? 'สแกน' : 'scanned'} ${preview.scanned}` : ''}.
            {preview.sample.length > 0 && (
              <div style={{ fontSize: '12px', color: '#9AA0AE', marginTop: '4px' }}>{preview.sample.slice(0, 12).join(', ')}{preview.companiesAffected > 12 ? '…' : ''}</div>
            )}
          </div>
          {preview.companiesAffected > 0 ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => run(true)} disabled={loading} style={{ ...btn, background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', border: 'none', color: 'white' }}>
                {loading ? '…' : (isTh ? `ยืนยันลบ ${preview.companiesAffected} บริษัท` : `Apply to ${preview.companiesAffected} companies`)}
              </button>
              <button onClick={() => setPreview(null)} disabled={loading} style={{ ...btn, background: 'white', border: '1.5px solid #E4E7ED', color: '#6B7385' }}>
                {isTh ? 'ยกเลิก' : 'Cancel'}
              </button>
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: '#0F6F73', fontWeight: 600 }}>✓ {isTh ? 'ไม่มีข้อมูลส่วนบุคคลให้ลบ — สะอาดแล้ว' : 'Nothing personal to clear — already clean.'}</div>
          )}
        </>
      )}
      {error && <div style={{ fontSize: '12px', color: '#FF5A5F' }}>{error}</div>}
    </div>
  );
}
