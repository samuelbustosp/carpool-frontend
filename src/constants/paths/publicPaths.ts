export const PUBLIC_PATHS = {
  pages: [
    '/',
    '/login',
    '/register',
    '/email-verify',
    '/email-verified',
    '/send-change-password-email',
    '/password-change',
    '/complete-profile',
    '/unlock-account',
    '/password-change/send-email',
  ],
  api: [
    '/api/login',
    '/api/auth-google',
    '/api/auth/refresh',
    '/api/users',
    '/api/users/activate-account',
    '/api/users/complete-registration',
    '/api/users/resend-activation',
    '/api/password-change/send-email',
    '/api/password-change',
    '/api/users/unlock-account',
  ],
} as const;

