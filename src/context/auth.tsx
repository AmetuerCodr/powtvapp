import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { AppState } from "react-native";
import * as Linking from "expo-linking";
import { AuthError, type Session } from "@supabase/supabase-js";
import { supabase } from "../../utils/supabase";

// Where Supabase sends users back to after they tap the email link.
// Dev (dev-client): powtv://...  |  Prod: powtv://
// Log it once and paste the value into Supabase -> Auth -> URL Configuration
// -> Redirect URLs (allow-list).
export const redirectTo = Linking.createURL("/");

// Tokens arrive in the URL fragment (#access_token=...&refresh_token=...).
function paramsFromUrl(url: string): Record<string, string> {
  const frag = url.includes("#")
    ? url.split("#")[1]
    : (url.split("?")[1] ?? "");
  return Object.fromEntries(
    frag
      .split("&")
      .filter(Boolean)
      .map((kv) => {
        const [k, v = ""] = kv.split("=");
        return [decodeURIComponent(k), decodeURIComponent(v)];
      }),
  );
}

// Pull tokens out of an incoming deep link and hand them to Supabase.
async function createSessionFromUrl(url: string) {
  const { access_token, refresh_token, error_description } = paramsFromUrl(url);
  if (error_description) throw new Error(error_description);
  if (!access_token || !refresh_token) return; // not an auth link, ignore

  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
}

type AuthState = {
  session: Session | null;
  isLoading: boolean;
  errorMessage: string | null;
  logIn: (email: string, password: string) => Promise<void>;
  signUp: (firstName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void | AuthError>;
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
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true while restoring on boot
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Restore any saved session on boot, then subscribe to all future
  //    auth changes (login, logout, token refresh, deep-link setSession).
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
      setErrorMessage(null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // 2. Handle the email-confirmation deep link (cold start + while running).
  const url = Linking.useURL();
  useEffect(() => {
    if (url) {
      createSessionFromUrl(url).catch((e) =>
        setErrorMessage("an error occured"),
      );
    }
  }, [url]);

  // 3. Keep tokens fresh only while the app is foregrounded (Supabase RN guide).
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });
    return () => sub.remove();
  }, []);

  const logIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error; // caller (login screen) shows the message
    setErrorMessage("cannot log in right now. please try again later.");
    // success -> onAuthStateChange fires -> session set -> guard flips
  };

  const signUp = async (firstName: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: { first_name: firstName },
      },
    });
    if (error) throw error;
    setErrorMessage("cannot sign up right now, please try again later");
    // If "Confirm email" is ON, no session yet -> caller routes to /verify.
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      setErrorMessage("cannot sign out right now, please try again later");
    }
  };

  return (
    <AuthContext.Provider
      value={{ session, errorMessage, isLoading, logIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
