'use client';

import { useActionState } from 'react';
import { Input, Textarea } from '@agendox/ui';
import { Field, CheckboxRow } from '@/components/form/field';
import { SubmitButton } from '@/components/form/submit-button';
import { useActionFeedback } from '@/components/use-action-feedback';
import { IDLE_STATE } from '@/lib/actions';
import { savePayment } from '../actions';
import type { PaymentSettings } from '@/lib/api/settings';

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function PaymentForm({ data }: { data: PaymentSettings }) {
  const [state, action] = useActionState(savePayment, IDLE_STATE);
  useActionFeedback(state);

  return (
    <form action={action} className="space-y-4">
      <CheckboxRow
        name="depositEnabled"
        label="Exigir seña"
        defaultChecked={data.depositEnabled}
        hint="Si está activo, los turnos requieren seña para confirmarse."
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Tipo de seña" htmlFor="depositType">
          <select
            id="depositType"
            name="depositType"
            defaultValue={data.depositType ?? 'FIXED'}
            className={selectClass}
          >
            <option value="FIXED">Monto fijo</option>
            <option value="PERCENTAGE">Porcentaje</option>
          </select>
        </Field>
        <Field
          label="Valor de seña"
          htmlFor="depositValue"
          hint="Monto o % (0–100) según el tipo."
        >
          <Input
            id="depositValue"
            name="depositValue"
            type="number"
            step="0.01"
            min={0}
            defaultValue={data.depositValue ?? 0}
          />
        </Field>
        <Field
          label="Vencimiento de la seña (horas)"
          htmlFor="depositTtlHours"
          hint="Horas para pagar antes de liberar el turno. Vacío = default global."
        >
          <Input
            id="depositTtlHours"
            name="depositTtlHours"
            type="number"
            min={0}
            max={168}
            defaultValue={data.depositTtlHours ?? ''}
          />
        </Field>
      </div>

      <p className="pt-2 text-sm font-medium">Datos de transferencia</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Banco" htmlFor="bankName">
          <Input id="bankName" name="bankName" defaultValue={data.bankName ?? ''} />
        </Field>
        <Field label="Titular" htmlFor="accountHolder">
          <Input
            id="accountHolder"
            name="accountHolder"
            defaultValue={data.accountHolder ?? ''}
          />
        </Field>
        <Field label="Alias" htmlFor="alias">
          <Input id="alias" name="alias" defaultValue={data.alias ?? ''} />
        </Field>
        <Field label="CBU" htmlFor="cbu">
          <Input id="cbu" name="cbu" defaultValue={data.cbu ?? ''} />
        </Field>
        <Field label="Teléfono" htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={data.phone ?? ''} />
        </Field>
      </div>
      <Field label="Instrucciones" htmlFor="instructions">
        <Textarea
          id="instructions"
          name="instructions"
          defaultValue={data.instructions ?? ''}
        />
      </Field>
      <SubmitButton>Guardar cambios</SubmitButton>
    </form>
  );
}
