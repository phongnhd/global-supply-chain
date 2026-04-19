# Global Supply Chain Monorepo

Kiến trúc monorepo gồm **Next.js 15 (App Router + Tailwind)**, **Node.js API (TypeScript)**, **Sui Move**, và package **shared** dùng chung type/constants.

## Cấu trúc

- `blockchain-sui/` — smart contract Move (`product`, `transport`, `access_control`)
- `backend/` — Express API, IPFS stub, SHA-256
- `frontend/` — UI, `@mysten/dapp-kit`, route groups `(artisan)` / `(transport)`, `/verify/[id]`
- `shared/` — interface TypeScript + danh mục cảng / sân bay / ga

## Chuẩn bị

- Node.js 20+
- [Sui CLI](https://docs.sui.io/build/install) (để `sui move build` / `sui client`)

## Cài đặt

```bash
cd global
npm install
```

## Biến môi trường

**`backend/.env`**

- `PORT` — cổng API (mặc định 4000)
- `SUI_RPC_URL` — RPC Sui
- `IPFS_KEY`, `SECRET_PHRASE` — bổ sung khi tích hợp IPFS / ký server

**`frontend/.env.local`** (tùy chọn)

- `NEXT_PUBLIC_API_URL=http://localhost:4000`
- `NEXT_PUBLIC_SUI_NETWORK=testnet`
- `NEXT_PUBLIC_SUI_RPC_URL` — ghi đè RPC

## Chạy dev

```bash
# API
npm run dev:api

# Web (terminal khác)
npm run dev:web
```

## Move

```bash
cd blockchain-sui
sui move test
```

Nếu `Move.toml` báo lỗi `rev` git, chỉnh `rev` trùng với nhánh / tag framework mà bản Sui CLI đang dùng.

## API (`/api/v1`)

| Method | Path | Mô tả |
|--------|------|--------|
| POST | `/artisan/birth-certificate` | Draft + hash |
| POST | `/aviation/declaration` | AWB / flight |
| POST | `/maritime/declaration` | IMO / container |
| POST | `/railway/declaration` | Wagon / ga |

## Ghi chú bảo mật

- Không commit secret thật; file `.env` mẫu đã có placeholder.
- Nâng cấp `next` theo [thông báo bảo mật Next.js](https://nextjs.org/blog) khi có bản vá mới.
