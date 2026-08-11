import type { OrganizationFeatures } from '@/lib/api/types';

export interface NavItem {
  href: string;
  label: string;
  enabled: boolean;
}

// FM1–FM3 habilitan el panel operativo completo del negocio.
export const NAV: NavItem[] = [
  { href: '/', label: 'Inicio', enabled: true },
  { href: '/calendar', label: 'Calendario', enabled: true },
  { href: '/deposits', label: 'Señas', enabled: true },
  { href: '/clients', label: 'Clientes', enabled: true },
  { href: '/services', label: 'Servicios', enabled: true },
  { href: '/resources', label: 'Recursos', enabled: true },
  { href: '/settings', label: 'Configuración', enabled: true },
  { href: '/subscription', label: 'Suscripción', enabled: true },
];

/**
 * Navegación según los flags de la organización.
 *
 * Se **oculta** la sección, no se deshabilita: un ítem en gris con "Pronto"
 * comunica "todavía no", y acá el mensaje es "esto no aplica a tu cuenta". Una
 * cuenta de cortesía no tiene que ver un cartel de suscripción en ningún estado.
 */
export function navFor(features: OrganizationFeatures): NavItem[] {
  if (features.subscriptionsEnabled) return NAV;
  return NAV.filter((item) => item.href !== '/subscription');
}

export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
