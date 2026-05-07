'use client';

import { HEADER_PATHS } from '@/constants/paths/layout/headerPaths';
import { AppHeader } from '@/widgets/AppHeader';
import MobileNavbar from '@/widgets/mobile/MobileNavbar';
import { usePathname } from 'next/navigation';

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const showHeader = HEADER_PATHS.some(route =>
    pathname.startsWith(route)
  );

  const logoHeaderPaths = ['/home', '/search'];

  const isLogoHeader = logoHeaderPaths.some(route =>
    pathname.startsWith(route)
  );

  return (
    <div className="min-h-screen">
      {showHeader && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <AppHeader
            showBack={!isLogoHeader}
            variant={isLogoHeader ? 'logo' : 'default'}
          />
        </div>
      )}

      <div className="flex flex-col min-h-screen px-6 sm:px-8 pt-14 pb-20">
        {children}
      </div>

      <MobileNavbar />
    </div>
  );
}