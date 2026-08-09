import { SettingsNav } from './settings-nav';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Ajustes del negocio, horarios, reservas, seña, notificaciones y marca.
        </p>
      </div>
      <SettingsNav />
      <div className="max-w-2xl">{children}</div>
    </div>
  );
}
