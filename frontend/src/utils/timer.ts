export function getTimeInterval(now: number, expiresAt: string): number {
  const expires = new Date(expiresAt).getTime();
  return Math.floor((expires - now) / 1000);
}
