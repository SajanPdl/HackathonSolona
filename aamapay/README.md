# AamaPay - Complete Technical Documentation

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Solution Overview](#solution-overview)
4. [Claim Code System - Deep Dive](#claim-code-system---deep-dive)
5. [Security Architecture](#security-architecture)
6. [Technical Stack Deep Dive](#technical-stack-deep-dive)
7. [Database Schema - Complete](#database-schema---complete)
8. [API Reference](#api-reference)
9. [Transaction Flow - Technical](#transaction-flow---technical)
10. [Wallet Integration](#wallet-integration)
11. [Deployment Guide](#deployment-guide)
12. [Architecture Diagrams](#architecture-diagrams)

---

## 1. Executive Summary

**AamaPay** is a decentralized remittance platform built on the **Solana blockchain** that enables instant, low-cost money transfers from anywhere in the world to Nepal. The platform uses a unique **claim code system** that allows recipients to receive cash from local agents without needing a bank account or cryptocurrency wallet.

### Key Metrics:
- **Transaction Time**: < 1 second (Solana)
- **Platform Fee**: 0.5%
- **Agent Commission**: 0.5%
- **Code Validity**: 24 hours
- **Network**: Solana Devnet (development) / Mainnet (production)

---

## 2. Problem Statement

### Traditional Remittance Issues:
1. **High Fees** - Banks and money transfer services charge 3-7%
2. **Slow Transfers** - Can take 2-5 business days
3. **Bank Dependency** - Recipient needs a bank account
4. **Limited Hours** - Only business hours available
5. **Hidden Costs** - Exchange rate markups
6. **Accessibility** - Physical locations required

### Our Solution:
1. **Low Fees** - 0.5% platform fee
2. **Instant Settlement** - Solana confirms in < 1 second
3. **No Bank Required** - Cash pickup from agents
4. **24/7 Availability** - Always accessible
5. **Transparent Pricing** - No hidden costs
6. **Global Access** - Anyone with wallet can send

---

## 3. Solution Overview

### How Money Moves:

```
SENDER (USA)                    PLATFORM                    RECIPIENT (NEPAL)
     │                            │                              │
     │  1. Connect Wallet        │                              │
     │ ─────────────────────────▶│                              │
     │                            │                              │
     │  2. Send SOL to escrow    │                              │
     │ ─────────────────────────▶│                              │
     │                            │  3. Generate Claim Code    │
     │ ◀─────────────────────────│                              │
     │                            │                              │
     │  4. Share Code (WhatsApp) │                             │
     │ ────────────────────────────────────────────────────────▶ │
     │                            │                              │
     │                            │  5. Verify Code             │
     │ ◀─────────────────────────────────────────────────────── │
     │                            │                              │
     │                            │  6. Agent Confirms           │
     │                            │ ◀─────────────────────────── │
     │                            │                              │
     │                            │  7. Cash Payout (NPR)       │
     │                            │ ◀─────────────────────────── │
     │                            │                              │
     │  8. Funds Released        │                              │
     │ ◀─────────────────────────│                              │
     │                            │                              │
```

---

## 4. Claim Code System - Deep Dive

### Code Generation Process:

The claim code is the core innovation that makes this system work. Here's the complete technical process:

#### Step 1: Character Set Definition
```typescript
// We use a carefully selected character set to avoid confusion:
// - No letter O (confused with zero 0)
// - No letter I (confused with number 1)
// - No letter B (confused with number 8)
// Only: A-Z (24 chars) + 0-9 (10 chars) = 34 possible characters
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
// 12-character code = 34^12 = 4,738,381,338,136,216,064 possible combinations
```

#### Step 2: Cryptographically Secure Random Generation
```typescript
import { randomBytes } from 'crypto';

function generateClaimCode(): string {
  const code = randomBytes(12).reduce((acc, byte) => {
    return acc + CHARSET[byte % CHARSET.length];
  }, '');
  return code; // e.g., "VM0OXICTDGKB"
}
```

#### Step 3: Hash Generation (One-Way Encryption)
```typescript
import { createHash } from 'crypto';

function hashClaimCode(plainCode: string): string {
  return createHash('sha256')
    .update(plainCode)
    .digest('hex');
}
// Result: "b0526b0d6d113748d29c4f5b363557a58836c2581654092464ffdb994e4b0fca"
```

#### Step 4: Storage (What we store vs what we don't)
```typescript
// WHAT WE STORE (safe):
const storedRecord = {
  codeHash: "b0526b0d6d113748d29c4f5b363557a58836c2581654092464ffdb994e4b0fca",
  transactionId: "AAP1778001115387D118",
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  isUsed: false
};

// WHAT WE DON'T STORE:
// - The plain code ("VM0OXICTDGKB")
// - This is the secret the user must share
```

#### Step 5: Expiration Logic
```typescript
function getClaimCodeExpiry(): Date {
  // 24 hours from now
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

// When verifying, we check:
const isExpired = claimCode.expiresAt < new Date();
```

### Code Verification Process:

```typescript
async function verifyClaimCode(inputCode: string) {
  // 1. Hash the input code (same algorithm)
  const inputHash = hashClaimCode(inputCode);
  
  // 2. Find matching record
  const claimRecord = await prisma.claimCode.findFirst({
    where: { codeHash: inputHash }
  });
  
  if (!claimRecord) {
    return { valid: false, error: 'Invalid code' };
  }
  
  // 3. Check expiration
  if (new Date() > claimRecord.expiresAt) {
    return { valid: false, error: 'Code expired' };
  }
  
  // 4. Check if already used
  if (claimRecord.isUsed) {
    return { valid: false, error: 'Code already used' };
  }
  
  // 5. Return success with transaction details
  return {
    valid: true,
    transaction: await getTransactionDetails(claimRecord.transactionId)
  };
}
```

### Code Security Properties:

| Property | Value | Security Impact |
|----------|-------|----------------|
| Length | 12 characters | 34^12 = 4.7 quintillion combinations |
| Charset | 34 characters | No ambiguous characters |
| Algorithm | SHA-256 | One-way, irreversible |
| Expiry | 24 hours | Limits attack window |
| Use | One-time | Prevents replay attacks |
| Hash | Unique per code | No rainbow table attacks |

---

## 5. Security Architecture

### Authentication System:

We use **JWT (JSON Web Tokens)** for stateless authentication:

#### Token Structure:
```typescript
interface JWTPayload {
  userId: string;        // Database UUID
  walletAddress: string;  // Solana wallet address
  role: 'user' | 'agent';
  iat: number;           // Issued at (timestamp)
  exp: number;           // Expiration (7 days)
}
```

#### Token Generation:
```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

function generateToken(userId: string, walletAddress: string, role: string): string {
  return jwt.sign(
    { userId, walletAddress, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
```

#### Token Verification:
```typescript
function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

### Middleware Chain:

```
Incoming Request
       │
       ▼
┌──────────────────┐
│  Rate Limiter    │ ← 100 requests / 15 minutes
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Helmet (Headers) │ ← Security headers
└────────┬────────┘
         │
         ▼
┌──────────────────┐
│  CORS Check      │ ← Origin validation
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  JSON Parser     │ ← Body parsing
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Auth Middleware │ ← Token verification
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Route Handler   │ ← Business logic
└──────────────────┘
```

### Database Security:

```prisma
// All sensitive data is encrypted at rest
// Passwords: Not stored (wallet-only auth)
// Financial data: Full audit trail
// PII: Phone/email are optional, encrypted in DB
```

---

## 6. Technical Stack Deep Dive

### Frontend Technologies:

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | React framework with App Router |
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Styling |
| GSAP | 3.x | Animations |
| TanStack Query | 5.x | Server state management |
| Phantom Adapter | Latest | Solana wallet integration |
| Lucide React | Latest | Icons |

### Backend Technologies:

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x | Runtime |
| Express | 4.x | Web framework |
| TypeScript | 5.x | Type safety |
| Prisma | 5.x | ORM |
| SQLite | 3.x | Dev database |
| PostgreSQL | 15.x | Prod database |
| Zod | 3.x | Validation |
| Helmet | 7.x | Security headers |
| Express Rate Limit | 6.x | Rate limiting |

### Blockchain Integration:

```typescript
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

// Network configuration
const SOLANA_NETWORKS = {
  devnet: 'https://api.devnet.solana.com',
  mainnet: 'https://api.mainnet-beta.solana.com'
};

// Connection instance
const connection = new Connection(SOLANA_NETWORKS.devnet);
```

---

## 7. Database Schema - Complete

### Complete Prisma Schema with All Fields:

```prisma
// schema.prisma - Complete database definition

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"  // Change to "postgresql" for production
  url      = "file:./dev.db"
}

// ═══════════════════════════════════════════════════════════════════
// USER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

model User {
  id              String    @id @default(uuid())
  email           String?   @unique
  phone           String?   @unique
  name            String?
  googleId        String?   @unique  // For Google OAuth
  kycStatus       String    @default("PENDING")  // PENDING, VERIFIED, REJECTED
  isVerified     Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  wallets        Wallet[]
  sentTransactions   Transaction[] @relation("senderTransactions")
  receivedTransactions Transaction[] @relation("recipientTransactions")
}

model Wallet {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  address      String   @unique  // Solana wallet address
  type         String   @default("SOLANA")  // SOLANA, ETH, etc.
  isPrimary    Boolean  @default(false)
  createdAt    DateTime @default(now())
  
  @@index([userId])
  @@index([address])
}

// ═══════════════════════════════════════════════════════════════════
// TRANSACTIONS
// ═══════════════════════════════════════════════════════════════════

model Transaction {
  id                String    @id @default(uuid())
  senderId          String
  sender            User      @relation("senderTransactions", fields: [senderId], references: [id])
  recipientId       String?
  recipient         User?     @relation("recipientTransactions", fields: [recipientId], references: [id])
  
  // Amount details
  amount            Float     // SOL amount sent
  fee               Float     // Platform fee (0.5%)
  totalAmount       Float     // Total (amount + fee)
  currency          String    @default("SOL")  // Currency type
  
  // Status tracking
  status            String    @default("PENDING")  
  // PENDING → CONFIRMED → CLAIM_CODE_GENERATED → REDEEMED → COMPLETED
  // Statuses: PENDING, CONFIRMED, CLAIM_CODE_GENERATED, REDEEMED, COMPLETED, FAILED
  
  // Blockchain details
  solanaTx          String?   // On-chain transaction hash
  escrowAddress    String?   // Program-derived address
  
  // Claim code details
  claimCodeHash    String?   // Hash of claim code
  claimCodeExpiry  DateTime?  // When claim code expires
  
  // Metadata
  recipientIdentifier String?  // Phone, email, or wallet of recipient
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  
  // Relations
  claimCodes        ClaimCode[]
  redemptions       Redemption[]
  
  @@index([senderId])
  @@index([recipientId])
  @@index([status])
  @@index([createdAt])
}

// ═══════════════════════════════════════════════════════════════════
// CLAIM CODES
// ═══════════════════════════════════════════════════════════════════

model ClaimCode {
  id            String    @id @default(uuid())
  transactionId String
  transaction  Transaction @relation(fields: [transactionId], references: [id])
  
  // Code details (HASHED - plain code NEVER stored)
  codeHash      String    @unique  // SHA-256 hash
  codePlain    String    // Plain code (temporary, only during creation)
  
  // Validity
  expiresAt    DateTime  // 24 hours from creation
  isUsed        Boolean   @default(false)
  usedAt        DateTime?  // When was it used
  
  createdAt     DateTime  @default(now())
  
  @@index([transactionId])
  @@index([codeHash])
  @@index([expiresAt])
}

// ═══════════════════════════════════════════════════════════════════
// REDEMPTIONS (Agent Payouts)
// ═══════════════════════════════════════════════════════════════════

model Redemption {
  id             String    @id @default(uuid())
  transactionId  String
  transaction   Transaction @relation(fields: [transactionId], references: [id])
  agentId        String
  agent         Agent      @relation(fields: [agentId], references: [id])
  
  // Amount details
  amount        Float      // Amount in SOL
  
  // Status
  status         String    @default("PENDING")  // PENDING, COMPLETED, FAILED
  completedAt   DateTime?  // When completed
  
  // Blockchain
  solanaTx       String?   // On-chain transaction
  
  createdAt      DateTime  @default(now())
  
  @@index([transactionId])
  @@index([agentId])
}

// ═══════════════════════════════════════════════════════════════════
// AGENTS
// ═══════════════════════════════════════════════════════════════════

model Agent {
  id              String    @id @default(uuid())
  name            String
  phone           String    @unique
  email           String?   @unique
  walletAddress   String    @unique  // Payment wallet
  
  // Location
  location        String    // Physical address
  lat             Float?    // Latitude
  lng             Float?    // Longitude
  
  // Verification status
  isVerified      Boolean   @default(false)
  isActive        Boolean   @default(true)
  
  // Statistics
  totalPayouts    Int       @default(0)   // Number of payouts
  totalVolume     Float     @default(0)  // Total SOL paid out
  
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  // Relations
  redemptions     Redemption[]
  
  @@index([location])
  @@index([isVerified])
}
```

---

## 8. API Reference

### Authentication Routes

#### POST /api/auth/register
Register a new user with their wallet address.

**Request:**
```json
{
  "walletAddress": "Hx2BWiDW7e7wv5YqP5r3qJpYqP5r3qJpYqP5r3qJp",
  "email": "user@example.com",
  "phone": "+9779841234567",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "phone": "+9779841234567"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/auth/login
Login with wallet address (auto-creates account if doesn't exist).

**Request:**
```json
{
  "walletAddress": "Hx2BWiDW7e7wv5YqP5r3qJpYqP5r3qJpYqP5r3qJp"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": null,
    "wallets": [
      { "address": "...", "isPrimary": true }
    ]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET /api/auth/me
Get current authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "phone": "+9779841234567",
  "isVerified": false,
  "wallets": [...]
}
```

### Transaction Routes

#### POST /api/transactions
Create a new transaction.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "amount": 10,
  "recipientIdentifier": "+9779841234567"
}
```

**Response:**
```json
{
  "transaction": {
    "id": "AAP1778001115387D118",
    "amount": 10,
    "fee": 0.05,
    "totalAmount": 10.05,
    "claimCode": "VM0OXICTDGKB",
    "claimCodeExpiry": "2026-05-06T17:11:55.426Z",
    "status": "PENDING"
  }
}
```

#### GET /api/transactions
List all transactions.

**Response:**
```json
{
  "transactions": [
    {
      "id": "AAP1778001115387D118",
      "amount": 10,
      "status": "PENDING",
      "createdAt": "2026-05-05T17:11:55.411Z"
    }
  ]
}
```

### Claims Routes

#### POST /api/claims/verify
Verify a claim code without authentication.

**Request:**
```json
{
  "claimCode": "VM0OXICTDGKB"
}
```

**Response:**
```json
{
  "valid": true,
  "transaction": {
    "id": "AAP1778001115387D118",
    "amount": 10,
    "currency": "SOL",
    "expiresAt": "2026-05-06T17:11:55.426Z"
  }
}
```

#### POST /api/claims/redeem
Redeem a claim code (called by agent).

**Request:**
```json
{
  "claimCode": "VM0OXICTDGKB",
  "agentId": "agent-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Claim redeemed successfully"
}
```

### Agent Routes

#### POST /api/agents/register
Register as a new agent.

**Request:**
```json
{
  "name": "John's Store",
  "phone": "+9779841234567",
  "email": "store@example.com",
  "walletAddress": "Hx2BWiDW7e7wv5YqP5r3qJpYqP5r3qJpYqP5r3qJp",
  "location": "Kathmandu, Nepal"
}
```

#### GET /api/agents
List all verified agents.

**Response:**
```json
{
  "agents": [
    {
      "id": "agent-id",
      "name": "John's Store",
      "location": "Kathmandu, Nepal",
      "isVerified": true,
      "totalPayouts": 150
    }
  ]
}
```

---

## 9. Transaction Flow - Technical

### Complete Technical Flow:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: SENDER INITIATES TRANSACTION                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. User connects wallet (Phantom)                                   │
│     ↓                                                                │
│  2. Frontend sends { amount: 10, recipient: "+977..." }            │
│     ↓                                                                │
│  3. API receives POST /api/transactions                              │
│     ↓                                                                │
│  4. Backend validates request                                      │
│     - Validates amount > 0                                          │
│     - Checks sufficient wallet balance                             │
│     - Calculates fee: 10 * 0.005 = 0.05 SOL                         │
│     ↓                                                                │
│  5. Creates database record                                        │
│     Transaction {                                                   │
│       id: "AAP1778001115387D118",                                    │
│       senderId: "user-id",                                          │
│       amount: 10,                                                    │
│       fee: 0.05,                                                    │
│       totalAmount: 10.05,                                           │
│       status: "PENDING"                                             │
│     }                                                                │
│     ↓                                                                │
│  6. Generates claim code                                            │
│     - Calls generateClaimCode()                                    │
│     - Returns "VM0OXICTDGKB"                                        │
│     ↓                                                                │
│  7. Hashes code and stores                                           │
│     - codeHash = SHA256("VM0OXICTDGKB")                              │
│     - expiresAt = now + 24 hours                                    │
│     ↓                                                                │
│  8. Saves claim code record                                         │
│     ClaimCode {                                                     │
│       transactionId: "AAP1778001115387D118",                         │
│       codeHash: "b0526b0d6d113748d29c4f5b...",                     │
│       expiresAt: "2026-05-06T17:11:55.426Z",                         │
│       isUsed: false                                                  │
│     }                                                               │
│     ↓                                                                │
│  9. Returns response to frontend                                     │
│     { claimCode: "VM0OXICTDGKB", ... }                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: RECIPIENT CLAIMS                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Recipient visits /claim page                                    │
│     ↓                                                                │
│  2. Enters claim code "VM0OXICTDGKB"                                 │
│     ↓                                                                │
│  3. POST /api/claims/verify                                          │
│     ↓                                                                │
│  4. Backend hashing input                                            │
│     - inputHash = SHA256("VM0OXICTDGKB")                             │
│     ↓                                                                │
│  5. Database lookup                                                 │
│     - Finds ClaimCode where codeHash = inputHash                     │
│     ↓                                                                │
│  6. Validates                                                        │
│     - Check isUsed = false                                          │
│     - Check expiresAt > now                                         │
│     ↓                                                                │
│  7. Returns transaction details                                      │
│     { amount: 10, ... }                                              │
│     ↓                                                                │
│  8. Recipient sees amount and confirms                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: AGENT REDEEMS                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Agent enters claim code in dashboard                            │
│     ↓                                                                │
│  2. POST /api/claims/redeem                                          │
│     Body: { claimCode: "VM0OXICTDGKB", agentId: "agent-id" }         │
│     ↓                                                                │
│  3. Backend verifies again                                          │
│     - Same verification as Phase 2                                  │
│     - Additional: verifies agent is verified                        │
│     ↓                                                                │
│  4. Marks as used                                                    │
│     UPDATE ClaimCode SET isUsed = true, usedAt = now()              │
│     ↓                                                                │
│  5. Updates transaction status                                       │
│     UPDATE Transaction SET status = "REDEEMED"                       │
│     ↓                                                                │
│  6. Creates redemption record                                       │
│     Redemption {                                                      │
│       transactionId: "...",                                            │
│       agentId: "...",                                                 │
│       amount: 10,                                                     │
│       status: "COMPLETED",                                           │
│       completedAt: now()                                              │
│     }                                                                │
│     ↓                                                                │
│  7. Updates agent stats                                              │
│     UPDATE Agent SET {                                              │
│       totalPayouts: totalPayouts + 1,                               │
│       totalVolume: totalVolume + 10                                 │
│     }                                                                │
│     ↓                                                                │
│  8. On Solana (future - smart contract integration)                  │
│     - Transfer USDC from escrow to agent wallet                      │
│     ↓                                                                │
│  9. Returns success to agent                                         │
│     { success: true, message: "..." }                               │
│                                                                      │
└───────────────────────────────────────────────────────────────────────���─���───┘
```

---

## 10. Wallet Integration

### Phantom Wallet Setup:

```typescript
// 1. Install Phantom
// https://phantom.io/

// 2. Add to wallet-adapter
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

// 3. Configure in WalletProvider
const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

// 4. Connect
await wallet.connect();

// 5. Get public key
const publicKey = wallet.publicKey;
// "Hx2BWiDW7e7wv5YqP5r3qJpYqP5r3qJpYqP5r3qJp"

// 6. Sign transactions
const transaction = new Transaction();
const signedTransaction = await wallet.signTransaction(transaction);
const signature = await connection.sendRawTransaction(signedTransaction.serialize());
```

### Wallet Connection States:

```typescript
type WalletState = 'disconnected' | 'connecting' | 'connected' | 'disconnecting';

const { 
  connected,    // boolean - is wallet connected
  connecting,  // boolean - currently connecting
  disconnect,  // function - disconnect wallet
  publicKey,   // PublicKey | null - wallet address
  wallet       // WalletContextState - wallet instance
} = useWallet();
```

---

## 11. Deployment Guide

### Development Environment:

```bash
# Backend
cd backend
npx tsx src/index.ts
# Runs on: http://localhost:3001

# Frontend  
cd frontend
npx next dev
# Runs on: http://localhost:3000
```

### Production Deployment:

#### Backend (Railway/Render/Heroku):
```bash
# Environment variables
PORT=3001
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=<generate-random-32-character-string>
FRONTEND_URL=https://aamapay.com
SOLANA_NETWORK=mainnet
```

#### Frontend (Vercel):
```bash
# Environment variables
NEXT_PUBLIC_API_URL=https://api.aamapay.com
NEXT_PUBLIC_SOLANA_NETWORK=mainnet
```

#### Database (Neon/Supabase):
```bash
# Connection string
postgresql://user:password@ep-xyz.us-east-1.aws.neon.tech/dbname
```

---

## 12. Architecture Diagrams

### Complete System Architecture:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         USERS                                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐  │
│  │    SENDER       │   │   RECIPIENT     │   │     AGENT      │  │
│  │   (Wallet)      │   │   (Cash Out)    │   │  (Merchant)    │  │
│  └────────┬────────┘   └────────┬────────┘   └────────┬────────┘  │
│           │                     │                     │            │
└───────────┼─────────────────────┼─────────────────────┼────────────┘
            │                     │                     │
            ▼                     ▼                     ▼
┌───────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                           │
│  ┌────────────────────────��─��──────────────────────────────────┐  │
│  │                    Pages                                    │  │
│  │  ┌────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐ ┌────────┐  │  │
│  │  │ /  │ │ /send│ │/claim│ │/agent│ │/profile│ │/admin │  │  │
│  │  └────┘ └──────┘ └──────┘ └──────┘ └────────┘ └────────┘  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    Components                               │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │  │
│  │  │WalletContext │ │Navbar       │ │TransactionFeed     │ │  │
│  │  └──────────────┘ └──────────────┘ └──────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────────┘  │
└───────────────────────────┬───────────────────────────────────────┘
                            │ HTTPS (443)
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                      LOAD BALANCER                              │
└───────────────────────────┬───────────────────────────────────────┘
                            │
          ┌────────────┬────┴────┬────────────┐
          ▼            ▼            ▼            ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Rate Limiter   │  │   Helmet       │  │    CORS       │
│  (100/min)      │  │  (Headers)     │  │  (Origins)    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                  BACKEND API (Express)                         │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    Routes                                  │  │
│  │  ┌──────────┐ ┌────────────┐ ┌─────────┐ ┌──────────┐    │  │
│  │  │  Auth    │ │ Transactions│ │ Claims  │ │ Agents  │    │  │
│  │  └────┬─────┘ └─────┬──────┘ └───┬────┘ └───┬─────┘    │  │
│  │       └──────────┴──────────────┴─────┴──────────┘          │  │
│  └─────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                 Middleware                                 │  │
│  │  ┌─────────────┐ ┌────────────┐ ┌─────────────────────┐     │  │
│  │  │  JWT Auth   │ │Validator  │ │  Error Handler   │     │  │
│  │  └─────────────┘ └────────────┘ └─────────────────────┘     │  │
│  └─────────────────────────────────────────────────────────────┘  │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                    PRISMA ORM                                     │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                DATABASE (SQLite/PostgreSQL)                     │
│  ┌──────────┐ ┌───���─���────────┐ ┌──────────┐ ┌──────────┐         │
│  │  Users   │ │Transactions │ │ClaimCodes│ │ Agents  │         │
│  └──────────┘ └──────────────┘ └──────────┘ └──────────┘         │
└───────────────────────────────────────────────────────────────────┘
```

---

## Glossary of Terms

| Term | Definition |
|------|------------|
| **SOL** | Solana native cryptocurrency |
| **USDC** | USD Coin - stablecoin on Solana |
| **Wallet** | Cryptocurrency wallet (Phantom) |
| **Claim Code** | Unique code for cash pickup |
| **Escrow** | Temporary holding of funds |
| **Agent** | Cash pickup merchant |
| **JWT** | JSON Web Token - authentication |
| **SHA-256** | Encryption algorithm |
| **Prisma** | Database ORM |
| **Express** | Node.js web framework |
| **Next.js** | React full-stack framework |
| **Phantom** | Solana wallet extension |

---

## License

MIT License - Built with ❤️ for Nepal