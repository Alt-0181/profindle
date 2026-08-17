'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Locale } from '@/dictionaries';

export interface Lead {
  broadcastId: string;
  category: string;
  title: string | null;
  description: string;
  budget: string | null;
  timeline: string | null;
  location: string | null;
  buyerName: string | null;
  postedAt: string;
  response: 'no_reply' | 'interested' | 'declined';
}

type Filter = 'all' | 'no_reply' | 'interested' | 'declined';

export function LeadsClient({ lang, leads: initial, isPremium }: { lang: Locale; leads: Lead[]; isPremium: boolean }) {
  const isTh = lang === 'th';
  const [leads, setLeads] = useState<Lead[]>(initial);
  const [filter, setFilter] = useState<Filter>('all');
  const [busy, setBusy] = useState<string | null>(null);

  const counts = useMemo(() => ({
    all: leads.length,
    no_reply: leads.filter(l => l.response === 'no_reply').length,
    interested: leads.filter(l => l.response === 'interested').length,
    declined: leads.filter(l => l.response === 'declined').length,
  }), [leads]);

  const shown = filter === 'all' ? leads : leads.filter(l => l.response === filter);

  const respond = async (broadcastId: string, response: Lead['response']) => {
    setBusy(broadcastId);
    const prev = leads;
    setLeads(ls => ls.map(l => (l.broadcastId === broadcastId ? { ...l, response } : l)));
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broadcastId, response }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setLeads(prev); // revert on failure
      alert(isTh ? 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง' : 'Could not save — please try again.');
    } finally {
      setBusy(null);
    }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(isTh ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const FILTERS: { id: Filter; label: string }[] = [
    { id: 'all', label: isTh ? 'ทั้งหมด' : 'All' },
    { id: 'no_reply', label: isTh ? 'ใหม่' : 'New' },
    { id: 'interested', label: isTh ? 'สนใจ' : 'Interested' },
    { id: 'declined', label: isTh ? 'ปฏิเสธ' : 'Declined' },
  ];

  const statusPill = (response: Lead['response']) => {
    if (response === 'interested') return { text: isTh ? '✓ สนใจแล้ว' : '✓ Interested', bg: 'rgba(15,111,115,0.09)', color: '#0F6F73' };
    if (response === 'declined') return { text: isTh ? 'ปฏิเสธแล้ว' : 'Declined', bg: '#F4F5F7', color: '#9AA0AE' };
    return { text: isTh ? 'ใหม่' : 'New', bg: 'rgba(247,127,0,0.12)', color: '#E06B00' };
  };

  return (
    <div style={{ maxWidth: '820px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{isTh ? 'คำขอที่เข้ามา' : 'Leads'}</h1>
        <p style={{ fontSize: '14px', color: '#6B7385' }}>
          {isTh ? 'คำขอจากลูกค้าที่ตรงกับบริการของคุณ ตอบรับเพื่อเริ่มติดต่อ' : 'Buyer requests matching your services. Respond to start a conversation.'}
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'inline-flex', gap: '4px', background: '#F4F5F7', borderRadius: '12px', padding: '4px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '9px', border: 'none',
            fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            background: filter === f.id ? 'white' : 'transparent',
            color: filter === f.id ? '#0F6F73' : '#6B7385',
            boxShadow: filter === f.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}>
            {f.label}
            <span style={{ fontSize: '11px', fontWeight: 700, color: filter === f.id ? '#0F6F73' : '#9AA0AE' }}>{counts[f.id]}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div style={{ background: 'white', border: '1px solid #E4E7ED', borderRadius: '16px', padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#171A21', marginBottom: '6px' }}>
            {counts.all === 0 ? (isTh ? 'ยังไม่มีคำขอเข้ามา' : 'No leads yet') : (isTh ? 'ไม่มีรายการในหมวดนี้' : 'Nothing in this filter')}
          </div>
          <div style={{ fontSize: '13px', color: '#9AA0AE', lineHeight: 1.6, maxWidth: '420px', margin: '0 auto' }}>
            {counts.all === 0
              ? (isPremium
                ? (isTh ? 'เมื่อมีลูกค้าโพสต์คำขอที่ตรงกับบริการของคุณ คำขอจะปรากฏที่นี่และแจ้งเตือนทาง LINE' : 'When a buyer posts a request matching your services, it will appear here and notify you on LINE.')
                : (isTh ? 'คำขอจากลูกค้าจะส่งให้ผู้ให้บริการ Premium ก่อน — อัปเกรดเพื่อรับคำขอที่ตรงกับคุณ' : 'Buyer requests are sent to Premium providers first — upgrade to receive matching leads.'))
              : ''}
          </div>
          {counts.all === 0 && !isPremium && (
            <Link href={`/${lang}/package`} style={{ display: 'inline-flex', marginTop: '18px', padding: '10px 20px', background: 'linear-gradient(135deg,#F77F00,#E06B00)', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '13px' }}>
              {isTh ? 'ดูแพ็กเกจ Premium' : 'View Premium plan'}
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {shown.map(lead => {
            const pill = statusPill(lead.response);
            return (
              <div key={lead.broadcastId} style={{ background: 'white', border: '1px solid #E4E7ED', borderRadius: '16px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#171A21' }}>{lead.category}</div>
                    {lead.title && <div style={{ fontSize: '13px', color: '#6B7385', marginTop: '2px' }}>{lead.title}</div>}
                  </div>
                  <span style={{ flexShrink: 0, fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px', background: pill.bg, color: pill.color }}>{pill.text}</span>
                </div>

                {lead.description && (
                  <p style={{ fontSize: '13.5px', color: '#444B5A', lineHeight: 1.6, margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{lead.description}</p>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                  {[
                    { label: isTh ? 'งบประมาณ' : 'Budget', value: lead.budget },
                    { label: isTh ? 'กำหนดส่ง' : 'Timeline', value: lead.timeline },
                    { label: isTh ? 'สถานที่' : 'Location', value: lead.location },
                    { label: isTh ? 'จากบริษัท' : 'From', value: lead.buyerName },
                  ].filter(x => x.value).map(x => (
                    <div key={x.label}>
                      <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9AA0AE' }}>{x.label}</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#171A21' }}>{x.value}</div>
                    </div>
                  ))}
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9AA0AE' }}>{isTh ? 'โพสต์เมื่อ' : 'Posted'}</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#171A21' }}>{fmtDate(lead.postedAt)}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', borderTop: '1px solid #F4F5F7', paddingTop: '14px' }}>
                  <Link href={`/${lang}/broadcasts/${lead.broadcastId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '13px' }}>
                    {isTh ? 'ดูรายละเอียดและติดต่อ →' : 'View & connect →'}
                  </Link>

                  {lead.response === 'no_reply' ? (
                    <>
                      <button onClick={() => respond(lead.broadcastId, 'interested')} disabled={busy === lead.broadcastId} style={{ padding: '9px 16px', background: '#F0F9F9', color: '#0F6F73', border: '1.5px solid #2BBEC5', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', opacity: busy === lead.broadcastId ? 0.6 : 1 }}>
                        {isTh ? 'สนใจ' : "I'm interested"}
                      </button>
                      <button onClick={() => respond(lead.broadcastId, 'declined')} disabled={busy === lead.broadcastId} style={{ padding: '9px 14px', background: 'none', color: '#9AA0AE', border: 'none', fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                        {isTh ? 'ไม่สนใจ' : 'Not interested'}
                      </button>
                    </>
                  ) : (
                    <button onClick={() => respond(lead.broadcastId, 'no_reply')} disabled={busy === lead.broadcastId} style={{ padding: '9px 14px', background: 'none', color: '#9AA0AE', border: 'none', fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', opacity: busy === lead.broadcastId ? 0.6 : 1 }}>
                      {isTh ? 'เปลี่ยนคำตอบ' : 'Change response'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
