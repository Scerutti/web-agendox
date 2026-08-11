# Troubleshooting — deploys y login

Casos reales que ya nos pasaron, con el diagnóstico y la salida. Antes de
debuggear un login, mirá el campo `path` de la respuesta de error del backend:
te dice exactamente contra qué endpoint terminó pegando la request.

---

## 401 `Credenciales inválidas` al loguear un owner (2026-08-10)

### Síntoma

En `https://web-agendox.vercel.app/login`, con las credenciales del owner de
prueba, el login falla:

```
POST https://web-agendox.vercel.app/api/auth/login
Status: 401 Unauthorized

{
  "statusCode": 401,
  "code": "UNAUTHORIZED",
  "message": "Credenciales inválidas",
  "path": "/api/v1/admin/auth/login",     <-- LA PISTA
  "requestId": "d78d1dab-e67c-494d-82e4-c0a2812b7b5c"
}
```

El super admin sí entra por esa misma URL. La organización y el usuario owner
existen en la base (`db:migrate`, `db:constraints`, `db:seed` y
`db:seed:superadmin` ya corridos).

### Causa

**No es un bug: es la app equivocada.** `web-agendox.vercel.app` es el deploy de
`admin/` (Root Directory = `admin`). Su route handler `/api/auth/login` habla
únicamente con `/api/v1/admin/auth/login`, que consulta la tabla
`super_admins`. El owner vive en `users`, así que ahí no entra nunca — y está
bien que sea así: son dos sesiones distintas, con cookies distintas.

El owner necesita la app `dashboard/`, que en ese momento **no estaba
deployada**. No había ninguna URL de login de owner.

### Evidencia

Contra el backend en Railway, con las credenciales del owner del seed
(`SEED_OWNER_EMAIL`, por defecto `owner@demo.test`):

| Endpoint                        | Resultado                                        |
| ------------------------------- | ------------------------------------------------ |
| `POST /api/v1/auth/login`       | **201** — `role: "OWNER"`, tokens emitidos ✅    |
| `POST /api/v1/admin/auth/login` | **401 Credenciales inválidas** ← el del síntoma  |

Y sobre el deploy, confirmando qué app sirve ese dominio:

| Probe a `web-agendox.vercel.app` | Resultado                         | Conclusión                                  |
| -------------------------------- | --------------------------------- | ------------------------------------------- |
| `GET /login`                     | “Acceso de super administración”  | es la app `admin`                           |
| `GET /api/auth/register`         | **404**                           | esa route handler solo existe en `dashboard`: el dashboard no está ahí |
| `GET /calendar`, `/register`     | 307 → `/login`                    | no son páginas reales; el middleware del admin redirige todo lo desconocido |

### Salida

Crear el segundo proyecto de Vercel (no hay nada que cambiar en el código):

1. *Vercel → Add New → Project* → importar el mismo repo.
2. **Root Directory: `dashboard`** (sin prefijo `frontend/`: la raíz del repo ya
   es esa carpeta).
3. `API_INTERNAL_URL` = `https://api-agendox-production.up.railway.app/api/v1`,
   marcada para Production y Preview.
4. Deploy. El owner entra por `/login` de ese dominio nuevo. Para dar de alta más
   negocios se usa el panel `admin` → *Organizaciones* → *Nuevo negocio*: el
   dashboard ya no tiene registro público.

### Mapa de logins (para no volver a mezclarlos)

| Quién       | App         | Cookie              | Endpoint del backend  | Cómo se crea la cuenta            |
| ----------- | ----------- | ------------------- | --------------------- | --------------------------------- |
| Super Admin | `admin`     | `agx_admin_at`      | `/admin/auth/login`   | `pnpm db:seed:superadmin`         |
| Owner/staff | `dashboard` | `agx_at` + `agx_rt` | `/auth/login`         | alta desde `admin` o `pnpm db:seed` |
| Cliente     | `booking`   | `agx_cust_<slug>`   | `/public/:slug/otp/*` | OTP por email, sin password       |

Cada app es un proyecto de Vercel distinto con su propio dominio. **No existe
una URL donde elegir el rol**: el rol lo define qué app abrís.

---

## 404 en `/api/v1/api/auth/login` — doble prefijo en el login del admin (2026-08-10, resuelto en `38a00c4`)

### Síntoma

El login del admin pegaba a
`https://api-agendox-production.up.railway.app/api/v1/api/auth/login` → 404, y
el form no mostraba ningún error.

### Causa

`admin/src/app/(auth)/login/login-form.tsx` era un client component que armaba
la URL con `API_INTERNAL_URL`:

```ts
// mal
const res = await fetch(`${API_INTERNAL_URL}/api/auth/login`, …)
```

Dos errores encimados:

1. `API_INTERNAL_URL` ya incluye `/api/v1`, y `/api/auth/login` es un path de
   **Next**, no del backend → doble prefijo.
2. Desde el browser le pegaba **directo al backend**. Aun con la URL correcta no
   podía funcionar: el backend no puede setear la cookie httpOnly del dominio de
   Vercel, y encima chocás con CORS.

Además, en el bundle del browser `process.env.API_INTERNAL_URL` no existe (solo
se inyectan las `NEXT_PUBLIC_*`), así que el `??` caía **siempre** en el default
hardcodeado, y ese host quedaba expuesto en el JS público.

### Salida

- El form hace `fetch('/api/auth/login')` same-origin (patrón BFF). La route
  handler server-side llama a `/admin/auth/login` y setea la cookie.
- `src/lib/env.ts` de las tres apps ya no tiene default: expone `apiUrl(path)` y
  tira un error explícito si falta `API_INTERNAL_URL`.

### Regla para no repetirlo

`src/lib/env.ts` es **solo server-side**. Si un componente `'use client'`
necesita datos del backend, va contra una route handler de Next con path
relativo (`fetch('/api/…')`), nunca contra `API_INTERNAL_URL`.
