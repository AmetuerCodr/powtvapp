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
import { supabase } from "@/utils/supabase";

// Where Supabase sends users back to after they tap the email link.
// Dev (dev-client): powtv://...  |  Prod: powtv://
// Log it once and paste the value into Supabase -> Auth -> URL Configuration
// -> Redirect URLs (allow-list).
export const redirectTo = Linking.createURL("/");

// PKCE: the recovery/confirmation link redirects back to the app with a
// single-use ?code=<auth_code>. We exchange that code — paired with the
// code_verifier saved in AsyncStorage when the email was requested — for a
// real session. (No tokens in the fragment, no type=recovery: that's implicit.)
async function createSessionFromUrl(url: string) {
  const { queryParams } = Linking.parse(url);
  const errorDescription = queryParams?.error_description as string | undefined;
  if (errorDescription) throw new Error(errorDescription);

  const code = queryParams?.code as string | undefined;
  if (!code) return; // not an auth link, ignore

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw error;
}

type AuthState = {
  session: Session | null;
  isLoading: boolean;
  // True while a password-recovery deep link is active. The session exists
  // (needed to call updateUser) but the user hasn't proven their identity with
  // a password yet, so the guard must NOT treat them as fully logged in.
  isRecovering: boolean;
  logIn: (email: string, password: string) => Promise<void>;
  signUp: (firstName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void | AuthError>;
  sendForgotPasswordLink: (email: string) => Promise<void | AuthError>;
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
  const [isRecovering, setIsRecovering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Restore any saved session on boot, then subscribe to all future
  //    auth changes (login, logout, token refresh, deep-link setSession).
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // 2. Handle the email-confirmation deep link (cold start + while running).
  const url = Linking.useURL();
  useEffect(() => {
    if (!url) return;
    // PKCE recovery lands on /reset with a ?code (no type=recovery anymore).
    // Exchanging it mints a real session, but we must keep the user in the
    // (auth) group so they actually set a new password (see guard in _layout).
    const { path, queryParams } = Linking.parse(url);
    if (queryParams?.code && path?.includes("reset")) setIsRecovering(true);
    createSessionFromUrl(url).catch((e) =>
      console.warn("deep link error", e),
    );
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
    setIsRecovering(false); // a real password login ends any recovery mode

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

    // If "Confirm email" is ON, no session yet -> caller routes to /verify.
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setIsRecovering(false);
  };

  async function sendForgotPasswordLink(email: string) {
    const redirectUrl = Linking.createURL("/reset");
    console.log("[POWTV] reset redirectTo:", redirectUrl);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) throw error;
  }
  return (
    <AuthContext.Provider
      value={{
        session,
        sendForgotPasswordLink,
        isLoading,
        isRecovering,
        logIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
