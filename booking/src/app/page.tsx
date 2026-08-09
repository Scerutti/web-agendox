export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-4 p-10 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Agendox</h1>
      <p className="text-muted-foreground">
        Ingresá con el link de tu negocio para reservar un turno, por ejemplo{' '}
        <code>/tu-negocio</code>.
      </p>
    </main>
  );
}
