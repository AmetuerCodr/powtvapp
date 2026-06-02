import {
  createContext,
  useContext,
  useState,
  useEffect,
  type PropsWithChildren,
} from "react";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "powtv.session";

type AuthState = {
  session: string | null;
  isLoading: boolean;
  logIn: (email: string, password: string) => void;
  signUp: (name: string, email: string, password: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function useSession() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useSession must be used within <SessionProvider>");
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  // TODO(auth): replace in-memory state with real token storage
  // (expo-secure-store) + async restore on boot. Flip isLoading while
  // restoring so the splash screen can stay up.
  const [session, setSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore token from secure storage on app start.
  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(TOKEN_KEY);
        if (saved) setSession(saved);
      } catch (e) {
        console.warn("session restore failed", e);
      } finally {
        setIsLoading(false); // splash can drop, guard can decide
      }
    })();
  }, []);

  // const logIn = (token: string = "dev-session") => setSession(token);
  // const signOut = () => setSession(null);

  const logIn = () => {
    setSession("my_session");
    setIsLoading(false);
  };

  const signUp = () => {
    setSession("my_session");
    setIsLoading(false);
  };

  const signOut = () => {
    setSession("");
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{ session, isLoading, logIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
