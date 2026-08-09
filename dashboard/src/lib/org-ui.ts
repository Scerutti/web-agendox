import type { Role } from '@agendox/domain';

// Etiquetas en español para el rol de staff (Role es un enum del dominio).
export const ROLE_LABEL: Record<Role, string> = {
  OWNER: 'Propietario',
  ADMIN: 'Administrador',
  RECEPTIONIST: 'Recepcionista',
  RESOURCE_OPERATOR: 'Operador de recurso',
};

// Estado de la organización (Organization.status llega como string).
const ORG_STATUS_LABEL: Record<string, string> = {
  TRIAL: 'En prueba',
  ACTIVE: 'Activa',
  SUSPENDED: 'Suspendida',
  DISABLED: 'Deshabilitada',
};

export function orgStatusLabel(status: string): string {
  return ORG_STATUS_LABEL[status.toUpperCase()] ?? status;
}
