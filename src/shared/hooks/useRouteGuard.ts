import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/authContext";
import { PUBLIC_PATHS } from "@/constants/paths/publicPaths";
import { canAccessRoute } from "../utils/helpers/permission";


export function useRouteGuard() {
  const { user, loading, authRedirecting } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '';

  const [checking, setChecking] = useState(true);

  const isPublicRoute = PUBLIC_PATHS.pages.includes(
    pathname as typeof PUBLIC_PATHS.pages[number]
  );

  // Ruta publica que esta logeado pero no debe ser redireccionado a /home
  const allowWhenLogged = ['/complete-profile'];

  useEffect(() => {
    if (loading || authRedirecting) return;

    // no logueado
    if (!user && !isPublicRoute) {
      router.replace('/');
      return;
    }

    // logueado en ruta pública
    if (user && isPublicRoute && !allowWhenLogged.includes(pathname)) {
      router.replace('/home');
      return;
    }

    // permisos
    if (user) {
      const hasAccess = canAccessRoute(pathname, user.roles || []);
      if (!hasAccess) {
        router.replace('/home');
        return;
      }
    }

    setChecking(false);
  }, [user, loading, pathname, router, isPublicRoute]);

  return checking;
}