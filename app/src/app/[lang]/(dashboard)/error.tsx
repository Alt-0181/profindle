'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', fontFamily: 'Inter, "Noto Sans Thai", sans-serif', padding: '40px',
    }}>
      <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#171A21', marginBottom: '8px' }}>
        Something went wrong
      </h2>
      <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '24px', textAlign: 'center' }}>
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        style={{
          padding: '10px 24px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)',
          color: 'white', fontWeight: 600, fontSize: '14px', border: 'none',
          borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        Try again
      </button>
    </div>
  );
}
