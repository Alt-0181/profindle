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
type SearchResult = {
  service: string;
  industry: string;
  count: number;
  exactCount: number;
  industryFallback: boolean;
  top: TopResult[];
  more: MoreResult[];
  keywordRelaxed: boolean;
};

// Chat bubbles — module scope so they don't remount (and drop focus) each render.
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

const VBadge = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#0F6F73"><path d="M12 2l2.4 1.8 3 .1 1 2.8 2.3 1.9-1 2.8 1 2.8-2.3 1.9-1 2.8-3 .1L12 22l-2.4-1.8-3-.1-1-2.8L3.3 15l1-2.8-1-2.8L5.6 5.5l1-2.8 3-.1z" /><path d="M9.5 12.5l1.8 1.8 3.5-3.8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export function AiSearchClient({ lang }: { lang: string }) {
  const isTh = lang === 'th';
  const t = {
    kicker: isTh ? 'ค้นหาด้วย AI' : 'AI Search',
    greeting: isTh ? 'สวัสดีค่ะ 👋 บอกเราหน่อยว่าคุณกำลังมองหาบริการอะไร?' : "Hi 👋 Tell us the service you're looking for.",
    servicePh: isTh ? 'พิมพ์เพื่อค้นหา เช่น "ออกแบบ", "การตลาด", "ไอที"…' : 'Type to search, e.g. "Design", "Marketing", "IT"…',
    found: isTh ? 'พบผู้ให้บริการ' : 'Found',
    providers: isTh ? 'ราย' : 'providers',
    offering: isTh ? 'ที่ให้บริการนี้' : 'offering this service',
    refineHint: isTh ? 'เพิ่มคีย์เวิร์ดเพื่อค้นหาให้แคบลง หรือดูผลด้านล่างได้เลย' : 'Add a keyword to narrow it down, or browse the results below.',
    noExact: isTh ? 'ยังไม่มีใครให้บริการนี้โดยตรง — นี่คือผู้ให้บริการในหมวด' : "No one offers this exact service yet — here are providers in",
    noneAtAll: isTh ? 'ยังไม่พบผู้ให้บริการที่ตรงกัน ลองบริการอื่นดูนะคะ' : "No matching providers yet — try another service.",
    keywordPh: isTh ? 'คีย์เวิร์ด/ประสบการณ์ เช่น "แอปสะสมแต้ม", "ธนาคาร"…' : 'Keyword / experience, e.g. "loyalty app", "banking"…',
    searchBtn: isTh ? 'ค้นหา' : 'Search',
    searching: isTh ? 'กำลังค้นหา…' : 'Searching…',
    changeService: isTh ? 'เปลี่ยนบริการ' : 'Change service',
    relaxed: isTh ? 'ไม่พบคีย์เวิร์ดที่ตรงพอดี — แสดงผู้ให้บริการสำหรับบริการนี้แทน' : 'No exact keyword match — showing providers for this service instead',
    resultsHead: isTh ? 'นี่คือผู้ให้บริการที่ตรงที่สุด' : "Here are the closest-matching providers",
    moreHead: isTh ? 'ผู้ให้บริการอื่นที่ตรงกัน' : 'Other matching providers',
    viewProfile: isTh ? 'ดูโปรไฟล์' : 'View profile',
    relatedWork: isTh ? 'ผลงานที่เกี่ยวข้อง' : 'Related work',
    verified: isTh ? 'ยืนยันแล้ว' : 'Verified',
    errGeneric: isTh ? 'เกิดข้อผิดพลาด กรุณาลองใหม่' : 'Something went wrong. Please try again.',
    beta: 'BETA',
  };

  const [active, setActive] = useState(false);       // false = choosing service, true = results view
  const [service, setService] = useState('');
  const [serviceInput, setServiceInput] = useState('');
  const [open, setOpen] = useState(false);
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
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [active, result, loading]);

  const matches = serviceInput.trim().length >= 1
    ? INDUSTRIES.flatMap((ind) => ind.services.filter((s) => s.toLowerCase().includes(serviceInput.toLowerCase())).map((s) => ({ s, industry: isTh ? ind.th : ind.name }))).slice(0, 24)
    : [];
  const grouped = matches.reduce<Record<string, string[]>>((acc, m) => { (acc[m.industry] ??= []).push(m.s); return acc; }, {});

  async function runSearch(svc: string, kw: string) {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: svc, keyword: kw, lang }),
      });
      if (!res.ok) { setError(t.errGeneric); return; }
      setResult((await res.json()) as SearchResult);
    } catch {
      setError(t.errGeneric);
    } finally {
      setLoading(false);
    }
  }

  function pickService(svc: string) {
    setService(svc);
    setServiceInput(svc);
    setKeyword('');
    setOpen(false);
    setActive(true);
    runSearch(svc, '');
  }
  function changeService() {
    setActive(false);
    setResult(null);
    setServiceInput('');
    setService('');
    setKeyword('');
    setError('');
  }

  const headline = () => {
    if (!result) return null;
    if (result.exactCount > 0) {
      return (<><strong style={{ color: '#0F6F73' }}>{t.found} {result.exactCount} {t.providers}</strong> {t.offering}. <span>{t.refineHint}</span></>);
    }
    if (result.industryFallback && result.top.length > 0) {
      return (<>{t.noExact} <strong style={{ color: '#0F6F73' }}>{result.industry}</strong>. <span>{t.refineHint}</span></>);
    }
    return t.noneAtAll;
  };

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 20px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0B2A2C', margin: 0 }}>{t.kicker}</h1>
        <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em', color: '#F77F00', border: '1.5px solid rgba(247,127,0,0.4)', borderRadius: '999px', padding: '2px 8px' }}>{t.beta}</span>
      </div>

      <Bot>{t.greeting}</Bot>

      {/* Service picker */}
      {!active ? (
        <div ref={dropdownRef} style={{ position: 'relative', marginBottom: '20px' }}>
          <input autoFocus value={serviceInput} onChange={(e) => { setServiceInput(e.target.value); setOpen(true); }} onFocus={() => serviceInput && setOpen(true)} placeholder={t.servicePh}
            style={{ width: '100%', fontSize: '15px', padding: '14px 18px', border: '1.5px solid #CFE0E0', borderRadius: '14px', outline: 'none', color: '#1B2626', fontFamily: 'inherit', boxSizing: 'border-box', background: 'white' }} />
          {open && matches.length > 0 && (
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'white', border: '1.5px solid rgba(15,111,115,0.18)', borderRadius: '14px', boxShadow: '0 12px 48px rgba(15,111,115,0.18)', zIndex: 50, maxHeight: '340px', overflowY: 'auto' }}>
              {Object.entries(grouped).map(([industry, svcs]) => (
                <div key={industry}>
                  <div style={{ padding: '8px 14px 4px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9AA0AE' }}>{industry}</div>
                  {svcs.map((svc) => (
                    <div key={svc} onMouseDown={(e) => { e.preventDefault(); pickService(svc); }} style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '14px', color: '#171A21' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F0F9F9')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>{svc}</div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <User>{service}</User>

          {/* Always-present refine bar */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') runSearch(service, keyword); }} placeholder={t.keywordPh}
              style={{ flex: 1, minWidth: '220px', fontSize: '15px', padding: '13px 16px', border: '1.5px solid #CFE0E0', borderRadius: '14px', outline: 'none', color: '#1B2626', fontFamily: 'inherit', boxSizing: 'border-box', background: 'white' }} />
            <button onClick={() => runSearch(service, keyword)} disabled={loading}
              style={{ padding: '0 22px', background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)', color: 'white', fontWeight: 700, fontSize: '15px', border: 'none', borderRadius: '14px', cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
              {loading ? t.searching : t.searchBtn}
            </button>
          </div>
          <button onClick={changeService} style={{ background: 'transparent', border: 'none', color: '#5E7070', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: '2px 0 18px', fontFamily: 'inherit' }}>↺ {t.changeService}</button>

          {loading && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', color: '#5E7070', fontSize: '14px' }}>
              <span style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2.5px solid rgba(15,111,115,0.2)', borderTopColor: '#0F6F73', display: 'inline-block', animation: 'aisp 0.7s linear infinite' }} />
              <style>{`@keyframes aisp{to{transform:rotate(360deg)}}`}</style>
              {t.searching}
            </div>
          )}

          {error && <div style={{ color: '#C0392B', fontSize: '14px', marginBottom: '16px' }}>{error}</div>}

          {!loading && result && (
            <>
              <Bot>{headline()}</Bot>
              {result.keywordRelaxed && <Bot>{t.relaxed}</Bot>}

              {result.top.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '4px 0 28px' }}>
                  {result.top.map((p) => (
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
                              {p.verified && <span title={t.verified} style={{ display: 'inline-flex' }}><VBadge /></span>}
                            </div>
                            {p.province && <div style={{ fontSize: '12.5px', color: '#8AA3A2', marginTop: '1px' }}>{p.province}</div>}
                          </div>
                        </div>
                        {p.project && (
                          <div style={{ padding: '0 18px 16px' }}>
                            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#B08400', marginBottom: '6px' }}>{t.relatedWork}</div>
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
                        <div style={{ borderTop: '1px solid #F0F4F4', padding: '10px 18px', fontSize: '13px', fontWeight: 700, color: '#0F6F73' }}>{t.viewProfile} →</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {result.more.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8AA3A2', marginBottom: '10px' }}>{t.moreHead}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {result.more.map((m) => (
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
          )}
        </>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
