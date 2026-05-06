'use client'
import { AlertDialog } from '@/components/ux/AlertDialog';
import { ChartSpline, ChevronRight, CircleStar, Flag, Headset, History, Info, LogOut, Settings, Tickets, UserRoundPen } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { FaCarAlt } from 'react-icons/fa';


interface ProfileOptionsProps {
  role: 'driver' | 'passenger';
  logout: () => void;
}

export function ProfileOptions({ role, logout }: ProfileOptionsProps) {
  const isDriver = role === 'driver';
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleLogout =  () => {
    logout()
    setIsDialogOpen(false)
  }

  const linkClasses = `
    flex items-center justify-between gap-2 px-4 py-3
    rounded-lg transition-colors duration-200
    hover:bg-gray-1 dark:hover:bg-gray-2
    text-sm font-medium text-gray-700 dark:text-gray-200
  `;

  return (
    <div className="flex flex-col gap-3 shadow-md">
      {/* Bloque 1: Personal */}
      <div>
        <p className='px-6 text-sm mb-0.5 text-white/75'>Cuenta</p>
        <div className="flex flex-col gap-1 p-2 bg-white dark:bg-gray-2/50 rounded-xl">
          <Link 
            href={`${isDriver ? '/profile/driver' : '/profile/details'}`}
            className={linkClasses}
          >
            <div className="flex items-center gap-2">   
              <UserRoundPen size={18}/>
              <span>{isDriver ? 'Perfil de conductor' : 'Perfil'}</span>
            </div>
            
            <ChevronRight size={18} />
          </Link>

          {isDriver && (
            <Link href="/vehicle" className={linkClasses}>
              <div className="flex items-center gap-2">   
                <FaCarAlt size={18}/>
                <span>Mis vehículos</span>
              </div>
              
              <ChevronRight size={18} />
            </Link>
          )}

          <Link
            href={`${isDriver ? '/reservations' : '/reservations/passenger'}`}
            className={linkClasses}
          >
            <div className="flex items-center gap-2">   
              <Tickets size={18}/>
              <span>Solicitudes de reserva</span>
            </div>
            
            <ChevronRight size={18} />
          </Link>

          <Link
            href={`/trips?role=${isDriver ? 'driver' : 'passenger'}`}
            className={linkClasses}
          >
            <div className="flex items-center gap-2">   
              <History size={18}/>
              <span>Historial de viajes</span>
            </div>
            
            <ChevronRight size={18} />
          </Link>

          <Link
            href={`/account/reviews`}
            className={linkClasses}
            >
            <div className="flex items-center gap-2">   
              <CircleStar size={18}/>
              <span>Reseñas</span>
            </div>
            
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>

      <div>
        <p className='px-6 text-sm mb-0.5 text-white/75'>Actividad</p>
        <div className="flex flex-col gap-1 p-2 bg-white dark:bg-gray-2/50 rounded-xl">
          <Link
            href={`/activity/${isDriver ? 'driver' : 'passenger'}`}
            className={linkClasses}
          >
            <div className="flex items-center gap-2"> 
              <ChartSpline size={18}/>
              <span>Estadísticas como {isDriver ? 'conductor' : 'pasajero'}</span>
            </div>
            
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>

      {/* Bloque 2: Ajustes  */}
      <div>
        <p className='px-6 text-sm mb-0.5 text-white/75'>Ajustes</p>
        <div className="flex flex-col gap-1 p-2 bg-white dark:bg-gray-2/50 rounded-xl">
          <Link
            href={'/settings'}
            className={linkClasses}
          >
            <div className="flex items-center gap-2">   
              <Settings size={18}/>
              <span>Configuraciones</span>
            </div>
            
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>
      
      {/* Bloque 3: Ayuda e información  */}
      <div>
        <p className='px-6 text-sm mb-0.5 text-white/75'>Ayuda e información</p>
        <div className="flex flex-col gap-1 p-2 bg-white dark:bg-gray-2/50 rounded-xl">
          <Link
            href={'/profile'}
            className={linkClasses}
          >
            <div className="flex items-center gap-2">   
              <Flag size={18}/>
              <span>Informar un problema</span>
            </div>
            
            <ChevronRight size={18} />
          </Link>

          <Link
            href={'/profile'}
            className={linkClasses}
          >
            <div className="flex items-center gap-2">   
              <Headset size={18}/>
              <span>Ayuda</span>
            </div>
            
            <ChevronRight size={18} />
          </Link>

          <Link
            href={'/profile'}
            className={linkClasses}
          >
            <div className="flex items-center gap-2">   
              <Info size={18}/>
              <span>Términos y condiciones</span>
            </div>
            
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>
      {/* Bloque 4: Sesión  */}
      <div>
        <p className='px-6 text-sm mb-0.5 text-white/75'>Sesión</p>
        <div className="flex flex-col gap-1 p-2 bg-white dark:bg-gray-2/50 rounded-xl">
          <button
            onClick={() => setIsDialogOpen(true)}
            className={`
              ${linkClasses}
              text-red-500 hover:bg-red-100 dark:hover:bg-red-950 cursor-pointer
            `}
            type="button"
          >
            <div className="flex items-center gap-2">   
              <LogOut size={18}/>
              <span>Cerrar sesión</span>
            </div>
              
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <AlertDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleLogout} // tu función de logout
        type="info"
        title="Cerrar sesión"
        description="¿Estás seguro de que querés cerrar sesión? Tendrás que volver a iniciar sesión para continuar usando la aplicación."
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
      />
    </div>
  );
}
