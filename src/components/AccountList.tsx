import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { CloseableAccount } from '../hooks/useRentScanner'

interface Props {
  accounts: CloseableAccount[]
}

export default function AccountList({ accounts }: Props) {
  return (
    <div>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
        color: 'var(--text-muted)', letterSpacing: '0.08em',
        marginBottom: 12,
      }}>
        ACCOUNTS TO CLOSE ({accounts.length})
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {accounts.map((acct, i) => {
          const sol = acct.lamports / LAMPORTS_PER_SOL
          const short = `${acct.pubkey.toBase58().slice(0, 6)}...${acct.pubkey.toBase58().slice(-6)}`
          const mintShort = `${acct.mint.slice(0, 6)}...${acct.mint.slice(-4)}`

          return (
            <div key={acct.pubkey.toBase58()} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              transition: 'border-color 0.2s',
              animation: `fadeUp 0.3s ease ${i * 0.04}s both`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'var(--bg-card2)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)',
                }}>
                  {i + 1}
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text)', marginBottom: 3 }}>
                    {short}
                  </p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    Mint: {mintShort}
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 500 }}>
                  +{sol.toFixed(6)}
                </p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  SOL
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
