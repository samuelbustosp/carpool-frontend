'use client'

import { ROUTE_TITLES } from '@/constants/paths/admin/adminPaths'
import { useAuth } from '@/contexts/authContext'
import { PanelLeft } from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'


export default function AdminNavbar() {
  const pathname = usePathname()
  const { user, imageLoading } = useAuth()

  const title = ROUTE_TITLES[pathname] ?? 'Dashboard'

  return (
    <header className="h-13 bg-dark-5 flex items-center px-5 gap-3 border-b border-white/6 shrink-0">
      <div className="flex items-center gap-2">
        <span><PanelLeft size={20} /></span>
        <span className="text-sm text-gray-4">{title}</span>
      </div>

      <div className="flex-1" />

      {/* Avatar */}
      <div className="flex items-center gap-2 shrink-0">
        <p>
          Hola, <span className="font-semibold">{user?.name}!</span>
        </p>

        {imageLoading ? (
          <div className="w-7 h-7 rounded-full bg-white/10 animate-pulse shrink-0" />
        ) : user?.profileImage && (
          <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
            <Image
              src={user.profileImage}
              alt={user?.name ?? 'Avatar'}
              width={28}
              height={28}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
      
    </header>
  )
}