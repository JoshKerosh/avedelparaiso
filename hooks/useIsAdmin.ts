import { useSession } from 'next-auth/react';

// There is no role concept in the auth model: any authenticated user is the admin.
export function useIsAdmin() {
  const { status } = useSession();
  return status === 'authenticated';
}
