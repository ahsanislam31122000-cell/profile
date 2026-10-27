import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminUserInfo {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  token: string | null;
  adminUser: AdminUserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: AdminUserInfo) => void;
  logout: () => void;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'portfolio_admin_jwt';
const USER_KEY = 'portfolio_admin_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  });

  const [adminUser, setAdminUser] = useState<AdminUserInfo | null>(() => {
    const stored = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Verify token validity on boot
    const verifyToken = async () => {
      const activeToken = token;
      if (!activeToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setAdminUser(data.user);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Failed to verify token:', err);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = (newToken: string, user: AdminUserInfo) => {
    setToken(newToken);
    setAdminUser(user);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setAdminUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  };

  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      logout();
    }
    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        adminUser,
        isAuthenticated: !!token && !!adminUser,
        isLoading,
        login,
        logout,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
