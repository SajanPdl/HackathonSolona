# AamaPay - On-Chain Remittance System Specification

## 1. Concept & Vision

AamaPay is a decentralized remittance platform enabling diaspora workers to send USDC to Nepal, where recipients can withdraw cash through verified merchant agents or hold in their wallets. The platform bridges traditional cash-out networks with blockchain efficiency, creating a compliant, low-cost alternative to Western Union and MoneyGram.

**Core Promise**: Send $100, pay $1 fee, recipient gets cash in minutes.

## 2. System Architecture

### High-Level Flow
```
Sender (overseas)
    │
    ▼
[Phantom Wallet] ──USDC──▶ [Solana Smart Contract (Escrow)]
    │                              │
    │                       [Claim Code Generated]
    │                              │
    │                        [Backend API]
    │                              │
    │                              ▼
Recipient (Nepal) ◀──[Claim Code]── [Backend Database]
    │                              │
    │                    ┌─────────┴─────────┐
    │                    ▼                   ▼
    │               [Hold Wallet]    [Merchant Agent Cash-out]
    │                                        │
    │                                   [Agent Dashboard]
    │                                        │
    └────────────────────────────────────────┘
                         │
                         ▼
              [Solana Contract Releases Funds]
                         │
                         ▼
                  [Agent's USDC Wallet]
```

### Component Breakdown

| Component | Technology | Purpose |
|-----------|------------|---------|
| Blockchain | Solana + Anchor | Escrow, claim validation, fund release |
| Frontend | Next.js 14 + Tailwind | Sender/Recipient/Agent interfaces |
| Backend | Node.js + Express | API, auth, claim code mgmt |
| Database | PostgreSQL + Prisma | Users, transactions, agents |
| Wallet | Phantom SDK | Wallet connection, signing |

## 3. Design Language

### Color Palette
- **Primary**: `#2563EB` (Blue - trust, financial)
- **Secondary**: `#10B981` (Emerald - success, growth)
- **Accent**: `#F59E0B` (Amber - Nepal warmth)
- **Background**: `#F8FAFC` (Slate-50)
- **Surface**: `#FFFFFF`
- **Text Primary**: `#1E293B` (Slate-800)
- **Text Secondary**: `#64748B` (Slate-500)
- **Error**: `#EF4444`
- **Success**: `#22C55E`

### Typography
- **Headings**: Inter (700, 600)
- **Body**: Inter (400, 500)
- **Mono**: JetBrains Mono (addresses, codes)

### Motion
- Page transitions: 200ms ease-out
- Button hover: scale(1.02), 150ms
- Success animations: checkmark draw, 400ms
- Loading: pulse skeleton, 1.5s infinite

## 4. Features & Interactions

### Sender Flow
1. Connect Phantom wallet
2. Enter recipient identifier (phone/email)
3. Enter amount in USDC
4. Review fee breakdown (0.5% platform fee)
5. Confirm transaction
6. View transaction hash + claim code (shareable)

### Recipient Flow
1. Enter claim code OR connect wallet
2. Option A: Hold in wallet → funds added to balance
3. Option B: Cash out → show nearby agents → generate redemption code
4. Visit agent → show code → receive cash

### Agent Flow
1. Login with credentials
2. Scan/enter recipient's redemption code
3. Verify transaction details
4. Hand over cash
5. Confirm release → funds released to agent wallet

## 5. Smart Contract (Anchor)

### Program IDL
```typescript
interface AamapayProgram {
  accounts: {
    escrow: EscrowAccount,
    sender: UserAccount,
    recipient: UserAccount,
    agent: AgentAccount,
    mint: Mint,
  },
  instructions: {
    initialize(): Initialize,
    createTransaction(amount: u64, recipient: Pubkey): CreateTransaction,
    generateClaimCode(txId: Pubkey): GenerateClaimCode,
    redeemClaim(claimCode: string, agent: Pubkey): RedeemClaim,
    cancelTransaction(txId: Pubkey): CancelTransaction,
  }
}
```

## 6. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User/Agent login |
| POST | `/api/transactions` | Create new transaction |
| GET | `/api/transactions/:id` | Get transaction status |
| POST | `/api/claims/generate` | Generate claim code |
| POST | `/api/claims/verify` | Verify claim code |
| POST | `/api/claims/redeem` | Redeem via agent |
| GET | `/api/agents/nearby` | Get nearby agents |
| POST | `/api/agents/verify` | Agent verification |

## 7. Database Schema

### Users
- id, wallet_address, phone, email, kyc_status, created_at

### Transactions
- id, sender_id, recipient_id, amount, fee, status, solana_tx, claim_code_hash, created_at

### ClaimCodes
- id, transaction_id, code_hash, expires_at, is_used, created_at

### Agents
- id, wallet_address, name, location, phone, is_verified, total_payouts, created_at

## 8. Security Architecture

1. **Double-spend prevention**: Solana's parallel execution + atomic transactions
2. **Claim code security**: SHA-256 hash + 24hr expiry + rate limiting
3. **Agent verification**: Multi-factor auth + location verification
4. **API security**: JWT + rate limiting + input validation
5. **KYC**: Optional for higher limits

## 9. Technical Approach

### Frontend: Next.js 14 App Router
- Server components for initial load
- Client components for wallet interaction
- Tailwind CSS for styling
- React Query for data fetching

### Backend: Node.js + Express
- RESTful API design
- JWT authentication
- bcrypt for password hashing
- Prisma ORM for PostgreSQL

### Blockchain: Solana + Anchor
- Program deployed on Devnet for testing
- SPL Token for USDC
- CPI (Cross-Program Invocation) for transfers