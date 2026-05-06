
type Role = 'user' | 'driver' | 'admin';

export const ROUTE_PERMISSIONS: { 
  path: string; 
  roles: Role[] | 'all';
  excludeRoles?: Role[]; 
}[] = [
  { path: '/home', roles: 'all' },

  { path: '/search', roles: 'all' },
  { path: '/search/results', roles: 'all' },

  { path: '/profile', roles: 'all' },
  { path: '/profile/details', roles: 'all' },
  { path: '/profile/driver', roles: ['driver'] },

  { path: '/register-driver', roles: ['user'], excludeRoles: ['driver'] },

  { path: '/settings', roles: 'all' },
  { path: '/account', roles: 'all' },
  { path: '/account/update-email', roles: 'all' },
  { path: '/account/update-password', roles: 'all' },
  { path: '/security', roles: 'all' },

  { path: '/email-change', roles: 'all' },
  { path: '/password-update', roles: 'all' },

  { path: '/vehicle', roles: ['driver'] },
  { path: '/vehicle/new', roles: ['driver'] },
  { path: '/vehicle/edit', roles: ['driver'] },

  { path: '/current-trip', roles: ['driver'] },
  { path: '/debt', roles: 'all' },

  { path: '/trip/new', roles: ['driver'] },
  { path: '/trip/details', roles: 'all' },
  { path: '/trip/edit', roles: ['driver'] },
  { path: '/trips', roles: 'all' },

  { path: '/driver-review/trip', roles: 'all' },
  { path: '/passenger-review/trip', roles: 'all' },
  { path: '/reviews/driver', roles: 'all' },
  { path: '/reviews/from-me', roles: 'all' },
  { path: '/reviews/to-me', roles: 'all' },

  { path: '/reservations/passenger', roles: 'all' },
  { path: '/reservations', roles: ['driver'] },

  { path: '/account/reviews', roles: 'all' },

  { path: '/activity/passenger', roles: 'all' },
  { path: '/activity/passenger', roles: ['driver'] },

  { path: '/admin', roles: ['admin'] },
];