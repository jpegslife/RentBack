import { useState, useCallback } from 'react'
import { PublicKey, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { createCloseAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { SystemProgram } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { FEE_WALLET, FEE_PERCENT } from '../config'

export interface CloseableAccount {
  pubkey: PublicKey
  lamports: number
  mint: string
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
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID,
      })

      const closeable: CloseableAccount[] = []

      for (const { pubkey, account } of tokenAccounts.value) {
        const parsed = account.data.parsed?.info
        const amount = parsed?.tokenAmount?.uiAmount ?? 0
        // Only include zero-balance token accounts (safe to close)
        if (amount === 0) {
          closeable.push({
            pubkey,
            lamports: account.lamports,
            mint: parsed?.mint ?? 'Unknown',
          })
        }
      }

      setAccounts(closeable)
      setStatus('done')
    } catch (e: unknown) {
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

      // Batch accounts into groups of 10 (Solana tx size limit)
      const BATCH_SIZE = 10
      const batches: CloseableAccount[][] = []
      for (let i = 0; i < accounts.length; i += BATCH_SIZE) {
        batches.push(accounts.slice(i, i + BATCH_SIZE))
      }

      for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
        const batch = batches[batchIdx]
        const tx = new Transaction()

        // Close each account in this batch, sending lamports to user
        for (const acct of batch) {
          tx.add(
            createCloseAccountInstruction(
              acct.pubkey,   // account to close
              publicKey,     // destination (user receives SOL)
              publicKey,     // authority (user must sign)
            )
          )
        }

        // Calculate fee for this batch
        const batchLamports = batch.reduce((sum, a) => sum + a.lamports, 0)
        const feeLamports = Math.floor(batchLamports * (FEE_PERCENT / 100))

        if (feeLamports > 0) {
          tx.add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: feeWalletPubkey,
              lamports: feeLamports,
            })
          )
        }

        const { blockhash } = await connection.getLatestBlockhash()
        tx.recentBlockhash = blockhash
        tx.feePayer = publicKey

        const sig = await sendTransaction(tx, connection)
        await connection.confirmTransaction(sig, 'confirmed')
        signatures.push(sig)
      }

      setTxSignatures(signatures)
      setAccounts([])
      setStatus('claimed')
    } catch (e: unknown) {
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
