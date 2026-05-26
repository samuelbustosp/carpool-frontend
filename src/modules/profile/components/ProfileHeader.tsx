'use client'
import { R2_PUBLIC_PREFIX } from '@/constants/imagesR2';
import { useAuth } from '@/contexts/authContext';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';

interface ProfileHeaderProps{
  role?: string
}

export function ProfileHeader({role}:ProfileHeaderProps) {

  const { user, prevImage, imageLoading, loading, fetchFullUser } = useAuth();
  const imageToShow = prevImage || user?.profileImage;

  useEffect(() => {
    if (role) {
      fetchFullUser();
    }
  }, [role]);

  
  return (
    <div className="flex items-top justify-center gap-4 px-4">

      <div className="relative w-20 h-20 rounded-full overflow-hidden">
        
        {/* Skeleton */}
        {imageLoading && (
          <div className="absolute inset-0 animate-pulse bg-gray-2" />
        )}

        <Image
          src={imageToShow || `${R2_PUBLIC_PREFIX}/default-profile.png`}
          alt="Foto de perfil"
          fill
          className={`object-cover transition-opacity duration-300 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </div>

      {role ?
        <div>
          <h2 className="text-xl font-semibold text-gray-2 mt-2 dark:text-gray-1">
            {user?.username}
          </h2>
          
          <p className="text-sm inline-flex items-center gap-1 bg-gray-2 text-gray-1/75 rounded px-2">
            <span>
              <Star size={12} fill="currentColor" />
            </span>
            {role == 'conductor' ? (user?.driverRating ? user.driverRating.toFixed(1) : "0") : user?.passengerRating.toFixed(1)}
          </p> 
          
        </div>
      :
        loading ? 
        <div>
          <div className='bg-gray-2 h-5 w-36 rounded mt-2.5 animate-pulse'></div> 
          <div className='bg-gray-2 h-4.5 w-24 rounded mt-2 animate-pulse'></div> 
        </div>
          
        :
          <div>
              <h2 className="text-xl font-semibold text-gray-2 mt-2 dark:text-gray-1">
                {user?.name} {user?.lastname} 
              </h2>
              <p className="text-sm inline-flex items-center gap-1 bg-gray-2 text-gray-1/75 rounded px-2">
                @{user?.username}
              </p> 
          </div>
        }
          
          

      
    </div>
  );
}