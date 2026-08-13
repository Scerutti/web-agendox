'use client';

import { useActionState } from 'react';
import { Callout, ColorPicker, Input, Textarea } from '@agendox/ui';
import { Field } from '@/components/form/field';
import { SubmitButton } from '@/components/form/submit-button';
import { useActionFeedback } from '@/components/use-action-feedback';
import { IDLE_STATE } from '@/lib/actions';
import { saveBranding } from '../actions';
import type { BrandingSettings } from '@/lib/api/settings';

export function BrandingForm({
  data,
  logoUploadAvailable,
}: {
  data: BrandingSettings;
  /** Lo habilita la plataforma por organización; sin esto solo se puede usar logo por URL. */
  logoUploadAvailable: boolean;
}) {
  const [state, action] = useActionState(saveBranding, IDLE_STATE);
  useActionFeedback(state);

  return (
    <form action={action} className="space-y-5">
      <Callout tone="tip" title="Dónde se ve esto">
        En la página pública donde tus clientes reservan, y en este panel. Los colores
        se ajustan solos para que el texto siga siendo legible en modo claro y oscuro.
      </Callout>

      <Field
        label="Logo (URL)"
        htmlFor="logoUrl"
        hint="Link directo a la imagen. Se ve mejor cuadrada, de al menos 200×200."
        info="Pegá la dirección de una imagen ya publicada en internet (por ejemplo, la de tu web o tu red social). Tiene que terminar en .jpg, .png o .webp."
      >
        <Input
          id="logoUrl"
          name="logoUrl"
          type="url"
          inputMode="url"
          placeholder="https://…"
          defaultValue={data.logoUrl ?? ''}
        />
      </Field>

      {/* La subida de archivo está construida pero apagada hasta que haya dónde
          guardar las imágenes. Se muestra deshabilitada, y no oculta, para que el
          camino quede claro y el flag la encienda sin tocar el formulario. */}
      {/* `min-w-0` no es cosmético: el navegador le da a `fieldset` un
          `min-inline-size: min-content` que ninguna otra regla pisa, y el input
          de archivo (botón + “Sin archivos seleccionados”) mide más que un
          teléfono. Sin esto la pestaña Marca se iba de ancho. */}
      <fieldset
        disabled={!logoUploadAvailable}
        className={
          logoUploadAvailable ? 'min-w-0 space-y-2' : 'min-w-0 space-y-2 opacity-60'
        }
      >
        <Field
          label="Logo (archivo)"
          htmlFor="logoFile"
          hint={
            logoUploadAvailable
              ? 'JPG, PNG o WEBP, hasta 2 MB.'
              : 'Próximamente — todavía no está disponible. Por ahora usá el logo por URL de arriba.'
          }
          info={
            logoUploadAvailable
              ? 'La imagen queda alojada por Agendox: no depende de que el link de afuera siga vivo.'
              : 'Estamos preparando el almacenamiento de imágenes. Cuando esté, vas a poder subir el logo desde acá en vez de pegar un link.'
          }
        >
          <input
            id="logoFile"
            name="logoFile"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="block w-full max-w-full cursor-pointer rounded-md border border-input bg-background p-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-secondary-foreground disabled:cursor-not-allowed"
          />
        </Field>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Color primario"
          htmlFor="primaryColor"
          hint="Botones y acentos."
          info="Elegilo con el cuadradito de color o pegá el código hexadecimal si ya lo tenés. Dejalo vacío para usar el color por defecto de Agendox."
        >
          <ColorPicker
            id="primaryColor"
            name="primaryColor"
            defaultValue={data.primaryColor}
            fallback="#2563eb"
          />
        </Field>
        <Field
          label="Color secundario"
          htmlFor="secondaryColor"
          hint="Fondos suaves y etiquetas."
        >
          <ColorPicker
            id="secondaryColor"
            name="secondaryColor"
            defaultValue={data.secondaryColor}
            fallback="#e2e8f0"
          />
        </Field>
      </div>

      <Field
        label="Título público"
        htmlFor="publicTitle"
        hint="El nombre que ve el cliente arriba de la página de reservas. Vacío usa el nombre del negocio."
      >
        <Input id="publicTitle" name="publicTitle" defaultValue={data.publicTitle ?? ''} />
      </Field>
      <Field
        label="Descripción pública"
        htmlFor="publicDescription"
        hint="Una línea corta debajo del título. Ej: “Turnos de lunes a sábado”."
      >
        <Textarea
          id="publicDescription"
          name="publicDescription"
          defaultValue={data.publicDescription ?? ''}
        />
      </Field>
      <SubmitButton>Guardar cambios</SubmitButton>
    </form>
  );
}
