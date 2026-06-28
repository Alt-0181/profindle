import { notFound } from 'next/navigation';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import Link from 'next/link';

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

function deriveStatus(createdAt: string): 'open' | 'expired' {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  return ageMs < 14 * 24 * 60 * 60 * 1000 ? 'open' : 'expired';
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  open: { bg: '#F0F9F9', color: '#0F6F73' },
  expired: { bg: '#FFF3F3', color: '#E05454' },
};

export default async function BroadcastHistoryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const t = dict.broadcastHistory;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const admin = getAdmin();

  const { data: broadcasts } = await admin
    .from('broadcasts')
    .select('id, category, title, budget_band, created_at')
    .eq('buyer_user_id', user.id)
    .order('created_at', { ascending: false });

  const broadcastList = broadcasts ?? [];
  const matchCounts: Record<string, number> = {};
  const eventStats: Record<string, { views: number; clicks: number }> = {};

  if (broadcastList.length > 0) {
    const ids = broadcastList.map((b: any) => b.id);

    const { data: matches } = await admin
      .from('broadcast_matches')
      .select('broadcast_id')
      .in('broadcast_id', ids);

    for (const m of matches ?? []) {
      matchCounts[m.broadcast_id] = (matchCounts[m.broadcast_id] || 0) + 1;
    }

    try {
      const { data: events, error } = await admin
        .from('broadcast_events')
        .select('broadcast_id, event_type')
        .in('broadcast_id', ids);

      if (!error && events) {
        for (const e of events) {
          if (!eventStats[e.broadcast_id]) eventStats[e.broadcast_id] = { views: 0, clicks: 0 };
          if (e.event_type === 'view') eventStats[e.broadcast_id].views++;
          else if ((e.event_type as string).startsWith('click_')) eventStats[e.broadcast_id].clicks++;
        }
      }
    } catch {}
  }

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{t.title}</h1>
          <p style={{ fontSize: '14px', color: '#6B7385' }}>{t.subtitle}</p>
        </div>
        <a href={`/${lang}/broadcast-request`} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t.newBroadcast}
        </a>
      </div>

      {broadcastList.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#F0F9F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A8DCDF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </div>
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#444B5A', marginBottom: '6px' }}>{t.noBroadcasts}</p>
          <p style={{ fontSize: '13px', color: '#9AA0AE' }}>{t.noBroadcastsSub}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {broadcastList.map((b: any) => {
            const status = deriveStatus(b.created_at);
            const sc = STATUS_COLORS[status];
            const statusLabel = status === 'open' ? t.open : t.expired;
            const matches = matchCounts[b.id] || 0;
            const stats = eventStats[b.id];
            const daysOld = Math.floor((Date.now() - new Date(b.created_at).getTime()) / (24 * 60 * 60 * 1000));
            const daysLeft = 14 - daysOld;

            return (
              <Link key={b.id} href={`/${lang}/broadcasts/${b.id}`} target="_blank"
                style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '20px', textDecoration: 'none', transition: 'box-shadow 150ms' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #F0F9F9, #D4EEEF)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#171A21', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.title || b.category}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: '#9AA0AE' }}>{b.category}</span>
                    {b.budget_band && (
                      <><span style={{ fontSize: '12px', color: '#C8CDD7' }}>·</span><span style={{ fontSize: '12px', color: '#9AA0AE' }}>{b.budget_band}</span></>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F6F73' }}>{matches}</div>
                      <div style={{ fontSize: '10px', color: '#9AA0AE' }}>{t.matches}</div>
                    </div>
                    {stats && (
                      <>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '18px', fontWeight: 700, color: '#444B5A' }}>{stats.views}</div>
                          <div style={{ fontSize: '10px', color: '#9AA0AE' }}>views</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '18px', fontWeight: 700, color: '#F77F00' }}>{stats.clicks}</div>
                          <div style={{ fontSize: '10px', color: '#9AA0AE' }}>contacts</div>
                        </div>
                      </>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{ padding: '4px 10px', background: sc.bg, color: sc.color, fontSize: '12px', fontWeight: 700, borderRadius: '999px' }}>{statusLabel}</span>
                    {status === 'open' && daysLeft > 0 && (
                      <span style={{ fontSize: '11px', color: '#9AA0AE' }}>{daysLeft}d left</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
