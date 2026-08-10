# Agendox — Frontend

Workspace **pnpm + Turborepo** acotado a `frontend/`. Apps Next.js (App Router + TS + Tailwind + shadcn/ui) y packages compartidos.

## Estructura

```
frontend/
├── dashboard/            # Panel del negocio (owner/staff) — :3001
├── booking/              # Público + Customer Portal — :3002
├── admin/                # Super Admin de la plataforma — :3003
└── packages/
    ├── config/           # Preset de Tailwind (theming) + base compartida
    ├── domain/           # Enums, matriz de transiciones, formatMoney, formatInOrgTz
    ├── api-types/        # Tipos generados desde /docs-json (openapi-typescript)
    ├── api-client/       # apiFetch tipado (openapi-fetch), ApiError, 409, seam de refresh
    └── ui/               # shadcn/ui + cn + theming + NotificationBell + Toaster
```

> `landing/` queda fuera del MVP (solo `.gitkeep`).

## Deploys — una app = un proyecto de Vercel

Cada app es un Next independiente, con su propio login, sus propias cookies y
su propio dominio. **No hay una URL única donde “elegir” si entrás como Owner o
como Super Admin**: el rol lo define *qué app* abrís.

La raíz de este repo es la carpeta `frontend/`, así que el **Root Directory**
de cada proyecto de Vercel es el nombre de la app, sin prefijo.

| App         | Rol                    | Root Directory | Login                  | Cookie                | Endpoint del backend  |
| ----------- | ---------------------- | -------------- | ---------------------- | --------------------- | --------------------- |
| `dashboard` | Owner / staff del negocio | `dashboard` | `/login` (“Panel del negocio”) + `/register` | `agx_at` + `agx_rt` | `/auth/login`         |
| `admin`     | Super Admin plataforma | `admin`        | `/login` (“Acceso de super administración”) | `agx_admin_at` | `/admin/auth/login`   |
| `booking`   | Cliente final (OTP)    | `booking`      | `/[slug]/portal`       | `agx_cust_<slug>`     | `/public/:slug/otp/*` |

Cada proyecto necesita su propia `API_INTERNAL_URL` en *Settings → Environment
Variables*, marcada para todos los entornos que uses (Production + Preview).
Sin ella, la app falla con un error explícito en vez de pegarle a un host
hardcodeado.

Para agregar una app al deploy: *Vercel → Add New → Project*, importás el mismo
repo, cambiás el Root Directory al de la tabla y le cargás `API_INTERNAL_URL`.
Cada proyecto queda en su propio dominio.

Recordá que el Super Admin no se registra por la UI: se bootstrapea en el
backend con `pnpm db:seed:superadmin` (`SUPERADMIN_EMAIL` +
`SUPERADMIN_PASSWORD`). Los owners sí se crean solos desde `/register` del
dashboard.

### Patrón BFF (importante)

El browser **nunca** le pega al backend: siempre habla same-origin con las
route handlers de Next (`fetch('/api/auth/login')`), y esas route handlers
—server-side— llaman al backend con `apiUrl()` y setean las cookies httpOnly.
Por eso `API_INTERNAL_URL` no lleva prefijo `NEXT_PUBLIC` y `src/lib/env.ts`
no se importa desde componentes `'use client'`.

## Puesta en marcha (los comandos pnpm los corre el usuario)

1. Levantar el backend: `cd backend/api-agendox && pnpm docker:up` (queda en `http://localhost:3000`, Swagger en `/docs`).
2. En el `.env` del backend, en dev: `CORS_ORIGINS=http://localhost:3001,http://localhost:3002`.
3. Instalar deps del frontend:
   ```
   cd frontend
   pnpm install
   ```
4. Generar los tipos de la API (backend arriba):
   ```
   pnpm gen:api
   ```
   Reemplaza el placeholder de `packages/api-types/src/schema.ts` con el contrato real.
5. Copiar envs (obligatorio: `API_INTERNAL_URL` no tiene default):
   ```
   cp dashboard/.env.example dashboard/.env.local
   cp booking/.env.example booking/.env.local
   cp admin/.env.example admin/.env.local
   ```
6. Correr:
   ```
   pnpm dev
   ```
   - Dashboard: http://localhost:3001
   - Booking:   http://localhost:3002
   - Admin:     http://localhost:3003

## Verificación FM0 (entregable)

- Ambas apps arrancan.
- La home de cada app muestra el **estado del health check** del backend (a través de `@agendox/api-client`) — verde si responde.
- `pnpm typecheck` compila (una vez generados los tipos con `pnpm gen:api`, o con el placeholder).

## Milestones del frontend

- **FM0 — Fundaciones del workspace** ✅ (este)
- FM1 — Dashboard: auth (BFF) + shell
- FM2 — Dashboard: configuración del negocio
- FM3 — Dashboard: operación (calendario + turnos + señas)
- FM4 — Booking: público + wizard + Customer Portal
- FM5 — Notificaciones (polling + Web Push) + pulido + E2E
