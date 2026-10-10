# Graph Report - ControleDeVendasEEstoque  (2026-10-10)

## Corpus Check
- Corpus is ~38,077 words - fits in a single context window. You may not need a graph.

## Summary
- 398 nodes · 545 edges · 49 communities (23 shown, 26 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Category Management
- Next Configuration
- tRPC API Server
- Package Tooling
- TypeScript Configuration
- Project Metadata
- Client Management
- Electron Packaging
- Project Overview
- Route Handlers
- Financial Actions
- Build Preparation
- Auth Dependencies
- Electron Main Process
- Password Hashing
- Clerk Authentication
- Date Utilities
- Icon Library
- Request Middleware
- NextAuth Library
- Theme Management
- Next.js Framework
- Prisma Client
- React Library
- React DOM
- React Icons
- Charts Library
- Email Service
- Server Guard
- Image Processing
- Toast Notifications
- Data Serialization
- React Query
- Port Detection
- tRPC Package
- UploadThing Service
- UploadThing React
- Validation Library
- Database Startup
- HTTP Route Methods

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 21 edges
2. `api` - 18 edges
3. `scripts` - 16 edges
4. `CashFlow README` - 15 edges
5. `db` - 12 edges
6. `SideBar()` - 11 edges
7. `createTRPCRouter` - 9 edges
8. `build` - 8 edges
9. `protectedProcedure` - 8 edges
10. `include` - 7 edges

## Surprising Connections (you probably didn't know these)
- `createContext` --calls--> `createTRPCContext()`  [EXTRACTED]
  src/trpc/server.ts → src/server/api/trpc.ts
- `SettingsForm()` --calls--> `uploadRegistrationImage()`  [EXTRACTED]
  src/app/configuracoes/_components/ConfigPainel.tsx → src/app/actions/upload.ts
- `createContext()` --calls--> `createTRPCContext()`  [EXTRACTED]
  src/app/api/trpc/[trpc]/route.ts → src/server/api/trpc.ts
- `SettingsPage()` --calls--> `getClientsCount()`  [EXTRACTED]
  src/app/configuracoes/page.tsx → src/server/actions/client.ts
- `SettingsPage()` --calls--> `getProductsCount()`  [EXTRACTED]
  src/app/configuracoes/page.tsx → src/server/actions/product.ts

## Import Cycles
- 3-file cycle: `src/server/api/root.ts -> src/server/api/routers/cliente.ts -> src/trpc/server.ts -> src/server/api/root.ts`

## Hyperedges (group relationships)
- **T3 Stack Technologies** — readme_next_js_15, readme_typescript, readme_tailwind_css, readme_daisyui, readme_trpc, readme_prisma, readme_nextauth_js_v5, readme_zod [EXTRACTED 1.00]

## Communities (49 total, 26 thin omitted)

### Community 0 - "Category Management"
Cohesion: 0.07
Nodes (21): Category, CategoryManager(), ClientsPage(), AuthProvider(), ClienteData, ClienteRow(), ProductTableShow(), Props (+13 more)

### Community 1 - "Next Configuration"
Cohesion: 0.08
Nodes (23): config, uploadRegistrationImage(), DashboardCharts(), SettingsForm(), SettingsFormProps, SettingsPage(), DashboardPage(), getDashboardData() (+15 more)

### Community 2 - "tRPC API Server"
Cohesion: 0.12
Nodes (26): createContext(), handler(), appRouter, createCaller, authRouter, resend, categoriaRouter, clienteRouter (+18 more)

### Community 3 - "Package Tooling"
Cohesion: 0.06
Nodes (35): @biomejs/biome, concurrently, cross-env, daisyui, electron, electron-builder, devDependencies, @biomejs/biome (+27 more)

### Community 4 - "TypeScript Configuration"
Cohesion: 0.06
Nodes (34): **/*.cjs, dom, dom.iterable, ES2022, generated, **/*.js, next-env.d.ts, .next/types/**/*.ts (+26 more)

### Community 5 - "Project Metadata"
Cohesion: 0.07
Nodes (26): author, ct3aMetadata, initVersion, description, main, name, packageManager, private (+18 more)

### Community 6 - "Client Management"
Cohesion: 0.12
Nodes (8): ClientView(), ClientViewProps, PAYMENT_METHODS, StatusFilter, SideBar(), FornecedorDetailClient(), HistoryEvent, HistoryView()

### Community 7 - "Electron Packaging"
Cohesion: 0.11
Nodes (18): build, appId, asarUnpack, directories, extraResources, files, productName, win (+10 more)

### Community 8 - "Project Overview"
Cohesion: 0.14
Nodes (16): Complete Authentication, CashFlow README, DaisyUI, Dashboard, Monthly Reports, Next.js 15, NextAuth.js v5, Personal Finance Management (+8 more)

### Community 9 - "Route Handlers"
Cohesion: 0.17
Nodes (8): { GET, POST }, ProductDetailClient(), { useUploadThing }, PageProps, { useUploadThing }, f, ourFileRouter, UploadButton

### Community 10 - "Financial Actions"
Cohesion: 0.24
Nodes (8): DeleteExpenseButton(), AddExpenseButton(), ExportButton(), ExportProps, FinancialChart(), FinancialData, FinancialPage(), getFinancialData()

### Community 11 - "Build Preparation"
Cohesion: 0.20
Nodes (8): dest, destPublic, destStatic, fs, path, srcPublic, srcStandalone, srcStatic

### Community 12 - "Auth Dependencies"
Cohesion: 0.22
Nodes (9): @auth/prisma-adapter, dependencies, @auth/prisma-adapter, @t3-oss/env-nextjs, @trpc/client, @trpc/react-query, @t3-oss/env-nextjs, @trpc/client (+1 more)

### Community 13 - "Electron Main Process"
Cohesion: 0.22
Nodes (5): { app, BrowserWindow }, fs, path, { spawn }, tcpPortUsed

## Knowledge Gaps
- **174 isolated node(s):** `{ app, BrowserWindow }`, `path`, `fs`, `{ spawn }`, `tcpPortUsed` (+169 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Auth Dependencies` to `Project Metadata`, `Password Hashing`, `Clerk Authentication`, `Date Utilities`, `Icon Library`, `Request Middleware`, `NextAuth Library`, `Theme Management`, `Next.js Framework`, `Prisma Client`, `React Library`, `React DOM`, `React Icons`, `Charts Library`, `Email Service`, `Server Guard`, `Image Processing`, `Toast Notifications`, `Data Serialization`, `React Query`, `Port Detection`, `tRPC Package`, `UploadThing Service`, `UploadThing React`, `Validation Library`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Package Tooling` to `Project Metadata`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `build` connect `Electron Packaging` to `Project Metadata`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `{ app, BrowserWindow }`, `path`, `fs` to the rest of the system?**
  _174 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Category Management` be split into smaller, more focused modules?**
  _Cohesion score 0.06871035940803383 - nodes in this community are weakly interconnected._
- **Should `Next Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.08461538461538462 - nodes in this community are weakly interconnected._
- **Should `tRPC API Server` be split into smaller, more focused modules?**
  _Cohesion score 0.12162162162162163 - nodes in this community are weakly interconnected._