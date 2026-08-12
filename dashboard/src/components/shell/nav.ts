import type { Role } from '@agendox/domain';
import type { OrganizationFeatures } from '@/lib/api/types';

export interface NavItem {
  href: string;
  label: string;
  enabled: boolean;
  /**
   * Roles que ven la sección. Espeja los `@Roles` del backend, que es donde el
   * permiso se decide de verdad: esconder el link solo evita el clic que
   * terminaría en un 403.
   */
  roles?: Role[];
}

const OPERATIONAL: Role[] = ['OWNER', 'ADMIN', 'RECEPTIONIST'];
const MANAGERIAL: Role[] = ['OWNER', 'ADMIN'];

// FM1–FM3 habilitan el panel operativo completo del negocio.
export const NAV: NavItem[] = [
  { href: '/', label: 'Inicio', enabled: true },
  { href: '/calendar', label: 'Calendario', enabled: true, roles: OPERATIONAL },
  { href: '/deposits', label: 'Señas', enabled: true, roles: MANAGERIAL },
  { href: '/clients', label: 'Clientes', enabled: true, roles: OPERATIONAL },
  { href: '/services', label: 'Servicios', enabled: true, roles: MANAGERIAL },
  { href: '/resources', label: 'Recursos', enabled: true, roles: MANAGERIAL },
  { href: '/team', label: 'Equipo', enabled: true, roles: MANAGERIAL },
  { href: '/settings', label: 'Configuración', enabled: true, roles: MANAGERIAL },
  { href: '/subscription', label: 'Suscripción', enabled: true, roles: MANAGERIAL },
];

/**
 * Navegación según los flags de la organización y el rol del usuario.
 *
 * Se **oculta** la sección, no se deshabilita: un ítem en gris con "Pronto"
 * comunica "todavía no", y acá el mensaje es "esto no aplica a tu cuenta". Una
 * cuenta de cortesía no tiene que ver un cartel de suscripción en ningún estado,
 * y un recepcionista no tiene que ver seis secciones que le van a dar 403.
 */
export function navFor(features: OrganizationFeatures, role: Role): NavItem[] {
  return NAV.filter((item) => {
    if (item.href === '/subscription' && !features.subscriptionsEnabled) return false;
    return !item.roles || item.roles.includes(role);
  });
}

export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
