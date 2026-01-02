import { ImageResponse } from '@vercel/og';
import { getReport } from '@/lib/report-storage';
import { getVerdict, getSeasonSummary } from '@/lib/copy';

export const runtime = 'edge';

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) {
    return new Response('Report not found', { status: 404 });
  }

  const verdict = getVerdict(report);
  const seasonSummary = getSeasonSummary(report);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'white',
        }}
      >
        {/* Dark Header Section */}
        <div
          style={{
            backgroundColor: '#111827',
            padding: '32px 48px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Team Info Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Left: Logo + Team Name */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              {report.teamLogoURL && (
                <img
                  src={report.teamLogoURL}
                  width={64}
                  height={64}
                  style={{ objectFit: 'contain', borderRadius: '8px' }}
                />
              )}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    color: 'white',
                    fontSize: '32px',
                    fontWeight: 'bold',
                  }}
                >
                  {report.teamName}
                </span>
                <span
                  style={{
                    color: '#9ca3af',
                    fontSize: '18px',
                  }}
                >
                  {report.ownerName}
                </span>
              </div>
            </div>

            {/* Right: Record + Standing */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '32px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span
                  style={{
                    color: 'white',
                    fontSize: '36px',
                    fontWeight: 'bold',
                  }}
                >
                  {report.regularSeasonWins}-{report.regularSeasonLosses}
                </span>
                <span style={{ color: '#9ca3af', fontSize: '14px' }}>Record</span>
              </div>
              {report.finalStandingsPosition && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderLeft: '1px solid #374151',
                    paddingLeft: '32px',
                  }}
                >
                  <span
                    style={{
                      color: 'white',
                      fontSize: '36px',
                      fontWeight: 'bold',
                    }}
                  >
                    {getOrdinal(report.finalStandingsPosition)}
                  </span>
                  <span style={{ color: '#9ca3af', fontSize: '14px' }}>
                    of {report.leagueSize} teams
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* League Info */}
          <div
            style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid #1f2937',
              display: 'flex',
            }}
          >
            <span style={{ color: '#6b7280', fontSize: '14px' }}>
              {report.leagueName} • {report.seasonId} Season
            </span>
          </div>
        </div>

        {/* White Content Section */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '32px 48px',
            flex: 1,
          }}
        >
          {/* Verdict */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '32px',
            }}
          >
            <span
              style={{
                color: '#111827',
                fontSize: '32px',
                fontWeight: 'bold',
                lineHeight: 1.2,
              }}
            >
              {verdict}
            </span>
            <span
              style={{
                color: '#6b7280',
                fontSize: '18px',
                marginTop: '8px',
              }}
            >
              {seasonSummary}
            </span>
          </div>

          {/* Stats Row */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
              flex: 1,
            }}
          >
            {/* Points Left on Bench */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
              }}
            >
              <span
                style={{
                  color: '#dc2626',
                  fontSize: '48px',
                  fontWeight: 'bold',
                }}
              >
                {report.totalPointsLeftOnBench.toFixed(2)}
              </span>
              <span
                style={{
                  color: '#111827',
                  fontSize: '16px',
                  fontWeight: '600',
                  marginTop: '4px',
                }}
              >
                Points Left on Bench
              </span>
            </div>

            {/* Blown Wins */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
              }}
            >
              <span
                style={{
                  color: '#dc2626',
                  fontSize: '48px',
                  fontWeight: 'bold',
                }}
              >
                {report.blownWins}
              </span>
              <span
                style={{
                  color: '#111827',
                  fontSize: '16px',
                  fontWeight: '600',
                  marginTop: '4px',
                }}
              >
                Blown Win{report.blownWins !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 48px',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#dc2626',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            FF
          </div>
          <span
            style={{
              color: '#111827',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            YouSuckAtFantasyFootball
          </span>
          <span
            style={{
              color: '#dc2626',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            .com
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
