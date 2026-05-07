'use client'


import { HEADER_PATHS } from "@/constants/paths/layout/headerPaths";
import { PROTECTED_PATHS } from "@/constants/paths/protectedPaths";
import { AppHeader } from "@/widgets/AppHeader";
import DesktopSidebar from "@/widgets/desktop/DesktopSidebar";
import { usePathname } from "next/navigation";

export default function DesktopLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const shouldShowSidebar = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const showHeader = HEADER_PATHS.some(route => pathname.startsWith(route));

  const logoHeaderPaths = [ "/home", "/search"];
  const isLogoHeader = logoHeaderPaths.some(route => pathname.startsWith(route));
  

  return (
    <div className="flex min-h-screen">
      {shouldShowSidebar && <DesktopSidebar />}

      <main className={`${shouldShowSidebar ? 'ml-64' : ''} flex flex-col flex-1`}>
  
        {showHeader && (
          <div className="sticky top-0 z-50 bg-white">
            <AppHeader
              showBack={!isLogoHeader}
              variant={isLogoHeader ? "logo" : "default"}
            />
          </div>
        )}

        <div className="flex flex-col flex-1 overflow-auto py-4">
          {children}
        </div>

      </main>
    </div>
  );
}
