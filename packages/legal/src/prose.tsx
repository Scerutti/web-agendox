import * as React from 'react';

/**
 * Primitivas de texto para los documentos legales.
 *
 * Son propias en vez del plugin `@tailwindcss/typography` porque el proyecto no
 * lo tiene, y sumar una dependencia para dos páginas de prosa no se paga. Usan
 * los mismos tokens de color que el resto del sistema, así que respetan el tema
 * claro/oscuro sin trabajo extra.
 */

/** Título numerado de cláusula. El número se pasa aparte para poder citarla. */
export function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="pt-2 text-base font-semibold tracking-tight text-foreground">
        {n}. {title}
      </h2>
      {children}
    </section>
  );
}

/** Bloque sin numeración, para encabezados de anexo. */
export function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-t pt-6 text-base font-semibold tracking-tight text-foreground">
      {children}
    </h2>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>;
}

export function Ul({ children }: { children: React.ReactNode }) {
  return (
    <ul className="ml-5 list-disc space-y-1.5 text-sm leading-relaxed text-muted-foreground">
      {children}
    </ul>
  );
}

export function Li({ children }: { children: React.ReactNode }) {
  return <li>{children}</li>;
}

/** Resalta un término dentro de la prosa sin cambiar de color. */
export function B({ children }: { children: React.ReactNode }) {
  return <strong className="font-medium text-foreground">{children}</strong>;
}

/**
 * Encabezado del documento: título, versión y fecha de vigencia. La versión se
 * muestra siempre porque es lo que se registra al aceptar.
 */
export function DocumentHeader({
  title,
  version,
  subtitle,
}: {
  title: string;
  version: string;
  subtitle?: string;
}) {
  return (
    <header className="space-y-1">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
      {/* La versión es la fecha de vigencia, así que no se repite. */}
      <p className="text-xs text-muted-foreground">Versión {version} · en vigencia</p>
      {subtitle ? <p className="pt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
    </header>
  );
}

/** Contenedor de un documento: separa las cláusulas de forma consistente. */
export function DocumentBody({ children }: { children: React.ReactNode }) {
  return <div className="space-y-5">{children}</div>;
}
