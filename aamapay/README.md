# AamaPay - On-Chain Remittance System

## What is AamaPay?

AamaPay is a web application that lets you send money (in SOL cryptocurrency) to Nepal instantly. The recipient can then get cash from a local agent using a special code. No banks, no waiting days, just fast and simple transfers.

---

## How It Works (Simple Version)

### For Senders:
1. **Connect your wallet** - Use Phantom wallet (like a digital bank account)
2. **Enter how much to send** - Put the amount in SOL
3. **Get a claim code** - A special code is generated for the recipient
4. **Share the code** - Tell the recipient the code (via WhatsApp, SMS, etc.)
5. **Done!** - Money leaves your wallet instantly

### For Recipients:
1. **Go to claim page** - Enter the claim code
2. **Verify** - See how much money you're receiving
3. **Meet an agent** - Find a nearby AamaPay agent
4. **Get cash** - Show the code, get your money in Nepali Rupees

### For Agents:
1. **Register** - Sign up as a cash pickup point
2. **Verify code** - When someone comes with a code
3. **Give cash** - Pay them the Nepalese Rupees equivalent
4. **Get commission** - Earn a small fee for each transaction

---

## Technical Overview

### What Technologies We Use:

| Part | Technology | Purpose |
|------|-----------|---------|
| Frontend | Next.js 14 | Website & UI |
| Backend | Node.js + Express | API Server |
| Database | SQLite (dev), PostgreSQL (prod) | Data Storage |
| Wallet | Phantom (Solana) | Connect wallet |
| Blockchain | Solana Network | Verify transactions |

### System Flow:

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Sender    │ ───► │  Backend  │ ───► │ Blockchain│
│  (Wallet) │      │  (API)   │      │ (Solana)  │
└─────────────┘      └─────────────┘      └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Claim Code │ ───► Recipient gets cash
                    │ Generator │
                    └─────────────┘
```

### Pages on the Website:

| URL | Purpose |
|-----|--------|
| `/` | Landing page, how it works |
| `/send` | Send money to Nepal |
| `/claim` | Enter code to get money |
| `/receive` | Receive to wallet directly |
| `/agent` | Agent dashboard |
| `/agent/register` | Become an agent |
| `/dashboard` | See your transactions |
| `/profile` | User profile, link email/phone |
| `/admin` | Admin panel |
| `/simulation` | Demo of live transactions |

---

## Database Schema

### Users Table:
- `id` - Unique ID
- `email` - Linked email (optional)
- `phone` - Linked phone (optional)
- `name` - Display name
- `googleId` - Google login ID (optional)
- `kycStatus` - Verification status
- `isVerified` - Account verified?

### Wallets Table:
- `id` - Unique ID
- `userId` - Owner user
- `address` - Wallet address (like account number)
- `type` - Wallet type (SOLANA)
- `isPrimary` - Main wallet?

### Transactions Table:
- `id` - Unique ID
- `senderId` - Who sent
- `recipientId` - Who receives
- `amount` - How much SOL
- `fee` - Transaction fee
- `status` - PENDING → CONFIRMED → CLAIMED → COMPLETED
- `claimCodeHash` - Encrypted claim code
- `solanaTx` - Blockchain transaction ID

### ClaimCodes Table:
- `id` - Unique ID
- `transactionId` - Related transaction
- `codePlain` - The actual code (e.g., "ABC123XYZ")
- `codeHash` - Encrypted version
- `expiresAt` - When code expires
- `isUsed` - Has it been used?

### Agents Table:
- `id` - Unique ID
- `name` - Agent name
- `phone` - Contact number
- `location` - Address
- `isVerified` - Verified agent?
- `totalPayouts` - How many payouts done
- `totalVolume` - Total money handled

---

## Setting Up Development

### Prerequisites:
- Node.js 18+
- npm or yarn
- Git

### Installation:

```bash
# Clone or download the project
cd aamapay

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Go back and install frontend
cd ../frontend
npm install
```

### Running the App:

```bash
# Terminal 1 - Start backend
cd backend
npx tsx src/index.ts
# Shows: AamaPay API running on port 3001

# Terminal 2 - Start frontend
cd frontend
npx next dev
# Shows: Ready in http://localhost:3000
```

### Environment Variables:

Create `.env` files:

**Backend `.env`:**
```env
PORT=3001
DATABASE_URL=file:./dev.db
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

---

## Key Files & Directories:

```
aamapay/
├── backend/
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   │   ├── auth.ts       # Login/register
│   │   │   ├── transactions.ts
│   │   │   ├── claims.ts
│   │   │   └── agents.ts
│   │   ├── middleware/    # Authentication
│   │   └── config/       # Database config
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js pages
│   │   │   ├── send/page.tsx
│   │   │   ├── claim/page.tsx
│   │   │   ├── agent/page.tsx
│   │   │   └── profile/page.tsx
│   │   ├── components/  # Reusable components
│   │   ├── context/    # Wallet connection
│   │   └── utils/     # API utilities
│   └── package.json
├── database/
│   └── schema.prisma  # Database definition
└── package.json
```

---

## API Endpoints:

### Authentication:
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login with wallet |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/update` | Update profile |

### Transactions:
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transactions` | Create new transaction |
| GET | `/api/transactions` | List all transactions |
| GET | `/api/transactions/:id` | Get specific transaction |

### Claims:
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/claims/verify` | Verify claim code |
| POST | `/api/claims/redeem` | Redeem claim code |

### Agents:
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/agents/register` | Register as agent |
| GET | `/api/agents` | List agents |
| GET | `/api/agents/nearby` | Find nearby agents |

---

## Transaction Flow:

```
1. SENDER creates transaction
       │
       ▼
2. Backend creates transaction + claim code
       │
       ▼
3. Transaction status = "PENDING"
       │
       ▼
4. Sender shares claim code with recipient
       │
       ▼
5. Recipient goes to /claim, verifies code
       │
       ▼
6. Agent verifies and redeems code
       │
       ▼
7. Transaction status = "CLAIMED"
       │
       ▼
8. Agent gives cash to recipient
       │
       ▼
9. Transaction status = "COMPLETED"
```

---

## Security Features:

1. **Wallet-based auth** - No passwords needed
2. **Claim code expiry** - Codes expire after 24 hours
3. **One-time use** - Each code can only be used once
4. **Encrypted codes** - Plain codes are encrypted in database
5. **Agent verification** - Only verified agents can give cash

---

## Production Deployment:

### Backend (Railway/Render):
1. Push to GitHub
2. Connect to Railway/Render
3. Set environment variables:
   - `PORT` → 3001
   - `DATABASE_URL` → PostgreSQL URL
   - `JWT_SECRET` → Random secure string
4. Build command: `npm run build`
5. Start command: `npx tsx src/index.ts`

### Frontend (Vercel):
1. Push to GitHub
2. Connect to Vercel
3. Set environment variable:
   - `NEXT_PUBLIC_API_URL` → Your backend URL
   - `NEXT_PUBLIC_SOLANA_NETWORK` → mainnet
4. Deploy automatically

### Database:
- Use **Supabase** or **Neon** (PostgreSQL)
- Update `schema.prisma` for PostgreSQL:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## Common Issues:

### "Port 3000 already in use"
```bash
# Kill existing processes
pkill -f "next"
pkill -f "tsx"
```

### "Database not found"
```bash
cd database
npx prisma db push
```

### "Wallet not connecting"
- Make sure Phantom extension is installed
- Click "Connect Wallet" button
- Approve in Phantom popup

---

## Support & Help:

For questions or issues:
- Check the codebase comments
- Open browser console (F12) for error messages
- Check backend logs in terminal

---

## License:

MIT License - Feel free to use and modify!

---

**Made with ❤️ for financial inclusion in Nepal**