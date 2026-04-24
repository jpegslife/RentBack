import { FEE_PERCENT } from '../config'

interface Props {
  totalSol: number
  feeSol: number
  youReceiveSol: number
  accountCount: number
  onClaim: () => void
  onReset: () => void
}

export default function SummaryPanel({ totalSol, feeSol, youReceiveSol, accountCount, onClaim, onReset }: Props) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '28px',
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 6 }}>
            RECOVERABLE RENT
          </p>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--accent)', lineHeight: 1 }}>
            {totalSol.toFixed(6)}
            <span style={{ fontSize: '1rem', marginLeft: 6, fontWeight: 600, color: 'var(--text-mid)' }}>SOL</span>
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Across {accountCount} closeable account{accountCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={onReset} style={{
            padding: '10px 18px', fontSize: '0.85rem', fontWeight: 600,
            fontFamily: 'var(--font-display)', background: 'transparent',
            color: 'var(--text-muted)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => (e.target as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => (e.target as HTMLButtonElement).style.borderColor = 'var(--border)'}
          >
            Rescan
          </button>
          <button onClick={onClaim} style={{
            padding: '10px 24px', fontSize: '0.9rem', fontWeight: 700,
            fontFamily: 'var(--font-display)', background: 'var(--accent)',
            color: '#080b10', border: 'none', borderRadius: 'var(--radius-sm)',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)'
              ;(e.target as HTMLButtonElement).style.boxShadow = '0 0 24px var(--accent-glow)'
            }}
            onMouseLeave={e => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)'
              ;(e.target as HTMLButtonElement).style.boxShadow = 'none'
            }}
          >
            Claim All →
          </button>
        </div>
      </div>

      {/* Breakdown */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
        padding: '20px', background: 'var(--bg-card2)',
        borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
      }}>
        {[
          { label: 'Total Recovered', value: totalSol.toFixed(6), sub: 'SOL', color: 'var(--text)' },
          { label: `${FEE_PERCENT}% Service Fee`, value: feeSol.toFixed(6), sub: 'SOL', color: 'var(--warn)' },
          { label: 'You Receive', value: youReceiveSol.toFixed(6), sub: 'SOL', color: 'var(--accent)' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: 6 }}>
              {label.toUpperCase()}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 500, color }}>
              {value} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{sub}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
