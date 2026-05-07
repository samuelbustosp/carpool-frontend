
import DriverProfileDetails from '@/modules/profile/components/driver/DriverProfileDetails';
import UserDetails from '@/modules/profile/components/driver/UserDetails';
import { ProfileHeader } from '@/modules/profile/components/ProfileHeader';

export default function ProfileDetailsPage() {
  return (
    <div className='max-w-lg mx-auto w-full'>
      <div className='flex flex-col gap-4'>
        <div className='flex items-start bg-gray-8 border border-gray-7 rounded-xl px-2 py-4'>
          <ProfileHeader />
        </div>
        <UserDetails/>
        <DriverProfileDetails/>
      </div>
    </div>
  );
}
