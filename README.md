# Global Supply Chain

> **Production-grade supply chain tracking system** with Sui blockchain immutability, AI-powered document intelligence, and real-time multi-modal tracking.

[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Sui](https://img.shields.io/badge/Sui-6FBCF0?logo=sui&logoColor=white)](https://sui.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)](https://python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Smart Contracts](#smart-contracts)
- [AI Document Intelligence](#ai-document-intelligence)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Real-time Tracking](#real-time-tracking)
- [Deployment](#deployment)
- [Monitoring & Observability](#monitoring--observability)
- [Security](#security)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Enterprise supply chain management system providing immutable tracking across maritime, aviation, railway, and artisan certification domains. Built on Sui blockchain with AI-powered document processing and real-time logistics intelligence.

**Key Features:**
- Blockchain-based immutable audit trail (Sui Move)
- AI document parsing & auto-form population (Claude API)
- Real-time tracking with WebSocket updates
- Multi-tenant SaaS architecture
- Role-based access control (RBAC)
- IPFS decentralized metadata storage
- PostgreSQL relational data layer

**Supported Logistics Flows:**
- 🚢 Maritime Shipping & Port Operations
- ✈️ Aviation Cargo & Customs Clearance
- 🚂 Railway Transport & Intermodal
- 🎨 Artisan Product Certification

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Next.js 15 (React App Router)               │   │
│  │  Components│ Pages│ API Routes│ Wallet Integration   │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────┘
                 │ (HTTP/WS)
┌────────────────▼────────────────────────────────────────────┐
│                    API Gateway Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express.js (TypeScript)│ JWT Auth│ Rate Limiting    │   │
│  └──────────────────────────────────────────────────────┘   │
└────┬──────────────────┬────────────────────┬────────────────┘
     │                  │                    │
     ▼                  ▼                    ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────────┐
│  Blockchain │  │  Python AI   │  │  PostgreSQL DB   │
│  Layer      │  │  Agent       │  │                  │
│  Sui RPC    │  │  (Document   │  │  User│Orders     │
│  Move       │  │   Processing)│  │  Events│Audit     │
│  Contracts  │  │  Claude API  │  │  Blockchain Ref  │
└─────────────┘  └──────────────┘  └──────────────────┘
     │                  │                    │
     └──────────┬───────┴────────────────────┘
                │
     ┌──────────▼───────────┐
     │   IPFS Storage       │
     │   (Metadata/Files)   │
     └──────────────────────┘
```

### Data Flow

```
User Request
    │
    ▼
Frontend (Next.js)
    │
    ├─→ Wallet Connection (Sui Wallet)
    │
    ▼
API Gateway (Express)
    │
    ├─→ Authentication (JWT)
    ├─→ Validation
    │
    ├─→ Business Logic
    │   ├─→ Database Operations
    │   ├─→ Smart Contract Calls (if needed)
    │   └─→ AI Document Processing (if document upload)
    │
    ▼
Response + Event Emission
    │
    ├─→ WebSocket Update to Frontend
    ├─→ Blockchain Event Log
    └─→ Audit Trail
```

---

## Quick Start

### Requirements

- **Node.js** ([Download](https://nodejs.org/))
- **Python** ([Download](https://python.org/))
- **pnpm** 8+ or **npm** 10+ ([pnpm](https://pnpm.io/))
- **Sui CLI** 1.x ([Install](https://docs.sui.io/build/install))
- **PostgreSQL** ([Download](https://www.postgresql.org/))
- **Git** for version control

### Installation

```bash
# 1. Clone repository
git clone https://github.com/your-org/global-supply-chain.git
cd global-supply-chain

# 2. Install Node dependencies
npm install

# 3. Setup environments
# Backend: backend/.env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/supply_chain
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
SUI_NETWORK=testnet
ANTHROPIC_API_KEY=your_claude_api_key
JWT_SECRET=your_jwt_secret
IPFS_KEY=your_ipfs_key
IPFS_SECRET=your_ipfs_secret

# Frontend: frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
NEXT_PUBLIC_SUI_NETWORK=testnet

# 4. Setup AI Agent (Python)
cd ai-agent
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 5. Database migrations
cd ../backend
npm run db:migrate

# 6. Start development servers
# Terminal 1
npm run dev:api

# Terminal 2
npm run dev:web

# Terminal 3 (Optional - Python AI Agent)
cd ai-agent && python3 main.py
```

**Access Points:**
- Frontend: http://localhost:3000
- API: http://localhost:4000/api
- API Docs: http://localhost:4000/api-docs
- Health Check: http://localhost:4000/health

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js, React, TailwindCSS, React Query |
| **Backend** | Node.js, Express, TypeScript, Prisma | 
| **AI Agent** | Python, Claude API, PyPDF2, Pydantic | 
| **Blockchain** | Sui Move, @mysten/sui.js, @mysten/dapp-kit |
| **Database** | PostgreSQL, Redis | 
| **Storage** | IPFS, AWS S3 (optional) | Latest |
| **Testing** | Jest, Vitest, Pytest, Playwright | Latest |
| **DevOps** | Docker, Docker Compose | Latest |

---

## Smart Contracts

### Build & Test

```bash
cd blockchain-sui

# Build Move contracts
sui move build

# Run unit tests
sui move test

# Coverage report
sui move test --coverage

# Check code
sui move check
```

### Deployment

```bash
# Get testnet SUI tokens
sui client faucet

# Publish contracts
sui client publish --gas-budget 100000000

# Save package ID
export PACKAGE_ID=0x...

# Verify deployment
sui client object $PACKAGE_ID
```

### Contract Interactions

```bash
# Create shipment
sui client call \
  --package $PACKAGE_ID \
  --module supply_chain \
  --function create_shipment \
  --args "SHIP-001" "Shanghai" "Rotterdam" \
  --gas-budget 10000000

# Update status
sui client call \
  --package $PACKAGE_ID \
  --module supply_chain \
  --function update_shipment_status \
  --args "SHIP-001" "in_transit" \
  --gas-budget 5000000
```

---

### Supported Documents

| Document Type | Domain | Extraction Fields |
|--------------|--------|------------------|
| Bill of Lading | Maritime | Vessel, IMO, Ports, Containers, Weight |
| Air Waybill | Aviation | Flight, Origin, Destination, Weight, Pieces |
| Railway Consignment | Railway | Train, Stations, Wagons, Cargo Type |
| Certificate of Origin | Artisan | Product, Artisan, Origin, Materials, Hash |
| Commercial Invoice | All | Sender, Receiver, Items, Values, Terms |
| Packing List | All | Items, Quantities, Dimensions, Weight |

## Security

### Best Practices

- ✅ Never commit `.env` files to version control
- ✅ Rotate secrets every 90 days
- ✅ Use environment variables for all sensitive data
- ✅ Enable 2FA on all production accounts
- ✅ Audit smart contracts before mainnet deployment
- ✅ Validate all user inputs (backend)
- ✅ Use HTTPS/TLS for all communications
- ✅ Implement rate limiting on API endpoints
- ✅ Regular security audits and penetration testing

### Security Features

| Feature | Implementation |
|---------|----------------|
| **Data Integrity** | SHA-256 hashing + blockchain verification |
| **Immutability** | Blockchain audit trail + PostgreSQL logs |
| **Access Control** | JWT + Role-Based Access Control (RBAC) |
| **Encryption** | TLS 1.3 in transit, AES-256 at rest |
| **API Security** | Rate limiting, CORS, helmet.js |
| **Document Security** | Encrypted storage, virus scanning |
| **Audit Logging** | Complete user action tracking |

---

## Testing

### Run All Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Smart Contract Tests

```bash
cd blockchain-sui
sui move test --coverage
sui move test --filter maritime
```

### Frontend Tests

```bash
cd frontend
npm run test:components
npm run test:visual
npm run test:e2e
```

### Backend Tests

```bash
cd backend
npm run test:unit
npm run test:integration
npm run test:coverage
```


## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.


---

<div align="center">

**Questions?** Open an issue or contact the team.

**Found a bug?** [Report it](https://github.com/your-org/global-supply-chain/issues)

⭐ Star this repo if you find it useful!

</div>
