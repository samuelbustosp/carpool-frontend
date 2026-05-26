'use client';

import { Toast } from '@/components/ux/Toast';
import { useAuth } from '@/contexts/authContext';
import { CirclePlus, Home, LucideIcon, Route, Search, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Role } from '../desktop/DesktopSidebar';
import { PROTECTED_PATHS } from '@/constants/paths/protectedPaths';

const navItems: { 
  href: string; 
  icon: LucideIcon; 
  label: string; 
  role: Role; 
  size: number; 
  disabled?: boolean;
}[] = [
  { href: '/home', icon: Home, label: 'Inicio', role: 'user', size: 22 },
  { href: '/search', icon: Search, label: 'Buscar', role: 'user', size: 22 },
  { href: '/trip/new', icon: CirclePlus, label: 'Publicar viaje', role: 'driver', size: 22 },
  { href: '/trips', icon: Route, label: 'Viajes', role: 'user', size: 22  },
  { href: '/profile', icon: User, label: 'Perfil', role: 'user', size: 22 },
];

export default function MobileNavbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  if (!user) return null;

  const userRoles = user?.roles || ['user'];
  
  // Filtramos los ítems según el rol del usuario
  const filteredNavItems = navItems.filter(item => userRoles.includes(item.role ?? 'user'));

  // Mostrar solo si la ruta empieza con una ruta permitida
  const shouldShowNavbar = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  if (!shouldShowNavbar) return null;

return (
  <>
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-gray-6 dark:border-gray-2 md:hidden bg-white dark:bg-dark-5">
      <ul className="flex justify-around items-center h-12">
        {filteredNavItems.map(({ href, icon: Icon, size, disabled, label }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          if (disabled) {
            return (
              <li key={href}>
                <button
                  type="button"
                  onClick={() =>
                    setToastMessage(`${label} estará disponible próximamente!`)
                  }
                  className="
                    flex flex-col items-center text-sm
                    text-gray-400 dark:text-gray-6
                    opacity-60
                    active:scale-95
                    transition
                  "
                >
                  <Icon size={size} className="mb-0.5" />
                </button>
              </li>
            );
          }

          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center text-sm ${
                  isActive
                    ? 'dark:text-white text-gray-2'
                    : 'dark:text-gray-11/80 text-gray-10'
                }`}
              >
                <Icon size={size} strokeWidth={`${isActive ? '2.5' : '2'}`} className="mb-0.5" />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>

    {toastMessage && (
      <Toast
        message={toastMessage}
        type="info"
        onClose={() => setToastMessage(null)}
      />
    )}
  </>
);
}
