'use client';

import { ThemeProvider } from 'next-themes';

import { AuthProvider, useAuth } from '@/contexts/authContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { usePathname } from 'next/navigation';
import Spinner from '@/components/ux/Spinner';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { TripProvider } from '@/contexts/tripContext';
import { PUBLIC_PATHS } from '@/constants/paths/publicPaths';
import { useRouteGuard } from '@/shared/hooks/useRouteGuard';



interface AppProvidersProps {
  children: React.ReactNode;
}

// Loading global para rutas publicas
function GlobalLoadingOverlay() {
  const { loading } = useAuth();
  const pathname = usePathname() || '';

  const shouldShowSpinner =
    PUBLIC_PATHS.pages.includes(pathname as unknown as never) && loading;

  if (!shouldShowSpinner) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/75">
      <Spinner />
      <span>Cargando...</span>
    </div>
  );
}

// Loading para validar los roles
function RouteGuardWrapper({ children }: { children: React.ReactNode }) {
  const checking = useRouteGuard();
  const pathname = usePathname() || '';

  const isPublicRoute = (PUBLIC_PATHS.pages as readonly string[]).includes(pathname)

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <Spinner />
        <span className="text-sm text-muted-foreground">
          Verificando sesión...
        </span>
      </div>
    );
  }

  return <>{children}</>;
}

export function AppProviders({ children }: AppProvidersProps) {
 
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID no está configurado');
  }
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <GoogleOAuthProvider clientId={clientId || ''}>
          <GoogleReCaptchaProvider 
            reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
            scriptProps={{
              async: true,
              defer: true,
              appendTo: 'body',
            }}
          >
            <AuthProvider>
              <TripProvider>
                <GlobalLoadingOverlay />
                <RouteGuardWrapper>
                {children}
                </RouteGuardWrapper>
              </TripProvider>
            </AuthProvider>
          </GoogleReCaptchaProvider>
        </GoogleOAuthProvider>
    </ThemeProvider>
  );
}
