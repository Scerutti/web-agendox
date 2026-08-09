// Helpers para parsear FormData dentro de Server Actions.

export function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? '').trim();
}

export function optStr(fd: FormData, key: string): string | undefined {
  const v = str(fd, key);
  return v === '' ? undefined : v;
}

export function num(fd: FormData, key: string): number {
  return Number(fd.get(key));
}

export function optNum(fd: FormData, key: string): number | undefined {
  const raw = fd.get(key);
  if (raw == null || String(raw).trim() === '') return undefined;
  return Number(raw);
}

/** Un checkbox marcado envía "on"; ausente => false. */
export function bool(fd: FormData, key: string): boolean {
  const v = fd.get(key);
  return v === 'on' || v === 'true';
}
