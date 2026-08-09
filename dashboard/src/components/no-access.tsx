import { Card, CardContent } from '@agendox/ui';

export function NoAccess({ resource = 'esta sección' }: { resource?: string }) {
  return (
    <Card>
      <CardContent className="p-6 text-sm text-muted-foreground">
        No tenés permisos para ver o editar {resource}. Pedile a un
        Owner/Admin del negocio.
      </CardContent>
    </Card>
  );
}
