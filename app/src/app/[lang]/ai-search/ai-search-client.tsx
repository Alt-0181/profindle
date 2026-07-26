'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { INDUSTRIES } from '@/lib/services';

type TopResult = {
  id: string;
  name: string;
  verified: boolean;
  premium: boolean;
  province: string | null;
  logoInitial: string;
  logoUrl: string | null;
  project: {
    title: string;
    description: string;
    results: string;
    category: string;
    client: string | null;
    images: string[];
  } | null;
};
type MoreResult = { id: string; name: string; verified: boolean; province: string | null };
type SearchResult = { service: string; count: number; top: TopResult[]; more: MoreResult[]; keywordRelaxed: boolean };

type Stage = 'service' | 'refine' | 'results';

// Chat bubbles — declared at module scope so they don't remount on every render.
function Bot({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '16px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '15px' }}>✦</div>
      <div style={{ background: 'white', border: '1px solid #E1E9E9', borderRadius: '4px 16px 16px 16px', padding: '13px 16px', fontSize: '15px', color: '#1B2626', lineHeight: 1.55, maxWidth: '520px', boxShadow: '0 1px 2px rgba(11,42,44,.04)' }}>{children}</div>
    </div>
  );
}
function User({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
      <div style={{ background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)', color: 'white', borderRadius: '16px 4px 16px 16px', padding: '11px 16px', fontSize: '15px', fontWeight: 600, maxWidth: '420px' }}>{children}</div>
    </div>
  );
}

export function AiSearchClient({ lang }: { lang: string }) {
  const isTh = lang === 'th';
  const t = {
    kicker: isTh ? 'ค้นหาด้วย AI' : 'AI Search',
    greeting: isTh
      ? 'สวัสดีค่ะ 👋 บอกเราหน่อยว่าคุณกำลังมองหาบริการอะไร?'
      : "Hi 👋 Tell us the service you're looking for.",
    servicePh: isTh ? 'พิมพ์เพื่อค้นหา เช่น "ออกแบบ", "การตลาด", "ไอที"…' : 'Type to search, e.g. "Design", "Marketing", "IT"…',
    foundOne: isTh ? 'พบผู้ให้บริการ' : 'Found',
    foundProviders: isTh ? 'ราย' : 'providers',
    foundNone: isTh ? 'ยังไม่พบผู้ให้บริการสำหรับบริการนี้' : 'No providers found for this service yet.',
    refinePrompt: isTh
      ? 'มีคีย์เวิร์ด ประสบการณ์ หรือสิ่งที่ต้องการเฉพาะเจาะจงไหม? (หรือข้ามได้)'
      : 'Any keyword, experience, or specific need? (or skip)',
    refinePh: isTh ? 'เช่น "แอปสะสมแต้ม", "ธนาคาร", "ค้าปลีก"…' : 'e.g. "loyalty app", "banking", "retail"…',
    skip: isTh ? 'ข้าม' : 'Skip',
    search: isTh ? 'ค้นหา' : 'Search',
    searching: isTh ? 'กำลังค้นหา…' : 'Searching…',
    anyNeed: isTh ? 'อะไรก็ได้' : 'Anything',
    resultsHeadA: isTh ? 'นี่คือผู้ให้บริการที่ตรงที่สุด' : "Here are the closest-matching providers",
    relaxed: isTh
      ? 'ไม่พบคีย์เวิร์ดที่ตรงพอดี — แสดงผู้ให้บริการสำหรับบริการนี้แทน'
      : "No exact keyword match — showing providers for this service instead",
    moreHead: isTh ? 'ผู้ให้บริการอื่นที่ตรงกัน' : 'Other matching providers',
    viewProfile: isTh ? 'ดูโปรไฟล์' : 'View profile',
    verified: isTh ? 'ยืนยันแล้ว' : 'Verified',
    resultCase: isTh ? 'ผลงานที่เกี่ยวข้อง' : 'Related work',
    startOver: isTh ? 'เริ่มใหม่' : 'Start over',
    beta: 'BETA',
    errGeneric: isTh ? 'เกิดข้อผิดพลาด กรุณาลองใหม่' : 'Something went wrong. Please try again.',
  };

  const [stage, setStage] = useState<Stage>('service');
  const [service, setService] = useState('');
  const [serviceInput, setServiceInput] = useState('');
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [stage, count, result, loading]);

  const matches = serviceInput.trim().length >= 1
    ? INDUSTRIES.flatMap((ind) =>
        ind.services.filter((s) => s.toLowerCase().includes(serviceInput.toLowerCase())).map((s) => ({ s, industry: isTh ? ind.th : ind.name })),
      ).slice(0, 24)
    : [];
  const grouped = matches.reduce<Record<string, string[]>>((acc, m) => {
    (acc[m.industry] ??= []).push(m.s);
    return acc;
  }, {});

  async function callSearch(svc: string, kw: string): Promise<SearchResult | null> {
    const res = await fetch('/api/ai-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service: svc, keyword: kw, lang }),
    });
    if (!res.ok) return null;
    return (await res.json()) as SearchResult;
  }

  async function pickService(svc: string) {
    setService(svc);
    setServiceInput(svc);
    setOpen(false);
    setError('');
    setLoading(true);
    const r = await callSearch(svc, '');
    setLoading(false);
    if (!r) { setError(t.errGeneric); return; }
    setCount(r.count);
    setStage('refine');
  }

  async function runFinal(kw: string) {
    setKeyword(kw);
    setError('');
    setLoading(true);
    const r = await callSearch(service, kw);
    setLoading(false);
    if (!r) { setError(t.errGeneric); return; }
    setResult(r);
    setStage('results');
  }

  function reset() {
    setStage('service');
    setService(''); setServiceInput(''); setKeyword('');
    setCount(null); setResult(null); setError(''); setOpen(false);
  }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 20px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0B2A2C', margin: 0 }}>{t.kicker}</h1>
        <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em', color: '#F77F00', border: '1.5px solid rgba(247,127,0,0.4)', borderRadius: '999px', padding: '2px 8px' }}>{t.beta}</span>
      </div>

      {/* Greeting */}
      <Bot>{t.greeting}</Bot>

      {/* Step 1 — service picker (stays visible; input locks once chosen) */}
      {stage === 'service' ? (
        <div ref={dropdownRef} style={{ position: 'relative', marginBottom: '20px' }}>
          <input
            autoFocus
            value={serviceInput}
            onChange={(e) => { setServiceInput(e.target.value); setOpen(true); }}
            onFocus={() => serviceInput && setOpen(true)}
            placeholder={t.servicePh}
            style={{ width: '100%', fontSize: '15px', padding: '14px 18px', border: '1.5px solid #CFE0E0', borderRadius: '14px', outline: 'none', color: '#1B2626', fontFamily: 'inherit', boxSizing: 'border-box', background: 'white' }}
          />
          {open && matches.length > 0 && (
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'white', border: '1.5px solid rgba(15,111,115,0.18)', borderRadius: '14px', boxShadow: '0 12px 48px rgba(15,111,115,0.18)', zIndex: 50, maxHeight: '340px', overflowY: 'auto' }}>
              {Object.entries(grouped).map(([industry, svcs]) => (
                <div key={industry}>
                  <div style={{ padding: '8px 14px 4px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9AA0AE' }}>{industry}</div>
                  {svcs.map((svc) => (
                    <div key={svc} onMouseDown={(e) => { e.preventDefault(); pickService(svc); }}
                      style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '14px', color: '#171A21' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F0F9F9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      {svc}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <User>{service}</User>
      )}

      {/* Step 2 — count + refine */}
      {(stage === 'refine' || stage === 'results') && count !== null && (
        <Bot>
          {count > 0 ? (
            <>
              <strong style={{ color: '#0F6F73' }}>{t.foundOne} {count} {t.foundProviders}</strong>
              <div style={{ marginTop: '6px' }}>{t.refinePrompt}</div>
            </>
          ) : (
            t.foundNone
          )}
        </Bot>
      )}

      {stage === 'refine' && count !== null && count > 0 && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            autoFocus
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') runFinal(keyword); }}
            placeholder={t.refinePh}
            style={{ flex: 1, minWidth: '220px', fontSize: '15px', padding: '14px 18px', border: '1.5px solid #CFE0E0', borderRadius: '14px', outline: 'none', color: '#1B2626', fontFamily: 'inherit', boxSizing: 'border-box', background: 'white' }}
          />
          <button onClick={() => runFinal(keyword)} disabled={loading}
            style={{ padding: '0 22px', background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)', color: 'white', fontWeight: 700, fontSize: '15px', border: 'none', borderRadius: '14px', cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
            {loading ? t.searching : t.search}
          </button>
          <button onClick={() => runFinal('')} disabled={loading}
            style={{ padding: '0 18px', background: 'transparent', color: '#5E7070', fontWeight: 600, fontSize: '14px', border: '1.5px solid #CFE0E0', borderRadius: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
            {t.skip}
          </button>
        </div>
      )}

      {/* Loading shimmer */}
      {loading && stage !== 'service' && (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', color: '#5E7070', fontSize: '14px' }}>
          <span style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2.5px solid rgba(15,111,115,0.2)', borderTopColor: '#0F6F73', display: 'inline-block', animation: 'aisp 0.7s linear infinite' }} />
          <style>{`@keyframes aisp{to{transform:rotate(360deg)}}`}</style>
          {t.searching}
        </div>
      )}

      {error && <div style={{ color: '#C0392B', fontSize: '14px', marginBottom: '16px' }}>{error}</div>}

      {/* Step 3 — results */}
      {stage === 'results' && result && (
        <>
          {keyword ? <User>{keyword}</User> : <User>{t.anyNeed}</User>}
          <Bot>{result.keywordRelaxed ? t.relaxed : t.resultsHeadA}</Bot>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
            {result.top.map((p) => (
              <Link key={p.id} href={`/${lang}/providers/${p.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'white', border: '1px solid #E1E9E9', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(11,42,44,.04),0 8px 30px rgba(11,42,44,.05)', transition: 'transform 120ms' }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}>
                  {/* header */}
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
                        {p.verified && (
                          <span title={t.verified} style={{ display: 'inline-flex', color: '#0F6F73' }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="#0F6F73"><path d="M12 2l2.4 1.8 3 .1 1 2.8 2.3 1.9-1 2.8 1 2.8-2.3 1.9-1 2.8-3 .1L12 22l-2.4-1.8-3-.1-1-2.8L3.3 15l1-2.8-1-2.8L5.6 5.5l1-2.8 3-.1z"/><path d="M9.5 12.5l1.8 1.8 3.5-3.8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </span>
                        )}
                      </div>
                      {p.province && <div style={{ fontSize: '12.5px', color: '#8AA3A2', marginTop: '1px' }}>{p.province}</div>}
                    </div>
                  </div>

                  {/* related portfolio work */}
                  {p.project && (
                    <div style={{ padding: '0 18px 16px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#B08400', marginBottom: '6px' }}>{t.resultCase}</div>
                      <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#1B2626', marginBottom: '4px' }}>
                        {p.project.title}{p.project.client ? ` · ${p.project.client}` : ''}
                      </div>
                      {p.project.description && (
                        <p style={{ fontSize: '13.5px', color: '#5E7070', lineHeight: 1.55, margin: '0 0 8px' }}>
                          {p.project.description.length > 180 ? p.project.description.slice(0, 180) + '…' : p.project.description}
                        </p>
                      )}
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
                  <div style={{ borderTop: '1px solid #F0F4F4', padding: '10px 18px', fontSize: '13px', fontWeight: 700, color: '#0F6F73' }}>{t.viewProfile} →</div>
                </div>
              </Link>
            ))}
          </div>

          {result.more.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8AA3A2', marginBottom: '10px' }}>{t.moreHead}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {result.more.map((m) => (
                  <Link key={m.id} href={`/${lang}/providers/${m.id}`} style={{ textDecoration: 'none' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid #E1E9E9', borderRadius: '999px', padding: '8px 14px', fontSize: '13.5px', fontWeight: 600, color: '#1B2626' }}>
                      {m.name}
                      {m.verified && <svg width="13" height="13" viewBox="0 0 24 24" fill="#0F6F73"><path d="M12 2l2.4 1.8 3 .1 1 2.8 2.3 1.9-1 2.8 1 2.8-2.3 1.9-1 2.8-3 .1L12 22l-2.4-1.8-3-.1-1-2.8L3.3 15l1-2.8-1-2.8L5.6 5.5l1-2.8 3-.1z"/><path d="M9.5 12.5l1.8 1.8 3.5-3.8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <button onClick={reset} style={{ background: 'transparent', border: '1.5px solid #CFE0E0', borderRadius: '12px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, color: '#5E7070', cursor: 'pointer', fontFamily: 'inherit' }}>
            ↺ {t.startOver}
          </button>
        </>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
