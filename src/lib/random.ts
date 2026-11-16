/** Source of uniform 32-bit unsigned integers. Injectable for deterministic tests. */
export type Uint32Source = () => number;

/** Cryptographically secure source backed by the Web Crypto API. */
export const cryptoSource: Uint32Source = () => {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0];
};

const RANGE = 0x1_0000_0000; // 2^32

/**
 * Uniform integer in [0, n) using rejection sampling, so there is no modulo bias.
 */
export function randomInt(n: number, src: Uint32Source = cryptoSource): number {
  if (!Number.isInteger(n) || n <= 0 || n > RANGE) throw new RangeError(`invalid n: ${n}`);
  const limit = RANGE - (RANGE % n); // largest multiple of n that fits
  for (;;) {
    const x = src() >>> 0;
    if (x < limit) return x % n;
  }
}

/** Unbiased Fisher–Yates shuffle; returns a new array. */
export function shuffle<T>(items: readonly T[], src: Uint32Source = cryptoSource): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1, src);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Deterministic xorshift32 source — for tests only, never for real draws. */
export function seededSource(seed: number): Uint32Source {
  let s = seed >>> 0 || 0x9e3779b9;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s;
  };
}
