import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth, googleProvider } from "../lib/firebase";
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth";

interface User {
  uid: string;
  name: string;
  email: string;
  photoUrl?: string;
}

interface AuthContextType {
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>; // NEW
  isLoginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  authLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || "User",
          email: firebaseUser.email || "",
          photoUrl: firebaseUser.photoURL || "",
        });
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // NEW: Function to get the secure token
  const getToken = async () => {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    return null;
  };

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setLoginModalOpen(false);
    } catch (error) {
      console.error("Google Sign-In Error", error);
      alert("Failed to sign in with Google.");
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Sign Out Error", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, getToken, isLoginModalOpen, setLoginModalOpen, authLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}