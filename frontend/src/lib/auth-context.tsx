import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AuthService, type User, type RegisterDto, type LoginDto } from "@/services/auth.service";
import { LandlordService, type LandlordProfile } from "@/services/landlord.service";

interface AuthContextValue {
  user: User | null;
  landlordProfile: LandlordProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; user?: User }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [landlordProfile, setLandlordProfile] = useState<LandlordProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      setUser(null);
      setLandlordProfile(null);
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch user profile
      const me = await AuthService.getMe();
      setUser(me);

      // 2. If user is landlord, fetch landlord profile status
      if (me.roles.includes("LANDLORD")) {
        try {
          const profile = await LandlordService.getMe();
          setLandlordProfile(profile);
        } catch {
          setLandlordProfile(null);
        }
      } else {
        setLandlordProfile(null);
      }
    } catch (err: any) {
      // Only clear token and force logout if the server explicitly returned 401 Unauthorized.
      // For network connection errors or server 5xx reboots, preserve credentials.
      if (err.response?.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
        }
        setUser(null);
        setLandlordProfile(null);
      } else {
        console.warn("Preserving access token during temporary connection glitch:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const me = await AuthService.getMe();
      setUser(me);
      if (me.roles.includes("LANDLORD")) {
        const profile = await LandlordService.getMe();
        setLandlordProfile(profile);
      } else {
        setLandlordProfile(null);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchSession();

    // Listen to automatic axios logouts on expired refresh tokens
    const handleLogout = () => {
      setUser(null);
      setLandlordProfile(null);
      setLoading(false);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("auth-logout", handleLogout);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("auth-logout", handleLogout);
      }
    };
  }, []);

  const value: AuthContextValue = {
    user,
    landlordProfile,
    loading,
    refreshProfile,
    signIn: async (email, password) => {
      try {
        const res = await AuthService.login({ email, password });
        setUser(res.user);
        
        if (res.user.roles.includes("LANDLORD")) {
          try {
            const profile = await LandlordService.getMe();
            setLandlordProfile(profile);
          } catch {
            setLandlordProfile(null);
          }
        } else {
          setLandlordProfile(null);
        }
        
        return { error: null, user: res.user };
      } catch (err: any) {
        return { error: err.response?.data?.message ? new Error(err.response.data.message) : err, user: undefined };
      }
    },
    signUp: async (email, password, fullName) => {
      try {
        // Register the user
        await AuthService.register({ email, password, fullName });
        // Automatically log them in after registration
        const res = await AuthService.login({ email, password });
        setUser(res.user);
        setLandlordProfile(null);
        return { error: null };
      } catch (err: any) {
        return { error: err.response?.data?.message ? new Error(err.response.data.message) : err };
      }
    },
    signOut: async () => {
      try {
        await AuthService.logout();
      } catch {
        // Ignore errors on logout
      } finally {
        setUser(null);
        setLandlordProfile(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
        }
      }
    },
    signInWithGoogle: async () => {
      // Non-supported for now, or alert
      console.warn("Google authentication is disabled. Please register with email.");
    },
    resetPassword: async (email) => {
      try {
        await AuthService.forgotPassword(email);
        return { error: null };
      } catch (err: any) {
        return { error: err.response?.data?.message ? new Error(err.response.data.message) : err };
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
