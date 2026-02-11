'use client'

import { PUBLIC_PATHS } from '@/constants/paths/publicPaths';
import { User } from '@/models/user';
import { LoginData } from '@/modules/auth/schemas/loginSchema';
import { UserDebtResponseDTO } from '@/modules/debt/types/UserDebtResponseDTO';
import { loginUser, authWithGoogle, logoutUser } from '@/services/auth/authService';
import { getUserFile } from '@/services/media/mediaService';
import { useRouter, usePathname } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData & { recaptchaToken?: string }) => Promise<void>;
  logout: () => void;
  debt: UserDebtResponseDTO | null; 
  authGoogle: (idToken: string) => Promise<void>;
  fetchUser: () => Promise<boolean>;
  fetchUserDebt: () => Promise<void>;
  prevImage: string | null;
  setPrevImage: (value: string | null) => void;
  profileViewRole: 'pasajero' | 'conductor';
  setProfileViewRole: (role: 'pasajero' | 'conductor') => void;
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [debt, setDebt] = useState<UserDebtResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [prevImage, setPrevImage] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null); // <--- NUEVO ESTADO
  
  const router = useRouter();
  const pathname = usePathname();
  const [profileViewRole, setProfileViewRole] = useState<'pasajero' | 'conductor'>('pasajero');
  
  const hasRun = useRef(false);

  const publicRoutes = [...PUBLIC_PATHS.pages];
  const isPublicRoute = publicRoutes.some(route =>
    route === '/' ? pathname === '/' : pathname.startsWith(route)
  );

  useEffect(() => {
    if (!debt) return;
    const debtRoutes = ['/debt', '/logout'];
    if (debt.debtUser === true) {
      const isAllowed = debtRoutes.some(route => pathname.startsWith(route));
      if (!isAllowed) router.replace('/debt');
      return;
    }
    if (debt.debtUser === false && pathname.startsWith('/debt')) {
      router.replace('/home');
    }
  }, [debt?.debtUser, pathname]);

  const fetchUser = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/me', { method: 'GET', credentials: 'include' });
      if (res.ok) {
        const response = await res.json();
        if (response.data) {
          setUser({ 
            username: response.data.username,
            roles: response.data.roles,
            id: null, name: null, lastname: null, email: null, dni: null, phone: null, gender: null, status: null, birthDate: null,
           });
          return true;
        }
      }
      setUser(null);
      return false;
    } catch (err) {
      console.error('Error cargando usuario:', err);
      setUser(null);
      return false;
    }
  }, []);

  const fetchUserDebt = useCallback(async () => {
    try {
      const res = await fetch('/api/users/debt', { method: 'GET', credentials: 'include' });
      if (!res.ok) { setDebt(null); return; }
      const response = await res.json();
      if (response.state === 'OK') setDebt(response.data);
      else setDebt(null);
    } catch (err) {
      console.error('Error cargando deuda:', err);
      setDebt(null);
    }
  }, []);

  const fetchFullUser = useCallback(async () => {
    try {
      const res = await fetch("/api/users", { method: "GET", credentials: "include" });
      const response = await res.json();
      if (response.state !== "OK") return;
      setUser(prev => {
        if (!prev) return response.data;
        return { ...prev, ...response.data };
      });
    } catch (err) {
      console.error("Error cargando datos completos:", err);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.id) return;
    fetchFullUser();
  }, [user, fetchFullUser]);

  useEffect(() => {
    if (!user?.id) return;
    const loadImage = async () => {
      try {
        const imgUrl = await getUserFile();
        if (imgUrl?.data) setUser(prev => prev ? { ...prev, profileImage: imgUrl.data } : prev);
      } catch (err) { console.warn("No se pudo cargar la imagen:", err); }
    };
    loadImage();
  }, [user?.id]);

  useEffect(() => {
    const initializeAuth = async () => {
      if (hasRun.current) return;
      hasRun.current = true;
      const hasUser = await fetchUser();
      if (hasUser) await fetchUserDebt();
      setLoading(false);
      if (!hasUser && !isPublicRoute) router.replace('/login');
    };
    initializeAuth();
  }, []);
  
  const login = async (data: LoginData & { recaptchaToken?: string }) => {
    setLoading(true);
    try {
      const result = await loginUser(data);
      const code = result.messages?.[0]; 

      if (code === 'PENDING_VERIFICATION') {
        router.push('/email-verify');
        return;
      }
      if (code === 'PENDING_PROFILE') {
        setUser(null);
        throw new Error(result.messages?.[1]|| 'Error al iniciar sesión');
      }

      if (result.state === "OK") {
        await fetchUser();
        await fetchUserDebt();

        // Guardar el token en el state (Para que el WS lo vea)
        if (result.data?.accessToken) {
            setAccessToken(result.data.accessToken); 
        }

        router.push('/home');
      } else {
        setUser(null);
        throw new Error(result.messages?.[0]|| 'Error al iniciar sesión');
      }
    } catch (error: unknown) {
      let message = "Error desconocido";
      if (error instanceof Error) message = error.message;
      setUser(null);
      throw new Error(message); 
    } finally {
      setLoading(false);
    }
  };

  const authGoogle = async (idToken: string) => {
    setLoading(true);
    try {
      const result = await authWithGoogle(idToken);
      if (result.state === "OK" && result.data) {
        await fetchUser();
        await fetchUserDebt();
        
        // Guardar el token de google tambien
        if (result.data.accessToken) {
             setAccessToken(result.data.accessToken);
        }

        if (result.data.status === 'PENDING_PROFILE') {
          router.push(`/complete-profile?email=${encodeURIComponent(result.data.email)}`);
        } else if (result.data.status === 'ACTIVE') {
          router.push('/home');
        }
      } else {
        setUser(null);
        throw new Error(result.messages?.[0] || 'Error al iniciar sesión con Google');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser(); 
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      router.push('/login');
    }
  };

  const value = {
    user, loading, login, logout, debt, authGoogle, fetchUser, fetchUserDebt,
    prevImage, setPrevImage, profileViewRole, setProfileViewRole,
    accessToken // Exponemos el valor
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}