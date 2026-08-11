'use server';

import { revalidatePath } from 'next/cache';
import { ApiError, serverFetch } from '@/lib/api/server';
import type { OrganizationFeatures } from '@/lib/api/admin.types';

export interface ActionResult {
  ok: boolean;
  message: string;
}

/** Resultado de un alta: incluye el id para poder redirigir al detalle. */
export interface CreateResult extends ActionResult {
  id?: string;
}

/** Refresca las tres vistas que pueden estar mostrando datos de la organización. */
function revalidateOrg(id?: string): void {
  if (id) revalidatePath(`/organizations/${id}`);
  revalidatePath('/organizations');
  revalidatePath('/');
}

function failure(error: unknown, fallback: string): ActionResult {
  return { ok: false, message: error instanceof ApiError ? error.message : fallback };
}

async function setStatus(id: string, action: 'suspend' | 'reactivate'): Promise<ActionResult> {
  try {
    await serverFetch(`/admin/organizations/${id}/${action}`, { method: 'POST' });
    revalidateOrg(id);
    return {
      ok: true,
      message: action === 'suspend' ? 'Organización suspendida' : 'Organización reactivada',
    };
  } catch (e) {
    return failure(e, 'No se pudo actualizar la organización');
  }
}

export async function suspendOrganization(id: string) {
  return setStatus(id, 'suspend');
}

export async function reactivateOrganization(id: string) {
  return setStatus(id, 'reactivate');
}

/**
 * Baja del negocio. El backend la resuelve como baja lógica (estado
 * `DISABLED`): los datos quedan, pero nadie puede volver a operar.
 */
export async function disableOrganization(id: string): Promise<ActionResult> {
  try {
    await serverFetch(`/admin/organizations/${id}`, { method: 'DELETE' });
    revalidateOrg(id);
    return { ok: true, message: 'Organización dada de baja' };
  } catch (e) {
    return failure(e, 'No se pudo dar de baja la organización');
  }
}

export async function createOrganization(
  _prev: CreateResult,
  formData: FormData,
): Promise<CreateResult> {
  const billing = str(formData, 'billing') === 'ACTIVE' ? 'ACTIVE' : 'TRIAL';
  const planId = str(formData, 'planId');
  if (billing === 'ACTIVE' && !planId) {
    return { ok: false, message: 'Elegí el plan que querés otorgar' };
  }

  const payload = {
    organizationName: str(formData, 'organizationName'),
    slug: str(formData, 'slug').toLowerCase(),
    timezone: str(formData, 'timezone'),
    owner: {
      email: str(formData, 'ownerEmail'),
      password: str(formData, 'ownerPassword'),
      firstName: str(formData, 'ownerFirstName'),
      lastName: str(formData, 'ownerLastName'),
    },
    billing,
    // Solo viaja con ACTIVE: con TRIAL el backend lo ignora y un uuid vacío
    // haría fallar la validación.
    ...(billing === 'ACTIVE' ? { planId } : {}),
  };

  try {
    const created = await serverFetch<{ organizationId: string }>('/admin/organizations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    revalidateOrg(created.organizationId);
    return { ok: true, message: 'Negocio creado', id: created.organizationId };
  } catch (e) {
    return failure(e, 'No se pudo crear el negocio');
  }
}

export async function updateOrganization(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await serverFetch(`/admin/organizations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: str(formData, 'name'),
        timezone: str(formData, 'timezone'),
      }),
    });
    revalidateOrg(id);
    return { ok: true, message: 'Datos actualizados' };
  } catch (e) {
    return failure(e, 'No se pudieron actualizar los datos');
  }
}

export async function updateOwnerEmail(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await serverFetch(`/admin/organizations/${id}/owner-email`, {
      method: 'PATCH',
      body: JSON.stringify({ email: str(formData, 'ownerEmail') }),
    });
    revalidateOrg(id);
    return { ok: true, message: 'Email del dueño actualizado' };
  } catch (e) {
    return failure(e, 'No se pudo actualizar el email del dueño');
  }
}

export async function updateFeatures(
  id: string,
  changes: Partial<OrganizationFeatures>,
): Promise<ActionResult> {
  try {
    await serverFetch(`/admin/organizations/${id}/features`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    });
    revalidateOrg(id);
    return { ok: true, message: 'Funcionalidades actualizadas' };
  } catch (e) {
    return failure(e, 'No se pudieron actualizar las funcionalidades');
  }
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}
