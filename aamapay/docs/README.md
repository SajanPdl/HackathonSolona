# AamaPay - Complete System Documentation

---

# 1. PRODUCT ARCHITECTURE

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 14)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Sender  │  │ Recipient│  │  Agent  │  │   Landing  │  │
│  │   App   │  │   App    │  │Dashboard│  │    Page    │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │
└───────┼──────────────┼──────────────┼──────────────┼──────────┘
        │              │              │             │
        │              │              │             │
        ▼              ▼              ▼             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Node.js + Express)                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │   Auth   │  │Transaction│ │  Claims  │  │  Agents  │ │
│  │  Routes  │  │  Routes   │  │  Routes  │  │ Routes  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘ │
└───────┼──────────────┼──────────────┼─────────────┼──────┘
        │              │              │            │
        │              │              │            │
        ▼              ▼              ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL + Prisma)                  │
│  ┌────────┐  ┌────────────┐  ┌──────────┐  ┌───────┐ │
│  │ Users │  │Transaction│  │ClaimCode│  │ Agent │ │
│  └──────┘  └──────────┘  └─────────┘  └───────┘ │
└───────────────────────────────────────────────────────────────┘
        │
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│              BLOCKCHAIN (Solana + Custom Program)                │
┌─────────────────────────────────────────────────────────────────┐
│  ┌────────────────────────��──────────────────────────────────┐    │
│  │              ESCROW ACCOUNT (Program)                   │    │
│  │  - Locked USDC from sender                          │    │
│  │  - Release to agent on valid claim               │    │
│  └───────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### Frontend Components
| Component | Location | Purpose |
|----------|----------|---------|
| Landing Page | `/` | Marketing + wallet connection |
| Send Page | `/send` | Sender interface for creating transactions |
| Claim Page | `/claim` | Recipient claim code entry + wallet deposit |
| Agent Dashboard | `/agent` | Agent verification + payout |
| Agent Register | `/agent/register` | New agent signup |

### Backend Components
| Component | Location | Purpose |
|----------|----------|---------|
| Auth Router | `/routes/auth.ts` | User registration, login, JWT |
| Transaction Router | `/routes/transactions.ts` | Create, list, retrieve transactions |
| Claims Router | `/routes/claims.ts` | Generate, verify, redeem claims |
| Agents Router | `/routes/agents.ts` | Agent registration, lookup |

### Blockchain Components
| Component | Location | Purpose |
|----------|----------|---------|
| Rust Program | `/contracts/...` | Escrow logic, fund release |
| IDL | `/contracts/idl.json` | Anchor interface definition |

## Data Flow

### Send Money Flow
```
1. User connects Phantom wallet
2. User enters: recipient ID + amount
3. Backend creates: Transaction + Claim Code
4. Frontend triggers: Solana transfer (USDC → Escrow)
5. On confirmation: Transaction status = ESCROWED
6. User shares: Claim Code with recipient
```

### Claim Money Flow
```
1. Recipient enters: Claim Code
2. Backend verifies: Claim Code hash + expiry
3. Option A: Deposit to wallet → Transfer USDC to recipient
4. Option B: Cash via agent → Agent confirms → Funds released
```

## Security Layers

1. **Wallet Auth**: Phantom wallet signatures
2. **API Auth**: JWT tokens with 7-day expiry
3. **Claim Code**: SHA-256 hashed, 24-hour expiry
4. **Rate Limiting**: 100 req/15min per IP
5. **Input Validation**: Zod schemas
6. **Solana**: Program-owned escrow, atomic transactions

---

# 2. TECH STACK

## Each Technology Justified

### Frontend: Next.js 14 + React + Tailwind
- **Why**: Server components for SEO, client components for wallet interaction
- **Tailwind**: Rapid UI development, consistent design system
- **Wallet Adapter**: Official Solana libraries with Phantom support

### Backend: Node.js + Express
- **Why**: Fast development, extensive ecosystem
- **Express**: Minimal, flexible routing
- **Prisma**: Type-safe database operations
- **Zod**: Runtime input validation

### Database: PostgreSQL + Prisma
- **Why**: ACID compliance critical for financial transactions
- **Prisma**: Type-safe queries, migrations
- **PostgreSQL**: Robust, scalable, JSON support

### Blockchain: Solana
- **Why**: Low fees (<$0.001), fast (~400ms), USDC support
- **Program**: Custom Rust for escrow logic

### Wallet: Phantom
- **Why**: Dominant wallet in Nepal/remittance corridors
- **SDK**: Official React adapters

---

# 3. SMART CONTRACT

## Program Logic (Rust)

### Key Functions

| Function | Instruction | Purpose |
|----------|------------|---------|
| `createTransaction` | 0 | Transfer USDC to escrow |
| `verifyAndRelease` | 1 | Release to agent |
| `cancelTransaction` | 2 | Return to sender |
| `initializeEscrow` | 3 | Create escrow account |

### Security Considerations

1. **Signer verification**: All modifying instructions require sender/agent signature
2. **Token check**: Token program must match USDC mint
3. **Amount validation**: Reject zero amounts
4. **Expiry**: Transactions expire after 24 hours if unclaimed

---

# 4. BACKEND SYSTEM

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | Wallet-based login |
| GET | `/api/auth/me` | Current user |
| POST | `/api/transactions` | Create transaction |
| GET | `/api/transactions/:id` | Get transaction |
| GET | `/api/transactions` | List transactions |
| POST | `/api/claims/generate` | Generate claim code |
| POST | `/api/claims/verify` | Verify claim code |
| POST | `/api/claims/redeem` | Redeem claim |
| POST | `/api/agents/register` | Agent signup |
| POST | `/api/agents/login` | Agent login |
| GET | `/api/agents/nearby` | Find agents |

## Claim Code Hashing

```typescript
// Generate: random 12-char string
// Hash: SHA-256
// Expiry: 24 hours
// Storage: hash only, never plaintext
```

---

# 5. FRONTEND APPLICATION

### Sender App (`/send`)
- Connect Phantom
- Enter amount + recipient
- View fee breakdown
- Confirm → get claim code

### Recipient App (`/claim`)
- Enter claim code
- Verify transaction
- Choose: wallet deposit or cash agent

### Agent Dashboard (`/agent`)
- Login with wallet
- View stats
- Enter claim code
- Confirm payout → release funds

---

# 6. DATABASE DESIGN

## Schema Summary

| Table | Purpose |
|-------|---------|
| User | Wallet owners, KYC status |
| Agent | Cash agents, locations |
| Transaction | All transfers, status |
| ClaimCode | One-time codes, expiry |
| Redemption | Agent payouts |

---

# 7. SECURITY ARCHITECTURE

| Risk | Mitigation |
|------|-----------|
| Double spending | Solana atomic transactions |
| Claim code theft | SHA-256 hash + expiry |
| Agent fraud | Multi-factor verification |
| API abuse | Rate limiting + JWT |
| Replay attacks | Nonce in transactions |

---

# 8. DEPLOYMENT PLAN

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-here"
PORT=3001
FRONTEND_URL="https://..."
SOLANA_NETWORK="devnet"
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_SOLANA_NETWORK="devnet"
```

## Hosting Recommendations

| Component | Platform | Notes |
|-----------|----------|-------|
| Frontend | Vercel | Next.js optimized |
| Backend | Render/Railway | Node.js ready |
| Database | Neon/Supabase | PostgreSQL |
| Contract | Solana CLI | Devnet first |

---

# 9. MVP ROADMAP

## Day 1: Core
- [x] Smart contract scaffold
- [x] Backend API routes
- [x] Database schema
- [x] Auth flow

## Day 2: Integration
- [x] Transaction creation
- [x] Claim code logic
- [x] Frontend pages
- [x] Wallet connect

## Day 3: Polish
- [x] Agent flow
- [x] Error handling
- [x] Demo demo

---

# 10. BONUS IMPROVEMENTS

## Scalability
- Batch processing for multiple redemptions
- Agent network tiering (Bronze → Silver → Gold)
- Auto agent liquidity rebalancing

## Monetization
- 0.5% platform fee on transactions
- Agent onboarding fee ($50)
- Premium features for verified agents

## Nepal Rollout
- Partner with existing remittance companies
- Khalti/NMB integration
- Fonepay connectivity
- In-person agent onboarding events

## Future Features
- NFT receipts
- Multi-currency support
- Savings integration
- Loan against deposits
- Bill pay in Nepal

---

*System designed for hackathon demo. Production requires: KYC compliance, audit, legal entity.*