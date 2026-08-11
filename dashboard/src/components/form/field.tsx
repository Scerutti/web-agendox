import { InfoHint, Label } from '@agendox/ui';

export function Field({
  label,
  htmlFor,
  hint,
  info,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  /** Explicación larga del campo; va detrás de un ícono para no ensuciar el form. */
  info?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={htmlFor}>{label}</Label>
        {info ? <InfoHint label={`Qué es "${label}"`}>{info}</InfoHint> : null}
      </div>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function CheckboxRow({
  name,
  label,
  defaultChecked,
  hint,
  info,
  disabled,
  /**
   * Mantiene el valor guardado cuando el checkbox está deshabilitado: un input
   * `disabled` no viaja en el submit, y sin esto guardar el formulario apagaría
   * en silencio una opción que el usuario nunca tocó.
   */
  preserveWhenDisabled = true,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
  hint?: React.ReactNode;
  info?: React.ReactNode;
  disabled?: boolean;
  preserveWhenDisabled?: boolean;
}) {
  return (
    <label className={disabled ? 'flex items-start gap-3 opacity-60' : 'flex items-start gap-3'}>
      <input
        type="checkbox"
        name={disabled ? undefined : name}
        defaultChecked={defaultChecked}
        disabled={disabled}
        className="mt-1 h-4 w-4 rounded border-input disabled:cursor-not-allowed"
      />
      {disabled && preserveWhenDisabled && defaultChecked ? (
        <input type="hidden" name={name} value="on" />
      ) : null}
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          {label}
          {info ? <InfoHint label={`Qué es "${label}"`}>{info}</InfoHint> : null}
        </span>
        {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
      </span>
    </label>
  );
}
