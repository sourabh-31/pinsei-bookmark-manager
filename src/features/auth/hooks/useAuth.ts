import { useMutation } from "@tanstack/react-query";
import {
  signIn,
  signInAnonymously,
  signInWithGoogle,
  signOut,
  signUp,
} from "@/lib/api";

export { useSession } from "@/features/auth/store/sessionContext";

type SignUpInput = {
  fullName: string;
  email: string;
  password: string;
};

type SignInInput = {
  email: string;
  password: string;
};

export function useSignUp() {
  return useMutation({
    mutationFn: ({ fullName, email, password }: SignUpInput) =>
      signUp(fullName, email, password),
  });
}

export function useSignIn() {
  return useMutation({
    mutationFn: ({ email, password }: SignInInput) => signIn(email, password),
  });
}

export function useAnonymousSignIn() {
  return useMutation({
    mutationFn: signInAnonymously,
  });
}

export function useGoogleSignIn() {
  return useMutation({
    mutationFn: signInWithGoogle,
  });
}

export function useSignOut() {
  return useMutation({
    mutationFn: signOut,
  });
}
