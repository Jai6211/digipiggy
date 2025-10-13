# DigiPiggy — System Architecture & API Design (Phase 3)

**Team:** Devendra Namani · Jagadishwar Reddy · Ahmed Azzam
**Course:** CS-649 — System Analysis & Design
**Repo:** *link-to-your-GitHub-repo-here*
**Date:** October 13, 2025

---

## 0) Executive Summary

DigiPiggy is a savings app that turns small, frequent amounts (e.g., leftover change, manual top‑ups, and group pots) into meaningful savings. This document defines the **3‑tier architecture**, **RBAC/auth design**, **UML diagrams**, and **core REST API** for the MVP so the team can implement consistently across the front end (React), API (Node.js/Express), and database (MySQL).

---

## 1) System Architecture Overview

**Architecture Style:** 3‑tier (Presentation → API/Business → Data).
**Key Principles:** stateless API, layered responsibilities, least‑privilege RBAC, security‑first.

### 1.1 High‑Level Diagram

```mermaid
flowchart LR
  subgraph Client[Front-end — React App]
    UI[Pages & Components]
    State[Client State (Context/Redux)]
    UI --> State
  end

  subgraph API[Back-end — Node.js/Express]
    GW[API Router]
    Auth[Auth & RBAC Middleware]
    SVC[Services (Users, Wallet, Transactions, Groups, Merchants)]
    VAL[Validation (Zod/Joi)]
    GW --> Auth --> SVC --> VAL
  end

  subgraph DB[(MySQL)]
    U[(users)]
    K[(kyc_profiles)]
    W[(wallet_accounts)]
    T[(transactions)]
    G[(groups)]
    GM[(group_members)]
  end

  subgraph ThirdParty[3rd‑Party APIs]
    Pay[Payments/Gateway]
    Mail[Email/SMS]
    OAuth[Social Login (Google)]
  end

  Client <--> |HTTPS (JSON)| API
  API <--> |SQL (pool)| DB
  API <--> |SDK/Webhooks| ThirdParty
```

### 1.2 Data & Control Flow

1. **React** makes HTTPS requests to `/api/*` using `fetch/Axios` with credentials.
2. **Express** routes → **Auth/RBAC middleware** → **Services** → **DAO/SQL**.
3. **MySQL** stores identity, wallets, and transaction ledger.
4. **3rd‑party** providers used for (a) payments, (b) email/OTP, (c) social login.

---

## 2) Technology Stack

**Front‑end:** React 18, React Router, Context or Redux Toolkit, Axios, Tailwind (optional).
**Back‑end:** Node.js 20, Express 4, `jsonwebtoken`, `bcrypt`, `zod`/`joi`, `mysql2`/`knex`.
**Database:** MySQL 8 (based on Phase‑2 schema already created).
**Auth:** JWT access + refresh (HttpOnly secure cookies), OAuth2 (Google) optional via `passport`.
**Other:** Jest (unit tests), Postman collections, Docker (dev compose), Deploy on Render/Heroku/AWS Lightsail.
**Observability:** `morgan` (HTTP logs), basic request‑ID + error handler.

---

## 3) Authentication & Role‑Based Access Control (RBAC)

### 3.1 Roles

* **Guest**: Logged‑out visitor; can register/login, view marketing pages.
* **User**: Verified account holder; can manage wallet, deposit/withdraw*, view history, join/leave groups.
* **Merchant** (Shopkeeper): Can receive change deposits, issue refunds to user wallets, view merchant dashboard.
* **Admin**: Platform operator; can manage users, merchants, and investigate transactions.

> *Withdrawals may be disabled in MVP if not needed; otherwise they require KYC and payout rails.

### 3.2 Permissions Matrix (Key Actions)

| Action                         | Guest | User |           Merchant | Admin |
| ------------------------------ | ----: | ---: | -----------------: | ----: |
| Register/Login                 |     ✅ |    — |                  — |     — |
| View own wallet & transactions |     — |    ✅ |                  — |     — |
| Deposit (manual/round‑up)      |     — |    ✅ |    ✅ (as receiver) |     — |
| Create/Join Group Pot          |     — |    ✅ |                  — |     — |
| Refund/Adjust to user wallet   |     — |    — | ✅ (own store only) |     ✅ |
| Manage users/roles             |     — |    — |                  — |     ✅ |
| View platform analytics        |     — |    — |                  — |     ✅ |

### 3.3 Auth Flow

* **Registration:** email → verify email (OTP/link) → create user + wallet.
* **Login:** email + password → verify hash → issue **Access JWT (15m)** and **Refresh JWT (7d)** in **HttpOnly, Secure cookies** (`access_token`, `refresh_token`).
* **Session Renewal:** `POST /api/auth/refresh` rotates refresh tokens (reuse‑detect blacklist optional).
* **Logout:** clears cookies; refresh token invalidated (DB or cache deny‑list).
* **RBAC Enforcement:** route middleware reads `req.user.role` from verified JWT; checks against route policy.

### 3.4 Middleware Sketch

* `authenticateJWT` → verifies access JWT, attaches `req.user = { id, role }`.
* `authorize(roles)` → ensures `req.user.role ∈ roles`.
* `validate(schema)` → request validation with Zod/Joi.

---

## 4) UML Diagrams

### 4.1 Use Case Diagram (Roles & Actions)

```mermaid
flowchart LR
  actorGuest([Guest])
  actorUser([User])
  actorMerchant([Merchant])
  actorAdmin([Admin])

  UC_Register((Register))
  UC_Login((Login))
  UC_ViewWallet((View Wallet))
  UC_Deposit((Deposit / Round‑up))
  UC_Group((Create/Join Group Pot))
  UC_Refund((Refund to User))
  UC_AdminUsers((Manage Users/Roles))
  UC_Audit((Audit Transactions))

  actorGuest --> UC_Register
  actorGuest --> UC_Login
  actorUser --> UC_ViewWallet
  actorUser --> UC_Deposit
  actorUser --> UC_Group
  actorMerchant --> UC_Refund
  actorAdmin --> UC_AdminUsers
  actorAdmin --> UC_Audit
```

### 4.2 Sequence Diagram — “User logs in”

```mermaid
sequenceDiagram
  autonumber
  participant U as User (React)
  participant FE as React App
  participant API as Express API
  participant DB as MySQL

  U->>FE: Submit email+password
  FE->>API: POST /api/auth/login {email, password}
  API->>DB: SELECT user by email
  DB-->>API: user row (password_hash)
  API->>API: bcrypt.compare()
  alt valid
    API->>API: sign access & refresh JWT
    API-->>FE: 200 OK (Set-Cookie: access & refresh)
    FE-->>U: Redirect to /dashboard
  else invalid
    API-->>FE: 401 Unauthorized
    FE-->>U: Show error
  end
```

### 4.3 System Architecture Diagram (Alt Mermaid)

```mermaid
graph TD
  A[React UI] -- Axios/Fetch --> B[Express API]
  B -- SQL (mysql2/knex) --> C[(MySQL)]
  B -- SDK/Webhooks --> D[Payment Gateway]
  B -- OAuth2 --> E[Google Identity]
  B -- Email/SMS --> F[Mailer]
```

> **Note:** GitHub renders Mermaid diagrams natively. If your instructor wants images, export PNGs from VS Code Mermaid or a web Mermaid editor and place them under `docs/images/`.

---

## 5) API Design (MVP)

*All responses are JSON. Pagination uses `?page` & `?limit`.*

### 5.1 Auth

* **POST** `/api/auth/register`
  Req: `{ email, password, full_name }`
  Res: `201 { id, email }`
  Role: Guest

* **POST** `/api/auth/login`
  Req: `{ email, password }`
  Res: `200` + set cookies `{ tokenType: "Bearer", role }`

* **POST** `/api/auth/refresh`
  Res: `200` + new access cookie
  Role: Any (requires refresh cookie)

* **POST** `/api/auth/logout`
  Res: `204`
  Role: Any (clears cookies)

### 5.2 Users (Admin)

* **GET** `/api/users` — **Admin** only.
  Res: `[{ id, email, role, status, created_at }]`
* **PATCH** `/api/users/:id/role` — **Admin**.
  Req: `{ role: "User" | "Merchant" | "Admin" }`
  Res: `{ id, role }`

### 5.3 Wallets & Transactions (User, Merchant)

* **GET** `/api/wallets/me` — **User**.
  Res: `{ id, balance_cents, currency }`
* **GET** `/api/transactions?type=&page=&limit=` — **User** sees own; **Admin** can filter.
  Res: `{ items: [ {id, amount_cents, type, created_at} ], page, total }`
* **POST** `/api/wallets/deposit` — **User** or **Merchant (receiver)**.
  Req: `{ amount_cents, source: "manual"|"change"|"refund", merchant_id? }`
  Res: `{ id, status: "posted" }`
* **POST** `/api/wallets/withdraw` — **User**. *(Optional in MVP; KYC required)*
  Req: `{ amount_cents, destination: "bank" }`
  Res: `{ id, status }`

### 5.4 Groups

* **POST** `/api/groups` — **User**
  Req: `{ name, goal_cents }`
  Res: `{ id, name, goal_cents }`
* **POST** `/api/groups/:id/join` — **User**
  Res: `{ group_id, member_id }`
* **POST** `/api/groups/:id/deposit` — **User**
  Req: `{ amount_cents }`
  Res: `{ tx_id }`

### 5.5 Merchants

* **GET** `/api/merchants/me` — **Merchant**
  Res: `{ id, store_name, settlements: [...] }`
* **POST** `/api/merchants/refund` — **Merchant**
  Req: `{ user_id, amount_cents, reason }`
  Res: `{ tx_id, status }`

### 5.6 Errors (Example)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "amount_cents must be > 0",
    "details": [{ "path": "amount_cents", "rule": ">0" }]
  }
}
```

---

## 6) Security & Performance

**Security (at least 3):**

1. **Password hashing** with `bcrypt` (12–14 rounds) + unique per‑user salt.
2. **JWT in HttpOnly/Secure cookies**, short‑lived access (≈15m), refresh (≈7d), CSRF‑safe because cookies are not read by JS; optional CSRF token for state‑changing requests.
3. **Input validation** on all endpoints (Zod/Joi) + centralized error handling.
4. **TLS/HTTPS** everywhere; HSTS on prod; `helmet` headers; rate limiting & login throttling.
5. **Least‑privilege RBAC** checks in middleware + DB‑level ownership filters.

**Performance (at least 2):**

1. **Indexes** on `users.email`, `transactions.user_id`, `transactions.created_at`.
2. **Pagination** on list endpoints; avoid huge payloads.
3. **Connection pooling** (`mysql2` pool) and **caching** hot reads (optional Redis later).

---

## 7) Documentation in GitHub (What to Commit)

* **system_design.md** (this file) in repo root or `docs/`.
* **Diagrams:** Keep Mermaid blocks inline **and** export PNGs to `docs/images/` if required by rubric.
* **Auth & RBAC:** include the matrix and flow exactly as above.
* **API:** include endpoint table and examples.
* **Team Names:** on the first page; each member pushes at least one meaningful commit.

### 7.1 Suggested Team Split (for visible collaboration)

* **Jagadishwar:** Write “Auth & RBAC” section + Use Case UML; commit PNG export.
* **Devendra:** Write “API Design” section + Postman collection JSON under `docs/postman/`.
* **Ahmed:** Write “Architecture Overview + Tech Stack” + Sequence Diagram; commit PNG export.

Each member adds a short line in the commit message, e.g., `feat(docs): add RBAC matrix — Jagadishwar`.

---

## 8) References (if templates/frameworks used)

* Express, JWT, bcrypt, Joi/Zod docs.
* GitHub Mermaid docs for rendering UML.

---

## Appendix A — Environment & Config

* `JWT_ACCESS_TTL=15m`, `JWT_REFRESH_TTL=7d`
* `COOKIE_SECURE=true`, `COOKIE_SAME_SITE=Strict` (prod)
* `DB_URL=mysql://user:pass@host:3306/digipiggy`
* `PASSWORD_BCRYPT_ROUNDS=12`

## Appendix B — Route Policy Table (quick view)

| Route                   | Method | Roles                   |
| ----------------------- | ------ | ----------------------- |
| /api/auth/register      | POST   | Guest                   |
| /api/auth/login         | POST   | Guest                   |
| /api/auth/refresh       | POST   | Any (refresh cookie)    |
| /api/auth/logout        | POST   | Any                     |
| /api/users              | GET    | Admin                   |
| /api/users/:id/role     | PATCH  | Admin                   |
| /api/wallets/me         | GET    | User                    |
| /api/wallets/deposit    | POST   | User, Merchant          |
| /api/wallets/withdraw   | POST   | User                    |
| /api/transactions       | GET    | User (own), Admin (all) |
| /api/groups             | POST   | User                    |
| /api/groups/:id/join    | POST   | User                    |
| /api/groups/:id/deposit | POST   | User                    |
| /api/merchants/me       | GET    | Merchant                |
| /api/merchants/refund   | POST   | Merchant                |

---

> **How to Export Diagrams as Images:**
>
> 1. Use a Mermaid previewer (VS Code “Markdown Preview Mermaid Support”) → right‑click → *Export PNG*.
> 2. Save under `docs/images/` with names: `architecture.png`, `use_case.png`, `sequence_login.png`.
> 3. In `system_design.md`, embed: `![System Architecture](docs/images/architecture.png)`.
