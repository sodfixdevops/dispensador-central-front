# Dispensador Central - AI Coding Instructions

## Project Overview

**DE70 Bill Dispenser Dashboard**: A Next.js 15 admin dashboard for managing automated bill dispensers in a banking/financial system. Handles devices, transactions, reports, users, bank accounts, and configurations. Built with TypeScript, Tailwind CSS, Next-Auth 5 (JWT), and REST API integration (backend on port 3001).

## Architecture & Data Flow

### Authentication (JWT + NextAuth)

- **Config**: [auth.ts](auth.ts) + [middleware.ts](middleware.ts) guard `/dashboard/*`
- **Flow**: Login form → `loginUsuario()` in [aduser-actions.tsx](app/lib/aduser-actions.tsx) → backend `/aduser/login` → JWT token returned
- **Session Structure**: `{id, username, token, tipo (user type), dispositivo (assigned device)}` — accessible via `useSession()` on clients
- **Key Pattern**: NextAuth Credentials provider validates against backend; JWT stored and passed to session callbacks
- **Device Assignment**: Users have `dispositivo` field linking them to specific bill dispensers

### Server Actions & API Layer

- **Location**: [app/lib/\*-actions.tsx](app/lib/) — all marked `"use server"`
- **Pattern**: Async fetch functions → REST API at `${NEXT_PUBLIC_API_URL}` (defaults port 3001)
- **Error Handling**: Check `res.ok`; return `{success: boolean, message: string}` on failure; throw on unexpected errors
- **Example**: [dispositivo-actions.tsx](app/lib/dispositivo-actions.tsx) (fetch, create, update, delete dispositivos)
- **Cache Invalidation**: Always call `revalidatePath()` after POST/PUT/DELETE to sync UI

### Component & Route Architecture

```
app/
├── layout.tsx (SessionAuthProvider wrapper)
├── dashboard/
│   ├── layout.tsx (SideNav + Suspense boundaries)
│   ├── page.tsx (home dashboard)
│   └── [entity]/ (usuarios/, dispositivos/, servicios/, etc.)
│       ├── page.tsx (list view with table + search)
│       ├── create/page.tsx (new form)
│       └── [id]/page.tsx (detail/edit view)
├── lib/ (all server actions)
└── ui/ (components by entity)
    ├── componentes/ (reusable: Input, Button, Card, ProgressBar)
    └── [entity]/ (table.tsx, form.tsx, create-form.tsx, modals)
```

### UI & Forms

- **Reusables**: [app/ui/componentes/](app/ui/componentes/) (Input, Button, Card, ProgressBar)
- **Icons**: @heroicons/react for all icon needs
- **Styling**: Tailwind + @tailwindcss/forms; no custom CSS needed
- **Form Pattern**: Client component ("use client") → controlled state → `formAction={serverAction}` → server revalidates
- **Notifications**: `react-toastify` for success/error messages
  - Import: `import { toast } from "react-toastify"` (no need for ToastContainer in components; it's in root layout)
  - Success: `toast.success("Message")` — Error: `toast.error("Message")`
  - Use after server action responses: `result.success ? toast.success(result.message) : toast.error(result.message)`

## Critical Patterns

### Naming & File Organization

- Server action files: `[entity]-actions.tsx` (e.g., `dispositivo-actions.tsx`, `usuario-actions.tsx`)
- Functions: Spanish names (`crearDispositivo`, `actualizarUsuario`, `eliminarDispositivo`)
- Types in [definitions.ts](app/lib/definitions.ts): `EntityData` (fetch), `EntityDataCrud` (forms)
  - Pattern: Separate fetch types (full data) from form types (subset for create/update)
  - Example: `DispositivoData` (all fields) vs `DispositivoDataCrud` (form fields only)
- UI components: `table.tsx` (list), `create-form.tsx` (new), `form.tsx` (edit), `[entity]-modal.tsx` (inline modals)

### Server Action Response Pattern

```typescript
export async function crearDispositivo(data: Partial<DispositivoData>) {
  const res = await fetch(`${API_URL}/dispositivos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    return { success: false, message: err.message || "Error default" };
  }

  revalidatePath("/dashboard/dispositivos");
  return { success: true, message: "Success message" };
}
```

### Client Form & Error Handling

- Use `toast()` from `react-toastify` for user feedback (success/error)
- Client state for loading, error messages, form data
- Example: [app/ui/usuarios/create-form.tsx](app/ui/usuarios/create-form.tsx) shows full pattern
- Call server actions directly in form submissions; no manual fetch
- For modals: Load existing data on open via `useEffect`, support create/update based on null checks

### Data Fetching in Pages

- **Server Components** (default): Direct server action calls, `await` results
- **Client Components** ("use client"): `useSession()` for auth, `useState` for forms, call server actions via `formAction`
- [app/dashboard/usuarios/page.tsx](app/dashboard/usuarios/page.tsx) is the list page template
- Wrap async data fetches in `<Suspense>` with skeleton fallbacks

### Linked Entity Pattern (Bank Accounts Example)

When an entity is linked to another (e.g., bank accounts → users):

1. **No separate maintenance page** — access via modal/button in parent entity table
2. **Modal component**: [app/ui/usuarios/bank-account-modal.tsx](app/ui/usuarios/bank-account-modal.tsx)
3. **Actions**: [app/lib/adbank-actions.tsx](app/lib/adbank-actions.tsx) with `fetchBy[ParentEntity]()`, `crear`, `actualizar`
4. **Button in table**: Opens modal, passes parent entity ID (username for users)
5. **Backend endpoints**: Typically `/adbank/usuario/{username}` for fetch/update/delete operations

### Hardware Integration Pattern (DE70 Bill Dispenser)

For hardware device control (e.g., bill dispensers, validators):

- **Location**: [app/lib/de70-actions.tsx](app/lib/de70-actions.tsx) — server actions that communicate with physical devices
- **Command Pattern**: `DE70_Action*()` functions send commands (Unlock, StoreStart, Cancelar, etc.)
- **Polling Pattern**: `waitFor*()` functions poll device status until specific conditions are met
  - Example: `waitForD2Value(apiUrl, expectedValue, timeout, interval)` — polls every `interval`ms until status matches
  - Always include timeout to prevent infinite loops
  - Used in flows: `DE70_FlujoIniciarTransaccion()`, `DE70_FlujoIniciarConteo()`
- **State Management**: Complex client pages (e.g., [deposito/page.tsx](app/dashboard/deposito/page.tsx)) manage hardware state with multiple `useState` hooks
- **Error Handling**: Hardware commands can fail; always check response and provide user feedback via toast
- **Typical Flow**: Unlock → Poll for ready → Execute command → Poll for completion → Lock

### External API Integration

For server-side external API calls (e.g., BCP banking API):

- **Server-only actions**: [app/lib/env-server-actions.tsx](app/lib/env-server-actions.tsx) — marked `"use server"`, NOT exposed to client
- **Config**: Use `ENV_CONFIG.API_BCP` from [env-config.ts](app/lib/env-config.ts); credentials stored in server env vars
- **Helper**: `construirUrlBcp(descriptor)` builds full API URL from base + endpoint descriptor
- **Call Pattern**: `consumirApiBcp(url, method, body)` — generic fetch wrapper with auth headers
- **Logging**: All external API calls logged via `registrarApiCall()` in [adapi-actions.tsx](app/lib/adapi-actions.tsx) for audit trail

## Build & Environment

### Development

```bash
pnpm dev      # Next.js on port 3002
# Create .env.local with these variables:
# NEXT_PUBLIC_API_URL=http://localhost:3001
# API_BCP=https://api.bcp.com/v1
```

**Environment Variables**: See [ENV_SETUP.md](ENV_SETUP.md) for full documentation

- `NEXT_PUBLIC_API_URL` — Backend Dispensador API (defaults to port 3001)
- `API_BCP` — External BCP API (consumed only server-side)
- Access via [app/lib/env-config.ts](app/lib/env-config.ts): `import { ENV_CONFIG } from "@/app/lib/env-config"`

**Backend Required**: Must be running separately on port 3001; app expects endpoints like:

- `/aduser/login` — authentication
- `/aduser` — user CRUD
- `/dispositivos` — device CRUD
- `/banco` — bank account CRUD (GET all, GET by id/:id, POST create)
- `/banco/usuario/{username}` — fetch account by user
- `/banco/:id` — PUT/DELETE operations

### Production

```bash
pnpm build    # Code-split + optimize
pnpm start    # Serve on port 3002
# Docker: See Dockerfile for containerization
```

Configure these in your hosting (Vercel, AWS, etc.):

- `NEXT_PUBLIC_API_URL` — Backend URL
- `API_BCP` — BCP API URL
- `AUTH_SECRET` — Generate with `openssl rand -base64 32`
- `AUTH_URL` — NextAuth callback URL

## Key File Reference

| File                                                                           | Purpose                                                              |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| [auth.ts](auth.ts)                                                             | NextAuth config; JWT callbacks; Credentials provider                 |
| [middleware.ts](middleware.ts)                                                 | Route protection; redirects unauthenticated to /login                |
| [app/lib/definitions.ts](app/lib/definitions.ts)                               | All TypeScript types (Dispositivo, Usuario, Adbank, Conceptos, etc.) |
| [app/lib/env-config.ts](app/lib/env-config.ts)                                 | Centralized environment variables access                             |
| [app/lib/aduser-actions.tsx](app/lib/aduser-actions.tsx)                       | Login + user CRUD                                                    |
| [app/lib/adbank-actions.tsx](app/lib/adbank-actions.tsx)                       | Bank account CRUD (linked to users)                                  |
| [app/dashboard/page.tsx](app/dashboard/page.tsx)                               | Home; shows session data for debugging                               |
| [app/ui/usuarios/table.tsx](app/ui/usuarios/table.tsx)                         | User table with bank account modal trigger                           |
| [app/providers/SessionAuthProvider.tsx](app/providers/SessionAuthProvider.tsx) | Client-side session provider                                         |
| [ENV_SETUP.md](ENV_SETUP.md)                                                   | Environment variables documentation                                  |

## Common Tasks

### Add a New Dashboard Module (e.g., "Reportes")

1. Create folder: `app/dashboard/reportes/page.tsx` (list) + `create/page.tsx` (form)
2. Create [app/lib/reportes-actions.tsx](app/lib/reportes-actions.tsx):
   ```typescript
   export async function fetchReportes() {
     /* GET /reportes */
   }
   export async function crearReporte(data) {
     /* POST /reportes */
   }
   export async function actualizarReporte(id, data) {
     /* PUT /reportes/:id */
   }
   export async function eliminarReporte(id) {
     /* DELETE /reportes/:id */
   }
   ```
3. Add types to [app/lib/definitions.ts](app/lib/definitions.ts): `ReporteData`, `ReporteDataCrud`
4. Create [app/ui/reportes/table.tsx](app/ui/reportes/table.tsx) (client) showing list
5. Create [app/ui/reportes/create-form.tsx](app/ui/reportes/create-form.tsx) for new entries
6. Create [app/ui/reportes/form.tsx](app/ui/reportes/form.tsx) for edits via `[id]/page.tsx`
7. Add link to sidebar in [app/dashboard/layout.tsx](app/dashboard/layout.tsx)

### Add a Linked Entity Modal (e.g., Bank Account to User)

1. Create types in [definitions.ts](app/lib/definitions.ts): `AdbankData`, `AdbankForm`
2. Create [app/lib/adbank-actions.tsx](app/lib/adbank-actions.tsx):
   ```typescript
   export async function fetchBankByUsuario(username) {
     /* GET /banco/usuario/{username} */
   }
   export async function crearCuentaBancaria(username, data) {
     /* POST /banco */
   }
   export async function actualizarCuentaBancaria(id, data) {
     /* PUT /banco/:id */
   }
   ```
3. Create [app/ui/usuarios/bank-account-modal.tsx](app/ui/usuarios/bank-account-modal.tsx):
   - Use `useState` for form state and `useEffect` to load data on modal open
   - Support both create (null data) and update (existing data) flows
   - Use `toast()` for feedback
4. In parent table ([app/ui/usuarios/table.tsx](app/ui/usuarios/table.tsx)):
   - Add state: `const [modalOpen, setModalOpen] = useState(false); const [selectedId, setSelectedId] = useState("");`
   - Add button that calls `setSelectedId()` and `setModalOpen(true)`
   - Render modal at bottom: `<BankAccountModal isOpen={modalOpen} onClose={() => setModalOpen(false)} username={selectedId} />`

### Handle Errors in Forms

- Server action returns `{success: false, message: "..."}` → parse on client
- Toast on client: `success ? toast.success(msg) : toast.error(msg)`
- Optional: Set `errorMsg` state for inline display
- Example: [app/ui/usuarios/bank-account-modal.tsx](app/ui/usuarios/bank-account-modal.tsx)

### Debug Session/Auth

- `useSession()` in any client page → check token, user fields
- Backend login must return: `{status: 200, token, id, username, tipo, dispositivo}`
- If middleware blocks: verify `matcher: ["/dashboard/:path*"]` in middleware.ts
- Check browser DevTools → Application → Cookies for session token
