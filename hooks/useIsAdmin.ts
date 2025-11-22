import { useSession } from 'next-auth/react';

export function useIsAdmin() {
  const { data: session } = useSession();
  // Ajusta esto según tu modelo de usuario
  // Por ejemplo, si session.user.role === 'admin'
  return session?.user?.role === 'admin';
}
