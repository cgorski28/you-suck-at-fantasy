import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'YouSuckAtFantasyFootball.com - Find out how many points you left on the bench';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fafafa',
          backgroundImage: 'linear-gradient(135deg, #fafafa 0%, #fff 50%, #fef2f2 100%)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              backgroundColor: '#dc2626',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 20,
            }}
          >
            <span style={{ color: 'white', fontSize: 40, fontWeight: 'bold' }}>FF</span>
          </div>
          <span style={{ fontSize: 48, fontWeight: 'bold', color: '#111' }}>
            YouSuckAtFantasyFootball
            <span style={{ color: '#dc2626' }}>.com</span>
          </span>
        </div>

        {/* Main headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '0 80px',
          }}
        >
          
          <span
            style={{
              fontSize: 28,
              color: '#6b7280',
              marginTop: 24,
              maxWidth: 800,
            }}
          >
            Find out how many points you left on the bench and how bad you really are at fantasy football.
          </span>
        </div>

        {/* Sample stat card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 40,
            marginTop: 48,
            backgroundColor: 'white',
            padding: '24px 48px',
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 20, color: '#6b7280' }}>Points Left on Bench</span>
            <span style={{ fontSize: 48, fontWeight: 'bold', color: '#dc2626' }}>-127.4</span>
          </div>
          <div style={{ width: 1, height: 60, backgroundColor: '#e5e7eb' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 20, color: '#6b7280' }}>Blown Wins</span>
            <span style={{ fontSize: 48, fontWeight: 'bold', color: '#dc2626' }}>3</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
