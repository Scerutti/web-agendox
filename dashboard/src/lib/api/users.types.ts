import type { Role } from '@agendox/domain';

// Módulo client-safe (sin `next/headers`): tipos + helpers puros de usuarios,
// consumibles desde client components. El fetcher server-only vive en `users.ts`.

export interface UserView {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  status: 'ACTIVE' | 'INACTIVE';
  /** `null` mientras no haya iniciado sesión por primera vez. */
  lastLoginAt: string | null;
  createdAt: string;
}

/** "Nombre Apellido" para mostrar, con fallback al email. */
export function userDisplayName(user: UserView): string {
  const name = `${user.firstName} ${user.lastName}`.trim();
  return name || user.email;
}
