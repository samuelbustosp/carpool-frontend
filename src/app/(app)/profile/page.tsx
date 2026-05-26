'use client';

import { AlertDialog } from '@/components/ux/AlertDialog';
import { useAuth } from '@/contexts/authContext';
import { ProfileHeader } from '@/modules/profile/components/ProfileHeader';
import { ProfileOptions } from '@/modules/profile/components/ProfileOptions';
import { RoleSwithcer } from '@/modules/profile/components/RoleSwitcher';
import { User } from 'lucide-react';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProfilePage() {
  const { user, logout, profileViewRole, setProfileViewRole } = useAuth();
  const [isConfirmDialogOpen,setConfirmDialogOpen] = useState(false)
  const router = useRouter();

  if (!user) return null;

  const isDriver = user.roles?.includes('driver');

  const handleRegisterAsDriver = () => {
    setConfirmDialogOpen(true)
  };

  const handleConfirmDriver = () => {
    router.push('/register-driver');
  }
  
  return (
      <div className="max-w-lg mx-auto w-full">
        <div className='md:mt-4'>
          <ProfileHeader role={profileViewRole} />
        </div>
        <div className='mt-4 flex justify-center w-full'>
          <RoleSwithcer role={profileViewRole} onChange={setProfileViewRole} />
        </div>
  
        {profileViewRole === 'conductor' && !isDriver ? (
          <div className="mt-2 space-y-4 w-full flex flex-col items-center">
            <div className="w-full bg-gray-8 border border-gray-2/40 rounded-xl px-4 py-4 flex items-center gap-3">
              <div className="shrink-0 w-12 h-12 rounded-full bg-gray-2 flex items-center justify-center">
                <User size={24} className="text-gray-11" />
              </div>

              <div className="flex flex-col">
                <p className="text-sm font-medium font-inter mb-0.5 text-white">
                  Todavía no sos conductor
                </p>

                <p className="text-xs text-gray-11 font-inter">
                  Registrate para comenzar a publicar viajes y recibir pasajeros.
                </p>
              </div>
            </div>
            <button
              onClick={handleRegisterAsDriver}
              className="
                w-2/3 md:w-1/3 mt-2 text-sm font-medium cursor-pointer 
                text-gray-8 bg-gray-11 px-2 py-1.5 rounded-lg
                hover:bg-white
                "
            >
              Darme de alta
            </button>
          </div>
        ) : (
          <ProfileOptions
            role={profileViewRole === 'conductor' ? 'driver' : 'passenger'}
            logout={logout}
          />
        )}

        <AlertDialog
          isOpen={isConfirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          onConfirm={handleConfirmDriver}
          type="info"
          title="Convertite en conductor"
          description="Estás por iniciar el registro como conductor. Para completar la verificación, vas a necesitar tener tu licencia de conducir a mano para sacarle fotos."
          confirmText="Continuar"
          cancelText="Más tarde"
        />
      </div>
    
  );
}