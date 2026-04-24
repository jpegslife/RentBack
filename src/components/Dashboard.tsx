import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useRentScanner } from '../hooks/useRentScanner'
import { FEE_PERCENT, APP_NAME } from '../config'
import AccountList from './AccountList'
import SummaryPanel from './SummaryPanel'
import SuccessPanel from './SuccessPanel'

export default function Dashboard() {
  const { connected, publicKey } = useWallet()
  const scanner = useRentScanner()

  const shortKey = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(99,235,188,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,235,188,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        pointerEvents: 'none',
      }} />

      {/* Glow orb */}
      <div style={{
        position: 'fixed', top: '-20vh', right: '-10vw', zIndex: 0,
        width: '60vw', height: '60vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,235,188,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <header style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 32px',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
        background: 'rgba(8,11,16,0.8)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#080b10" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            {APP_NAME}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {connected && shortKey && (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
              color: 'var(--text-muted)', padding: '6px 10px',
              background: 'var(--bg-card)', borderRadius: 6,
              border: '1px solid var(--border)',
            }}>
              {shortKey}
            </span>
          )}
          <WalletMultiButton />
        </div>
      </header>

      {/* Main content */}
      <main style={{ position: 'relative', zIndex: 1, flex: 1, padding: '48px 32px', maxWidth: 800, margin: '0 auto', width: '100%' }}>

        {/* Hero */}
        <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 99,
            border: '1px solid rgba(99,235,188,0.25)',
            background: 'rgba(99,235,188,0.07)',
            marginBottom: 24,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'block', animation: 'pulse-glow 2s infinite' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '0.08em' }}>
              SOLANA MAINNET
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800,
            letterSpacing: '-0.04em', lineHeight: 1.05,
            marginBottom: 16,
          }}>
            Reclaim your<br />
            <span style={{ color: 'var(--accent)' }}>locked SOL</span>
          </h1>

          <p style={{ color: 'var(--text-mid)', fontSize: '1rem', lineHeight: 1.7, maxWidth: 460, margin: '0 auto 8px' }}>
            Empty token accounts on Solana lock up SOL as rent. Connect your wallet, scan for closeable accounts, and get your SOL back instantly.
          </p>

          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
            color: 'var(--text-muted)', marginTop: 8,
          }}>
            {FEE_PERCENT}% service fee · you keep {100 - FEE_PERCENT}%
          </p>
        </div>

        {/* Not connected state */}
        {!connected && (
          <div className="animate-fade-up" style={{
            textAlign: 'center', padding: '64px 32px',
            border: '1px dashed var(--border)',
            borderRadius: 'var(--radius)',
            background: 'var(--bg-card)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>◎</div>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.95rem' }}>
              Connect your wallet to scan for recoverable rent
            </p>
            <WalletMultiButton />
          </div>
        )}

        {/* Connected: idle */}
        {connected && scanner.status === 'idle' && (
          <div className="animate-fade-up" style={{ textAlign: 'center' }}>
            <button onClick={scanner.scan} style={{
              padding: '16px 48px', fontSize: '1rem', fontWeight: 700,
              fontFamily: 'var(--font-display)',
              background: 'var(--accent)', color: '#080b10',
              border: 'none', borderRadius: 'var(--radius-sm)',
              cursor: 'pointer', transition: 'all 0.2s ease',
              letterSpacing: '-0.01em',
            }}
              onMouseEnter={e => {
                (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'
                ;(e.target as HTMLButtonElement).style.boxShadow = '0 0 32px var(--accent-glow)'
              }}
              onMouseLeave={e => {
                (e.target as HTMLButtonElement).style.transform = 'translateY(0)'
                ;(e.target as HTMLButtonElement).style.boxShadow = 'none'
              }}
            >
              Scan Wallet
            </button>
            <p style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Read-only scan · nothing signed until you confirm
            </p>
          </div>
        )}

        {/* Scanning */}
        {scanner.status === 'scanning' && (
          <div className="animate-fade-up" style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{
              width: 40, height: 40, border: '3px solid var(--border)',
              borderTopColor: 'var(--accent)', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 20px',
            }} />
            <p style={{ color: 'var(--text-mid)' }}>Scanning your accounts…</p>
          </div>
        )}

        {/* Claiming */}
        {scanner.status === 'claiming' && (
          <div className="animate-fade-up" style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{
              width: 40, height: 40, border: '3px solid var(--border)',
              borderTopColor: 'var(--accent)', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 20px',
            }} />
            <p style={{ color: 'var(--text-mid)' }}>Sending transactions… approve in your wallet</p>
          </div>
        )}

        {/* Error */}
        {scanner.status === 'error' && (
          <div className="animate-fade-up" style={{
            padding: '24px', borderRadius: 'var(--radius)',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            marginBottom: 24,
          }}>
            <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: 12 }}>
              ⚠ {scanner.error}
            </p>
            <button onClick={scanner.reset} style={{
              padding: '8px 20px', fontSize: '0.85rem', fontWeight: 600,
              fontFamily: 'var(--font-display)',
              background: 'transparent', color: 'var(--text-mid)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}>
              Try again
            </button>
          </div>
        )}

        {/* Done: results */}
        {scanner.status === 'done' && (
          <div className="animate-fade-up">
            {scanner.accounts.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '64px 32px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                background: 'var(--bg-card)',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>✓</div>
                <p style={{ color: 'var(--text-mid)' }}>No closeable accounts found. Your wallet is clean!</p>
                <button onClick={scanner.reset} style={{
                  marginTop: 20, padding: '10px 24px', fontSize: '0.85rem',
                  fontWeight: 600, fontFamily: 'var(--font-display)',
                  background: 'transparent', color: 'var(--text-mid)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                }}>
                  Scan again
                </button>
              </div>
            ) : (
              <>
                <SummaryPanel
                  totalSol={scanner.totalSol}
                  feeSol={scanner.feeSol}
                  youReceiveSol={scanner.youReceiveSol}
                  accountCount={scanner.accounts.length}
                  onClaim={scanner.claimAll}
                  onReset={scanner.reset}
                />
                <AccountList accounts={scanner.accounts} />
              </>
            )}
          </div>
        )}

        {/* Success */}
        {scanner.status === 'claimed' && (
          <SuccessPanel
            youReceiveSol={scanner.youReceiveSol}
            txSignatures={scanner.txSignatures}
            onReset={scanner.reset}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid var(--border)',
        padding: '20px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 8,
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {APP_NAME} · {FEE_PERCENT}% service fee · Solana Mainnet
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          Only closes zero-balance token accounts
        </span>
      </footer>
    </div>
  )
}
