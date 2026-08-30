type FakeOtp = { code: string; expiresAt: number };

const globalForFakeOtp = globalThis as typeof globalThis & {
  academyFakeOtps?: Map<string, FakeOtp>;
};

const fakeOtps = (globalForFakeOtp.academyFakeOtps ??= new Map());

export function rememberFakeOtp(identifier: string, code: string, expiresInSeconds: number) {
  fakeOtps.set(identifier.toLowerCase(), {
    code,
    expiresAt: Date.now() + expiresInSeconds * 1000,
  });
}

export function readFakeOtp(identifier: string): string | null {
  const key = identifier.toLowerCase();
  const entry = fakeOtps.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    fakeOtps.delete(key);
    return null;
  }
  return entry.code;
}
