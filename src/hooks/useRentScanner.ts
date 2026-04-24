import { useState, useCallback } from 'react'
import { PublicKey, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { createCloseAccountInstruction, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { SystemProgram } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { FEE_WALLET, FEE_PERCENT } from '../config'

export interface CloseableAccount {
  pubkey: PublicKey
  lamports: number
  mint: string
  programId: PublicKey
}

export type ScanStatus = 'idle' | 'scanning' | 'done' | 'claiming' | 'claimed' | 'error'

export function useRentScanner() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()

  const [accounts, setAccounts] = useState<CloseableAccount[]>([])
  const [status, setStatus] = useState<ScanStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [txSignatures, setTxSignatures] = useState<string[]>([])

  const totalLamports = accounts.reduce((sum, a) => sum + a.lamports, 0)
  const totalSol = totalLamports / LAMPORTS_PER_SOL
  const feeSol = totalSol * (FEE_PERCENT / 100)
  const youReceiveSol = totalSol - feeSol

  const scan = useCallback(async () => {
    if (!publicKey) return
    setStatus('scanning')
    setError(null)
    setAccounts([])
    setTxSignatures([])

    try {
      console.log('[v0] Starting scan for wallet:', publicKey.toBase58())
      
      // Scan both Token Program and Token-2022 Program
      const [tokenAccounts, token2022Accounts] = await Promise.all([
        connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID,
        }),
        connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_2022_PROGRAM_ID,
        }),
      ])

      console.log('[v0] Token accounts found:', tokenAccounts.value.length)
      console.log('[v0] Token-2022 accounts found:', token2022Accounts.value.length)

      const closeable: CloseableAccount[] = []

      // Process Token Program accounts
      for (const { pubkey, account } of tokenAccounts.value) {
        const parsed = account.data.parsed?.info
        const amount = parsed?.tokenAmount?.uiAmount ?? 0
        console.log('[v0] Token account:', pubkey.toBase58(), 'balance:', amount, 'lamports:', account.lamports)
        // Only include zero-balance token accounts (safe to close)
        if (amount === 0) {
          closeable.push({
            pubkey,
            lamports: account.lamports,
            mint: parsed?.mint ?? 'Unknown',
            programId: TOKEN_PROGRAM_ID,
          })
        }
      }

      // Process Token-2022 accounts
      for (const { pubkey, account } of token2022Accounts.value) {
        const parsed = account.data.parsed?.info
        const amount = parsed?.tokenAmount?.uiAmount ?? 0
        console.log('[v0] Token-2022 account:', pubkey.toBase58(), 'balance:', amount, 'lamports:', account.lamports)
        // Only include zero-balance token accounts (safe to close)
        if (amount === 0) {
          closeable.push({
            pubkey,
            lamports: account.lamports,
            mint: parsed?.mint ?? 'Unknown',
            programId: TOKEN_2022_PROGRAM_ID,
          })
        }
      }

      console.log('[v0] Total closeable accounts:', closeable.length)
      setAccounts(closeable)
      setStatus('done')
    } catch (e: unknown) {
      console.error('[v0] Scan error:', e)
      const errorMessage = e instanceof Error ? e.message : 'Failed to scan accounts. Check your RPC endpoint.'
      setError(errorMessage)
      setStatus('error')
    }
  }, [publicKey, connection])

  const claimAll = useCallback(async () => {
    if (!publicKey || accounts.length === 0) return
    setStatus('claiming')
    setError(null)

    try {
      const feeWalletPubkey = new PublicKey(FEE_WALLET)
      const signatures: string[] = []

      console.log('[v0] Starting claim for', accounts.length, 'accounts')
      console.log('[v0] Fee wallet:', FEE_WALLET)
      console.log('[v0] Fee percent:', FEE_PERCENT)

      // Batch accounts into groups of 5 (smaller batches for reliability)
      const BATCH_SIZE = 5
      const batches: CloseableAccount[][] = []
      for (let i = 0; i < accounts.length; i += BATCH_SIZE) {
        batches.push(accounts.slice(i, i + BATCH_SIZE))
      }

      console.log('[v0] Processing', batches.length, 'batches')

      for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
        const batch = batches[batchIdx]
        const tx = new Transaction()

        console.log('[v0] Batch', batchIdx + 1, 'contains', batch.length, 'accounts')

        // Calculate fee for this batch FIRST (from user's existing balance)
        const batchLamports = batch.reduce((sum, a) => sum + a.lamports, 0)
        const feeLamports = Math.floor(batchLamports * (FEE_PERCENT / 100))

        console.log('[v0] Batch lamports:', batchLamports, 'Fee lamports:', feeLamports)

        // Add fee transfer FIRST (before closing accounts)
        // This uses the user's existing balance
        if (feeLamports > 0) {
          tx.add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: feeWalletPubkey,
              lamports: feeLamports,
            })
          )
        }

        // Then close each account in this batch, sending lamports to user
        for (const acct of batch) {
          console.log('[v0] Closing account:', acct.pubkey.toBase58(), 'program:', acct.programId.toBase58())
          tx.add(
            createCloseAccountInstruction(
              acct.pubkey,   // account to close
              publicKey,     // destination (user receives SOL)
              publicKey,     // authority (user must sign)
              [],            // multi-signers (none)
              acct.programId // use correct program (Token or Token-2022)
            )
          )
        }

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
        tx.recentBlockhash = blockhash
        tx.feePayer = publicKey

        console.log('[v0] Sending transaction for batch', batchIdx + 1)
        
        const sig = await sendTransaction(tx, connection, {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        })
        
        console.log('[v0] Transaction sent:', sig)
        
        // Wait for confirmation with timeout
        const confirmation = await connection.confirmTransaction({
          signature: sig,
          blockhash,
          lastValidBlockHeight,
        }, 'confirmed')

        if (confirmation.value.err) {
          console.error('[v0] Transaction failed:', confirmation.value.err)
          throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`)
        }

        console.log('[v0] Transaction confirmed:', sig)
        signatures.push(sig)
      }

      setTxSignatures(signatures)
      setAccounts([])
      setStatus('claimed')
    } catch (e: unknown) {
      console.error('[v0] Claim error:', e)
      const errorMessage = e instanceof Error ? e.message : 'Transaction failed or was rejected.'
      setError(errorMessage)
      setStatus('error')
    }
  }, [publicKey, accounts, connection, sendTransaction])

  const reset = useCallback(() => {
    setStatus('idle')
    setAccounts([])
    setError(null)
    setTxSignatures([])
  }, [])

  return {
    scan,
    claimAll,
    reset,
    accounts,
    status,
    error,
    txSignatures,
    totalSol,
    feeSol,
    youReceiveSol,
  }
}
