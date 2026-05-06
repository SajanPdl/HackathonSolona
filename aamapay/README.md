# AamaPay - On-Chain Remittance System

## What is AamaPay?

AamaPay is a blockchain-powered remittance platform that enables users to send **SOL (Solana cryptocurrency)** to Nepal, where recipients can withdraw cash from local merchant agents using a secure claim code system. No bank accounts required - just fast, secure, and instant transfers.

---

## 🎯 Mission

Enable financial inclusion for the Nepal diaspora by providing instant, low-cost remittance powered by blockchain technology.

---

## How It Works (Step by Step)

### For Senders:
1. **Connect Wallet** - Connect Phantom wallet (Solana)
2. **Enter Amount** - Specify how much SOL to send
3. **Add Recipient** - Enter recipient's phone/email/wallet (optional)
4. **Generate Claim Code** - System creates a unique, secure code
5. **Share Code** - Send the claim code to recipient via any channel
6. **Done!** - Transaction confirmed on-chain

### For Recipients:
1. **Visit Claim Page** - Go to /claim on website
2. **Enter Code** - Input the claim code received
3. **Verify** - Confirm amount and sender details
4. **Locate Agent** - Find nearby AamaPay agent
5. **Get Cash** - Show code, receive NPR equivalent

### For Agents:
1. **Register** - Sign up as AamaPay agent
2. **Get Verified** - Complete KYC verification
3. **Receive Codes** - Customers bring claim codes
4. **Verify & Payout** - Validate and give cash
5. **Get Commission** - Earn 0.5% per transaction

---

## 🔐 Claim Code System - Full Logic

### Code Generation Algorithm:

The claim code is generated using a **cryptographically secure random string** combined with **hashing**:

```
1. Generate random 12-character string
   └── Characters: A-Z, 0-9 (uppercase only)
   └── Example: "VM0OXICTDGKB"

2. Create hash of the code for storage
   └── Use SHA-256 for one-way encryption
   └── codeHash = SHA256(codePlain)
   └── Store: codeHash in database (NOT plain code)

3. Generate unique transaction ID
   └── Format: "AAP" + timestamp + random
   └── Example: "AAP1778001115387D118"

4. Set expiration (24 hours from creation)
   └── expiry = now + 24 hours

5. Associate with transaction
   └── Link code to specific amount/sender
```

### Code Verification Process:

```
User enters claim code
         │
         ▼
Hash the input code
         │
         ▼
Compare with stored hash
         │
         ▼
Check expiration
         │
         ▼
Check if already used
         │
         ▼
Return: VALID or INVALID
```

### Security Features:
- ⏰ **24-hour expiry** - Codes expire after 1 day
- 🔒 **Hashed storage** - Plain codes never stored
- ♻️ **One-time use** - Codes can only be redeemed once
- 🏦 **Agent verification** - Only verified agents can redeem

---

## 🏗️ Architecture

### System Architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 14)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  /send   │  │ /claim   │  │ /agent  │  │/profile │       │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘       │
│       │             │             │             │              │
│       └─────────────┴─────────���───┴─────────────┘              │
│                         │                                     │
│                    WalletContext                              │
│              (Phantom Wallet Adapter)                         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                    HTTP API (REST)
                          │
┌─────────────────────────┴───────────────────────────────────────┐
│                      BACKEND (Node.js + Express)                │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                      Routes                              │    │
│  │  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐        │    │
│  │  │  Auth   │ │Transaction│ │ Claims │ │Agents  │        │    │
│  │  └────┬────┘ └────┬─────┘ └────┬───┘ └────┬────┘        │    │
│  └───────┼───────────┼───────────┼──────────┼───────────────┘    │
│          │           │           │          │                   │
│  ┌───────┴───────────┴───────────┴──────────┴───────────────┐  │
│  │                    Middleware                             │    │
│  │  ┌─────────────┐  ┌────────────┐  ┌─────────────────┐   │    │
│  │  │ Rate Limit  │  │   Auth     │  │  Error Handler   │   │    │
│  │  └─────────────┘  └────────────┘  └─────────────────┘   │    │
│  └────────────────────────┬──────────────────────────────────┘    │
└──────────────────────────┼──────────────────────────────────────────┘
                         │
                    Database (SQLite/PostgreSQL)
                         │
┌────────────────────────┴──────────────────────────────────────┐
│                  PRISMA ORM                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Users   │  │Transactions│ │ClaimCodes│ │ Agents   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└──────────────────────────────────────────────────────────────────┘
```

### Technology Stack:

| Layer | Technology | Purpose |
|-------|-------------|---------|
| Frontend Framework | Next.js 14 | React-based UI |
| Styling | Tailwind CSS | Utility-first CSS |
| Animations | GSAP | Scroll animations |
| State Management | React Query | Server state |
| Wallet | Phantom (Solana) | Crypto wallet |
| Backend | Node.js + Express | API server |
| Database | SQLite (dev) / PostgreSQL (prod) | SQL database |
| ORM | Prisma | Database access |
| Authentication | JWT (Bearer token) | Stateless auth |

---

## 💻 Full MVP Features

### User Features:
- ✅ Connect Solana wallet (Phantom)
- ✅ Send SOL to Nepal
- ✅ Generate secure claim codes
- ✅ Share codes via any channel
- ✅ View transaction history
- ✅ Link email & phone to account
- ✅ Add multiple wallets
- ✅ Profile management

### Recipient Features:
- ✅ Verify claim code validity
- ✅ View transaction amount
- ✅ Find nearby agents
- ✅ Direct wallet deposit option

### Agent Features:
- ✅ Agent registration
- ✅ Dashboard with stats
- ✅ Code verification
- ✅ Payout processing
- ✅ Transaction history
- ✅ Commission tracking

### Admin Features:
- ✅ View all transactions
- ✅ Manage users
- ✅ Verify agents
- ✅ Platform analytics
- ✅ Agent approval

---

## 📊 Database Schema (Prisma)

### Users Table:
```prisma
model User {
  id            String    @id @default(uuid())
  email         String?   @unique
  phone         String?   @unique
  name          String?
  googleId      String?   @unique
  kycStatus     String    @default("PENDING")
  isVerified   Boolean   @default(false)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  wallets      Wallet[]
  sentTransactions   Transaction[]
  receivedTransactions Transaction[]
}
```

### Wallets Table (Multi-wallet support):
```prisma
model Wallet {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  address      String   @unique
  type         String   @default("SOLANA")
  isPrimary    Boolean  @default(false)
  createdAt    DateTime @default(now())
}
```

### Transactions Table:
```prisma
model Transaction {
  id                String    @id @default(uuid())
  senderId          String
  sender            User      @relation("senderTransactions")
  recipientId      String?
  recipient         User?     @relation("recipientTransactions")
  amount           Float
  fee              Float
  totalAmount      Float
  currency         String    @default("SOL")
  status           String    @default("PENDING")
  solanaTx         String?
  claimCodeHash    String?
  claimCodeExpiry  DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  claimCodes      ClaimCode[]
  redemptions      Redemption[]
}
```

### ClaimCodes Table:
```prisma
model ClaimCode {
  id            String    @id @default(uuid())
  transactionId String
  transaction   Transaction @relation(fields: [transactionId])
  codeHash      String    @unique
  codePlain     String
  expiresAt    DateTime
  isUsed       Boolean   @default(false)
  usedAt       DateTime?
  createdAt    DateTime  @default(now())
}
```

### Agents Table:
```prisma
model Agent {
  id            String    @id @default(uuid())
  name          String
  phone         String    @unique
  email         String?
  walletAddress String    @unique
  location      String
  lat           Float?
  lng           Float?
  isVerified    Boolean   @default(false)
  isActive      Boolean   @default(true)
  totalPayouts  Int       @default(0)
  totalVolume   Float     @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  redemptions   Redemption[]
}
```

---

## 🔄 Transaction Lifecycle

```
┌─────��─��────────────────────────────────────────────────────────────┐
│                     TRANSACTION FLOW                                │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  1. USER CREATES TRANSACTION                                        │
│     └─► POST /api/transactions                                     │
│         │                                                          │
│         ▼                                                          │
│  2. BACKEND PROCESSES                                              │
│     ├─► Create transaction record                                 │
│     ├─► Generate claim code (random 12 chars)                     │
│     ├─► Hash the code (SHA-256)                                    │
│     ├─► Store hash (NOT plain code)                               │
│     ├─► Set expiry (24 hours)                                     │
│     └─► Return code to user                                        │
│         │                                                          │
│         ▼                                                          │
│  3. STATUS: "PENDING"                                             │
│                                                                    │
│  4. USER SHARES CLAIM CODE                                         │
│     (via WhatsApp, SMS, Signal, etc.)                              │
│         │                                                          │
│         ▼                                                          │
│  5. RECIPIENT VERIFIES                                              │
│     └─► POST /api/claims/verify                                    │
│         │                                                          │
│         ▼                                                          │
│  6. BACKEND VERIFIES                                               │
│     ├─► Hash input code                                            │
│     ├─► Compare with stored hash                                   │
│     ├─► Check expiration                                           │
│     ├─► Check if already used                                      │
│     └─► Return transaction details                                │
│         │                                                          │
│         ▼                                                          │
│  7. AGENT REDEEMS                                                  │
│     └─► POST /api/claims/redeem                                    │
│         │                                                          │
│         ▼                                                          │
│  8. BACKEND REDEEMS                                                 │
│     ├─► Mark code as used                                          │
│     ├─► Update transaction status                                 │
│     ├─► Create redemption record                                   │
│     ├─► Increment agent stats                                       │
│     └─► Return success                                             │
│         │                                                          │
│         ▼                                                          │
│  9. STATUS: "CLAIMED"                                               │
│                                                                    │
│ 10. RECIPIENT RECEIVES CASH                                         │
│     └─► Agent gives NPR equivalent                                │
│                                                                    │
│         ▼                                                          │
│  11. STATUS: "COMPLETED"                                            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🔒 Security Architecture

### Authentication Flow:
```
1. User connects wallet (Phantom)
         │
         ▼
2. Get wallet address (public key)
         │
         ▼
3. Send to /api/auth/login
         │
         ▼
4. Server generates JWT token
   - Contains: userId, walletAddress, role
   - Expires: 7 days
         │
         ▼
5. Store token in localStorage
         │
         ▼
6. All API requests include:
   Authorization: Bearer <token>
```

### Security Measures:
- 🔑 **JWT Authentication** - Stateless, secure tokens
- 🏦 **Wallet-only auth** - No passwords to leak
- ⏰ **Token expiry** - 7-day validity
- 🔒 **Code hashing** - Plain codes never stored
- ⏳ **Code expiry** - 24-hour window
- ♻️ **One-time use** - Prevents double-spending
- ✅ **Agent KYC** - Verified agents only
- 📊 **Rate limiting** - Prevents abuse
- 🔐 **HTTPS** - Secure communication

---

## 📡 API Endpoints

### Authentication:
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account with wallet |
| POST | `/api/auth/login` | No | Login with wallet |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/update` | Yes | Update profile |

### Transactions:
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/transactions` | Yes | Create transaction |
| GET | `/api/transactions` | No | List transactions |
| GET | `/api/transactions/:id` | Yes | Get transaction |

### Claims:
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/claims/verify` | No | Verify claim code |
| POST | `/api/claims/redeem` | No | Redeem claim code |

### Agents:
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/agents/register` | No | Register agent |
| GET | `/api/agents` | No | List agents |
| GET | `/api/agents/nearby` | No | Find nearby |
| GET | `/api/agents/:id` | Yes | Get agent |

---

## 🚀 Getting Started

### Prerequisites:
- Node.js 18+
- npm or yarn
- Git

### Installation:

```bash
# Clone project
cd aamapay

# Install all dependencies
npm install

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### Running:

```bash
# Terminal 1 - Backend (port 3001)
cd backend
npx tsx src/index.ts

# Terminal 2 - Frontend (port 3000)
cd frontend
npx next dev
```

### Environment Variables:

**Backend (.env):**
```env
PORT=3001
DATABASE_URL=file:./dev.db
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

---

## 🌍 Deployment to Production

### Backend (Railway/Render):
```bash
# 1. Push to GitHub
# 2. Connect to Railway/Render
# 3. Set variables:
#    PORT=3001
#    DATABASE_URL=postgresql://...
#    JWT_SECRET=<random-32-chars>
# 4. Build: npm run build
# 5. Start: npx tsx src/index.ts
```

### Frontend (Vercel):
```bash
# 1. Push to GitHub
# 2. Connect to Vercel
# 3. Set variables:
#    NEXT_PUBLIC_API_URL=https://api.aamapay.com
#    NEXT_PUBLIC_SOLANA_NETWORK=mainnet
# 4. Deploys automatically
```

### Database (PostgreSQL):
- Use **Supabase** or **Neon**
- Update schema.prisma for PostgreSQL
- Run migrations

---

## 📁 Project Structure

```
aamapay/
├── backend/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   │   ├── auth.ts
│   │   │   ├── transactions.ts
│   │   │   ├── claims.ts
│   │   │   ├── agents.ts
│   │   │   └── users.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts     # JWT verification
│   │   │   └── errorHandler.ts
│   │   ├── config/
│   │   │   └── prisma.ts
│   │   ├── utils/
│   │   │   └── crypto.ts  # Code generation
│   │   └── index.ts       # Express app
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router
│   │   │   ├── page.tsx
│   │   │   ├── send/
│   │   │   ├── claim/
│   │   │   ├── receive/
│   │   │   ├── agent/
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   ├── admin/
│   │   │   └── simulation/
│   │   ├── components/
│   │   │   ├── Landing/
│   │   │   ├── CinematicLanding/
│   │   │   ├── Simulation/
│   │   │   └── ...
│   │   ├── context/
│   │   │   └── WalletContext.tsx
│   │   ├── lib/
│   │   │   └── simulation/
│   │   └── utils/
│   │       └── api.ts
│   ├── package.json
│   └── tailwind.config.ts
├── database/
│   └── schema.prisma
├── contracts/              # Solana programs
├── docs/
├── SPEC.md
├── README.md
├── package.json
└── start.sh
```

---

## 🛠️ Common Issues & Solutions

### Issue: "Port in use"
```bash
pkill -f "next"
pkill -f "tsx"
```

### Issue: "Database not found"
```bash
cd database
npx prisma generate
npx prisma db push
```

### Issue: "Wallet not connecting"
- Install Phantom browser extension
- Click connect button
- Approve connection in Phantom

---

## 📞 Support

- Check browser console (F12) for errors
- Check backend terminal for logs
- Review codebase comments

---

## 📜 License

MIT License

---

**Built with ❤️ for financial inclusion in Nepal**

**Powered by Solana Blockchain**