import { NextResponse } from 'next/server';

/**
 * Centralized error handler for API route catch blocks.
 *
 * Logs the real error server-side (so it shows up in Vercel logs) but returns a
 * generic message to the client — never leak stack traces, Mongo details, or
 * `error.message` to callers.
 *
 * For *expected* errors (validation -> 400, not found -> 404), return an explicit
 * controlled response directly in the handler instead of throwing.
 */
export function handleApiError(error: unknown, status = 500) {
  console.error(error);
  return NextResponse.json({ error: 'Internal server error' }, { status });
}
