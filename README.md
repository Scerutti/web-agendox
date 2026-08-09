# Agendox — Frontend

Workspace **pnpm + Turborepo** acotado a `frontend/`. Dos apps Next.js (App Router + TS + Tailwind + shadcn/ui) y packages compartidos.

## Estructura

```
frontend/
├── dashboard/            # Panel del negocio (staff) — :3001
├── booking/              # Público + Customer Portal — :3002
└── packages/
    ├── config/           # Preset de Tailwind (theming) + base compartida
    ├── domain/           # Enums, matriz de transiciones, formatMoney, formatInOrgTz
    ├── api-types/        # Tipos generados desde /docs-json (openapi-typescript)
    ├── api-client/       # apiFetch tipado (openapi-fetch), ApiError, 409, seam de refresh
    └── ui/               # shadcn/ui + cn + theming + NotificationBell + Toaster
```

> `admin/` (Super Admin) y `landing/` quedan fuera del MVP (solo `.gitkeep`).

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
5. Copiar envs:
   ```
   cp dashboard/.env.example dashboard/.env.local
   cp booking/.env.example booking/.env.local
   ```
6. Correr:
   ```
   pnpm dev
   ```
   - Dashboard: http://localhost:3001
   - Booking:   http://localhost:3002

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
