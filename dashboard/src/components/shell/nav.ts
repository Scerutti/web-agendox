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

export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
