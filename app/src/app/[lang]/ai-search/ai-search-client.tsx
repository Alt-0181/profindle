'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

type TopResult = {
  id: string; name: string; verified: boolean; premium: boolean; province: string | null;
  logoInitial: string; logoUrl: string | null;
  project: { title: string; description: string; results: string; category: string; client: string | null; images: string[] } | null;
};
type MoreResult = { id: string; name: string; verified: boolean; province: string | null };
type SearchResponse = {
  understood: boolean;
  interpreted: { service: string; keyword: string };
  service: string; industry: string;
  count: number; exactCount: number; industryFallback: boolean;
  top: TopResult[]; more: MoreResult[]; keywordRelaxed: boolean;
  error?: string;
};
type Turn = { id: number; query: string; res: SearchResponse | null; error?: boolean };

// Module-scope so they don't remount (and drop input focus) each render.
function Bot({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '16px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '15px' }}>✦</div>
      <div style={{ background: 'white', border: '1px solid #E1E9E9', borderRadius: '4px 16px 16px 16px', padding: '13px 16px', fontSize: '15px', color: '#1B2626', lineHeight: 1.55, maxWidth: '560px', boxShadow: '0 1px 2px rgba(11,42,44,.04)' }}>{children}</div>
    </div>
  );
}
function User({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
      <div style={{ background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)', color: 'white', borderRadius: '16px 4px 16px 16px', padding: '11px 16px', fontSize: '15px', fontWeight: 600, maxWidth: '460px' }}>{children}</div>
    </div>
  );
}
const VBadge = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#0F6F73"><path d="M12 2l2.4 1.8 3 .1 1 2.8 2.3 1.9-1 2.8 1 2.8-2.3 1.9-1 2.8-3 .1L12 22l-2.4-1.8-3-.1-1-2.8L3.3 15l1-2.8-1-2.8L5.6 5.5l1-2.8 3-.1z" /><path d="M9.5 12.5l1.8 1.8 3.5-3.8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

function Results({ res, lang, labels }: { res: SearchResponse; lang: string; labels: Record<string, string> }) {
  return (
    <>
      {res.top.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '4px 0 24px' }}>
          {res.top.map((p) => (
            <Link key={p.id} href={`/${lang}/providers/${p.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'white', border: '1px solid #E1E9E9', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(11,42,44,.04),0 8px 30px rgba(11,42,44,.05)', transition: 'transform 120ms' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 18px 12px' }}>
                  {p.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.logoUrl} alt={p.name} style={{ width: '44px', height: '44px', borderRadius: '11px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '44px', height: '44px', borderRadius: '11px', background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)', color: 'white', fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{p.logoInitial}</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#171A21' }}>{p.name}</span>
                      {p.verified && <span style={{ display: 'inline-flex' }}><VBadge /></span>}
                    </div>
                    {p.province && <div style={{ fontSize: '12.5px', color: '#8AA3A2', marginTop: '1px' }}>{p.province}</div>}
                  </div>
                </div>
                {p.project && (
                  <div style={{ padding: '0 18px 16px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#B08400', marginBottom: '6px' }}>{labels.relatedWork}</div>
                    <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#1B2626', marginBottom: '4px' }}>{p.project.title}{p.project.client ? ` · ${p.project.client}` : ''}</div>
                    {p.project.description && <p style={{ fontSize: '13.5px', color: '#5E7070', lineHeight: 1.55, margin: '0 0 8px' }}>{p.project.description.length > 180 ? p.project.description.slice(0, 180) + '…' : p.project.description}</p>}
                    {p.project.images.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        {p.project.images.map((src, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={i} src={src} alt="" style={{ width: '33%', height: '84px', objectFit: 'cover', borderRadius: '10px', background: '#F0F9F9' }} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div style={{ borderTop: '1px solid #F0F4F4', padding: '10px 18px', fontSize: '13px', fontWeight: 700, color: '#0F6F73' }}>{labels.viewProfile} →</div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {res.more.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8AA3A2', marginBottom: '10px' }}>{labels.moreHead}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {res.more.map((m) => (
              <Link key={m.id} href={`/${lang}/providers/${m.id}`} style={{ textDecoration: 'none' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid #E1E9E9', borderRadius: '999px', padding: '8px 14px', fontSize: '13.5px', fontWeight: 600, color: '#1B2626' }}>
                  {m.name}{m.verified && <VBadge size={13} />}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export function AiSearchClient({ lang }: { lang: string }) {
  const isTh = lang === 'th';
  const t = {
    kicker: isTh ? 'ค้นหาด้วย AI' : 'AI Search',
    greeting: isTh ? 'สวัสดีค่ะ 👋 อยากได้บริการแบบไหน? พิมพ์บอกได้เลยเป็นภาษาไทยหรืออังกฤษ' : "Hi 👋 What do you need? Just type it in your own words — Thai or English.",
    placeholder: isTh ? 'เช่น “ออกแบบโลโก้ให้ร้านกาแฟ” หรือ “หาคนทำเว็บอีคอมเมิร์ซ”' : 'e.g. “a logo for my coffee shop” or “build an e-commerce website”',
    searching: isTh ? 'กำลังค้นหา…' : 'Searching…',
    lookingFor: isTh ? 'กำลังหา' : 'Looking for',
    found: isTh ? 'พบผู้ให้บริการ' : 'Found',
    providers: isTh ? 'ราย' : 'providers',
    noExact: isTh ? 'ยังไม่มีใครให้บริการนี้โดยตรง — นี่คือผู้ให้บริการในหมวด' : 'No one offers this exact service yet — here are providers in',
    noneAtAll: isTh ? 'ยังไม่พบผู้ให้บริการที่ตรงกัน ลองบริการอื่นดูนะคะ' : 'No matching providers yet — try describing it differently.',
    notUnderstood: isTh ? 'ขอโทษค่ะ ยังไม่แน่ใจว่าคุณต้องการบริการใด ลองระบุให้ชัดขึ้น เช่น “ออกแบบโลโก้”, “ทำเว็บไซต์”, “พิธีกรงานอีเวนต์”' : 'Sorry, I’m not sure which service you mean. Try being more specific, e.g. “logo design”, “website development”, “event emcee”.',
    relaxed: isTh ? '(ไม่พบคีย์เวิร์ดที่ตรงพอดี — แสดงผู้ให้บริการสำหรับบริการนี้แทน)' : '(No exact keyword match — showing providers for this service instead)',
    relatedWork: isTh ? 'ผลงานที่เกี่ยวข้อง' : 'Related work',
    viewProfile: isTh ? 'ดูโปรไฟล์' : 'View profile',
    moreHead: isTh ? 'ผู้ให้บริการอื่นที่ตรงกัน' : 'Other matching providers',
    errGeneric: isTh ? 'เกิดข้อผิดพลาด กรุณาลองใหม่' : 'Something went wrong. Please try again.',
    beta: 'BETA',
  };

  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [turns, loading]);

  async function submit() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setLoading(true);
    const id = nextId.current++;
    try {
      const r = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, lang }),
      });
      if (!r.ok) { setTurns((p) => [...p, { id, query: text, res: null, error: true }]); return; }
      const res = (await r.json()) as SearchResponse;
      setTurns((p) => [...p, { id, query: text, res }]);
    } catch {
      setTurns((p) => [...p, { id, query: text, res: null, error: true }]);
    } finally {
      setLoading(false);
    }
  }

  function botLine(res: SearchResponse) {
    if (!res.understood) return t.notUnderstood;
    const svc = res.interpreted?.service || res.service;
    if (res.exactCount > 0) {
      return (<><span>🔎 {t.lookingFor}: <strong style={{ color: '#0F6F73' }}>{svc}</strong></span> — <strong>{t.found} {res.exactCount} {t.providers}</strong>{res.keywordRelaxed && <div style={{ fontSize: '13px', color: '#8AA3A2', marginTop: '4px' }}>{t.relaxed}</div>}</>);
    }
    if (res.industryFallback && res.top.length > 0) {
      return (<>🔎 {t.lookingFor}: <strong style={{ color: '#0F6F73' }}>{svc}</strong>. {t.noExact} <strong style={{ color: '#0F6F73' }}>{res.industry}</strong>.</>);
    }
    return <>🔎 {t.lookingFor}: <strong style={{ color: '#0F6F73' }}>{svc}</strong>. {t.noneAtAll}</>;
  }

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '32px 20px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0B2A2C', margin: 0 }}>{t.kicker}</h1>
        <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em', color: '#F77F00', border: '1.5px solid rgba(247,127,0,0.4)', borderRadius: '999px', padding: '2px 8px' }}>{t.beta}</span>
      </div>

      <Bot>{t.greeting}</Bot>

      {turns.map((turn) => (
        <div key={turn.id}>
          <User>{turn.query}</User>
          {turn.error && <Bot>{t.errGeneric}</Bot>}
          {turn.res && (
            <>
              <Bot>{botLine(turn.res)}</Bot>
              <Results res={turn.res} lang={lang} labels={t} />
            </>
          )}
        </div>
      ))}

      {loading && (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', color: '#5E7070', fontSize: '14px' }}>
          <span style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2.5px solid rgba(15,111,115,0.2)', borderTopColor: '#0F6F73', display: 'inline-block', animation: 'aisp 0.7s linear infinite' }} />
          <style>{`@keyframes aisp{to{transform:rotate(360deg)}}`}</style>
          {t.searching}
        </div>
      )}

      {/* Composer */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginTop: '8px', position: 'sticky', bottom: '16px' }}>
        <textarea
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
          placeholder={t.placeholder}
          rows={1}
          style={{ flex: 1, resize: 'none', fontSize: '15px', padding: '14px 18px', border: '1.5px solid #CFE0E0', borderRadius: '16px', outline: 'none', color: '#1B2626', fontFamily: 'inherit', boxSizing: 'border-box', background: 'white', lineHeight: 1.4, maxHeight: '140px', boxShadow: '0 2px 10px rgba(11,42,44,.05)' }}
        />
        <button onClick={submit} disabled={loading || !input.trim()} aria-label="Send"
          style={{ width: '48px', height: '48px', flexShrink: 0, borderRadius: '14px', border: 'none', background: input.trim() && !loading ? 'linear-gradient(135deg,#0F6F73,#1A9DA3)' : '#CFE0E0', color: 'white', cursor: input.trim() && !loading ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 150ms' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
        </button>
      </div>

      <div ref={bottomRef} />
    </div>
  );
}
