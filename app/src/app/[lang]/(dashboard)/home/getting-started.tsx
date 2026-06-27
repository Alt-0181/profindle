'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SubTask {
  title: string;
  sub: string;
  done: boolean;
  href: string;
}

interface Step {
  num: number;
  title: string;
  desc: string;
  done: boolean;
  status: string;
  providerOnly?: boolean;
  subTasks?: SubTask[];
  buyerShortcut?: { text: string; label: string; href: string };
  bodyText?: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaStyle?: 'teal' | 'line' | 'amber';
}

interface Props {
  steps: Step[];
  lang: string;
  completedCount: number;
}

export function GettingStartedAccordion({ steps, lang, completedCount }: Props) {
  const [openIdx, setOpenIdx] = useState<number>(0);

  const toggle = (i: number) => setOpenIdx(prev => prev === i ? -1 : i);

  const ctaColors: Record<string, { bg: string; color: string }> = {
    teal:  { bg: 'linear-gradient(135deg,#0F6F73,#1A9DA3)', color: 'white' },
    line:  { bg: '#06C755', color: 'white' },
    amber: { bg: 'linear-gradient(135deg,#F77F00,#E06B00)', color: 'white' },
  };

  return (
    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', overflow: 'hidden', marginBottom: '20px' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#171A21' }}>
              {lang === 'th' ? 'เริ่มต้นใช้งาน' : 'Getting Started'}
            </div>
            <div style={{ fontSize: '12px', color: '#9AA0AE', marginTop: '1px' }}>
              {lang === 'th' ? 'ทำให้ครบเพื่อใช้ Profindle ได้เต็มประสิทธิภาพ' : 'Finish these to get the most out of Profindle'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{ width: '120px', height: '5px', background: '#F0F9F9', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg,#0F6F73,#F77F00)', borderRadius: '999px', width: `${(completedCount / 4) * 100}%`, transition: 'width 600ms ease' }} />
          </div>
          <span style={{ fontSize: '12px', color: '#6B7385', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {completedCount} / 4
          </span>
        </div>
      </div>

      {/* Steps */}
      {steps.map((step, i) => {
        const isOpen = openIdx === i;
        const isDone = step.done;
        const cta = step.ctaStyle ? ctaColors[step.ctaStyle] : null;

        return (
          <div key={step.num} style={{ borderBottom: i < steps.length - 1 ? '1px solid #F4F5F7' : undefined }}>
            {/* Step header — clickable */}
            <button
              onClick={() => toggle(i)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 20px', background: isOpen ? '#FAFCFC' : 'none',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                transition: 'background 150ms',
              }}
            >
              {/* Number / check */}
              <div style={{
                width: '24px', height: '24px', borderRadius: '999px', flexShrink: 0,
                background: isDone ? '#0F6F73' : '#F0F9F9',
                border: `1.5px solid ${isDone ? '#0F6F73' : '#D4EEEF'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isDone ? 'white' : '#0F6F73', fontSize: '11px', fontWeight: 700,
              }}>
                {isDone
                  ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  : step.num}
              </div>

              {/* Title + desc */}
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: isDone ? '#0F6F73' : '#171A21' }}>{step.title}</span>
                  {step.providerOnly && (
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '999px', background: '#F0F9F9', color: '#0F6F73', border: '1px solid rgba(15,111,115,0.2)', whiteSpace: 'nowrap' }}>
                      Providers
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#9AA0AE', marginTop: '2px' }}>{step.desc}</div>
              </div>

              {/* Status */}
              <span style={{ fontSize: '11px', fontWeight: 600, color: isDone ? '#0F6F73' : step.status === 'Limited' ? '#E06B00' : '#9AA0AE', flexShrink: 0 }}>
                {step.status}
              </span>

              {/* Chevron */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isOpen ? '#0F6F73' : '#9AA0AE'} strokeWidth="2.5" strokeLinecap="round"
                style={{ flexShrink: 0, transition: 'transform 200ms', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Expanded body */}
            {isOpen && (
              <div style={{ padding: '0 20px 16px 58px' }}>
                {/* Sub-tasks (step 1 only) */}
                {step.subTasks && (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {step.subTasks.map((sub, j) => (
                      <Link key={j} href={sub.href} style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 12px', borderRadius: '10px',
                        textDecoration: 'none', color: '#171A21', transition: 'background 150ms',
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F4F8F8')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '999px', flexShrink: 0,
                          border: `2px solid ${sub.done ? '#0F6F73' : '#C8CDD7'}`,
                          background: sub.done ? '#0F6F73' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {sub.done && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: sub.done ? '#0F6F73' : '#171A21' }}>{sub.title}</div>
                          <div style={{ fontSize: '11.5px', color: '#9AA0AE', marginTop: '1px' }}>{sub.sub}</div>
                        </div>
                        {!sub.done && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8CDD7" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        )}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Buyer shortcut (step 1 only) */}
                {step.buyerShortcut && (
                  <div style={{ marginTop: '12px', padding: '12px 14px', background: '#F0F9F9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <span style={{ fontSize: '12.5px', color: '#444B5A' }}>{step.buyerShortcut.text}</span>
                    <a href={step.buyerShortcut.href} style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F6F73', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                      {step.buyerShortcut.label}
                    </a>
                  </div>
                )}

                {/* Body text + CTA (steps 2-4) */}
                {step.bodyText && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingTop: '8px', flexWrap: 'wrap' }}>
                    <p style={{ flex: 1, minWidth: '200px', fontSize: '13px', color: '#444B5A', lineHeight: 1.55, margin: 0 }}>
                      {step.bodyText}
                    </p>
                    {step.ctaLabel && step.ctaHref && cta && (
                      <Link href={step.ctaHref} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '9px 16px', borderRadius: '10px',
                        background: cta.bg, color: cta.color,
                        fontSize: '13px', fontWeight: 600, textDecoration: 'none', flexShrink: 0,
                      }}>
                        {step.ctaLabel}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
