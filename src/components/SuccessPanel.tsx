interface Props {
  youReceiveSol: number
  txSignatures: string[]
  onReset: () => void
}

export default function SuccessPanel({ youReceiveSol, txSignatures, onReset }: Props) {
  return (
    <div className="animate-fade-up" style={{
      textAlign: 'center', padding: '56px 32px',
      background: 'var(--bg-card)', border: '1px solid rgba(99,235,188,0.2)',
      borderRadius: 'var(--radius)',
      boxShadow: '0 0 60px rgba(99,235,188,0.06)',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'rgba(99,235,188,0.12)', border: '2px solid var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px', fontSize: '1.8rem',
      }}>
        ✓
      </div>

      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
        SOL Reclaimed!
      </h2>

      <p style={{ color: 'var(--text-mid)', marginBottom: 28 }}>
        Successfully recovered{' '}
        <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          {youReceiveSol.toFixed(6)} SOL
        </span>{' '}
        to your wallet.
      </p>

      {txSignatures.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
            color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 10,
          }}>
            TRANSACTION{txSignatures.length > 1 ? 'S' : ''}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {txSignatures.map((sig, i) => (
              <a
                key={sig}
                href={`https://solscan.io/tx/${sig}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                  color: 'var(--accent)', textDecoration: 'none',
                  padding: '8px 14px', background: 'var(--accent-dim)',
                  borderRadius: 6, border: '1px solid rgba(99,235,188,0.15)',
                  display: 'block', transition: 'all 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,235,188,0.18)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent-dim)')}
              >
                Tx {i + 1}: {sig.slice(0, 12)}...{sig.slice(-8)} ↗
              </a>
            ))}
          </div>
        </div>
      )}

      <button onClick={onReset} style={{
        padding: '12px 32px', fontSize: '0.9rem', fontWeight: 700,
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
        Scan Again
      </button>
    </div>
  )
}
