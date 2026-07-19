'use client';

export default function SearchProvidersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', background: '#F4F5F7' }}>
      <p style={{ fontSize: '14px', color: '#9AA0AE', marginBottom: '16px' }}>Something went wrong loading providers.</p>
      <button
        onClick={reset}
        style={{ padding: '8px 20px', borderRadius: '8px', background: '#0F6F73', color: 'white', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
      >
        Try again
      </button>
      {process.env.NODE_ENV === 'development' && (
        <pre style={{ marginTop: '24px', fontSize: '11px', color: '#444', maxWidth: '600px', whiteSpace: 'pre-wrap' }}>
          {error.message}
        </pre>
      )}
    </div>
  );
}
