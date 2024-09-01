import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '../Firebase/firebaseConfig';

type AuthContextType = {
  user: User | null;
};

// inizializzo il contesto
const AuthContext = createContext<AuthContextType>({ user: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const auth = getAuth(app);

  useEffect(() => {
    // quando cambia lo stato di autenticazione 
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    // funzione pulizia
    return () => unsubscribe();
  }, [auth]);

  return (
    // fornisco il contesto di autenticazione ai componenti figli
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};

// hook per accedere al contesto di autenticazione
export function useAuth() {
  return useContext(AuthContext);
}