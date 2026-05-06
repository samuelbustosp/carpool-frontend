export const HEADER_PATHS = [
  // Nav
  '/home','/search',

  // Trip
  '/trip/edit', '/trip/details',
  '/trip/new',  '/trip',  '/trips',

  // Review
  '/reviews/driver/', '/reviews/from-me',
  '/reviews/to-me', '/account/reviews',
  '/passenger-review/trip/',
  '/account/reviews',

  // Reservation
  '/reservations/passenger',
  '/reservations/',
  '/reservations',

  // Vehicle
  '/vehicle/edit',  '/vehicle/new',
  '/vehicle',

  // Profile
  '/profile/details', '/profile/driver',
  '/profile',

  // Driver
  '/register-driver',
  '/driver-review/trip/',

  // Settings
  '/settings/account/update-password',
  '/settings/account/update-email',
  '/settings/account',
  '/settings/security',
  '/settings',

  // Activity
  '/activity/passenger',
  '/activity/driver',
] as const;

export const HEADER_TITLES: Record<string, string> = {
  '/trips': 'Viajes',
  '/trip/edit': 'Editar viaje',
  '/trip/new': 'Publicar viaje',
  '/trip/details': 'Detalles del viaje',

  '/reviews/driver/':'Reseñas',
  '/passenger-review/trip/':'Reseñar al pasajero',
  '/driver-review/trip/': 'Reseñar al chofer',
  '/reviews/from-me':'Reseñas que has hecho',
  '/reviews/to-me': 'Reseñas que te han hecho',

  '/vehicle/edit': 'Editar Vehículo',
  '/vehicle/new': 'Registrar Vehículo',
  '/vehicle': 'Vehículos',

  '/profile/driver': 'Perfil de conductor',
  '/profile/details': 'Perfil',
  '/profile': 'Perfil de usuario',

  '/register-driver': 'Registrar conductor',

  '/reservations/passenger': 'Tus reservas',
  '/reservations/':'Reservas del viaje', 
  '/reservations':'Viajes',

  '/settings/account/update-password': 'Contraseña',
  '/settings/account/update-email': 'Correo electrónico',
  '/settings/account': 'Cuenta',
  '/settings/security': 'Seguridad',
  '/settings': 'Configuración',

  '/account/reviews': 'Consulta de reseñas',

  '/activity/passenger': 'Actividad como pasajero',
  '/activity/driver': 'Actividad como conductor',
};

export const getMatchingHeaderPath = (pathname: string) => {
  return [...HEADER_PATHS]
    .sort((a, b) => b.length - a.length)
    .find(route => pathname.startsWith(route));
};
