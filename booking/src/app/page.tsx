import { AppFooter } from '@agendox/ui';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-4 p-10 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Agendox</h1>
        <p className="text-muted-foreground">
          Ingresá con el link de tu negocio para reservar un turno, por ejemplo{' '}
          <code>/tu-negocio</code>.
        </p>
      </main>
      <AppFooter />
    </div>
  );
}
