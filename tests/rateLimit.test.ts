import { describe, it, expect } from 'vitest';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

describe('rateLimit', () => {
  it('allows requests up to the limit then blocks', () => {
    const key = 'test-block';
    expect(rateLimit(key, 3, 60_000).allowed).toBe(true);
    expect(rateLimit(key, 3, 60_000).allowed).toBe(true);
    expect(rateLimit(key, 3, 60_000).allowed).toBe(true);
    expect(rateLimit(key, 3, 60_000).allowed).toBe(false);
  });

  it('reports a positive retryAfter when blocked', () => {
    const key = 'test-retry';
    rateLimit(key, 1, 60_000);
    const blocked = rateLimit(key, 1, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it('tracks separate keys independently', () => {
    expect(rateLimit('test-a', 1, 60_000).allowed).toBe(true);
    expect(rateLimit('test-b', 1, 60_000).allowed).toBe(true);
  });
});

describe('getClientIp', () => {
  it('returns the first IP from x-forwarded-for', () => {
    const headers = new Headers({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' });
    expect(getClientIp(headers)).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip', () => {
    const headers = new Headers({ 'x-real-ip': '9.9.9.9' });
    expect(getClientIp(headers)).toBe('9.9.9.9');
  });

  it('returns "unknown" when no IP headers are present', () => {
    expect(getClientIp(new Headers())).toBe('unknown');
  });
});
