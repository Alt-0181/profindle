export default function DashboardLoading() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh',
    }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        border: '3px solid rgba(15,111,115,0.15)',
        borderTopColor: '#0F6F73',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
