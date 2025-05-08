import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService, useAuthStore } from "../services/auth";
import type {
  LoginCredentials,
  RegisterCredentials,
  RequestPasswordResetCredentials,
  ResetPasswordCredentials,
} from "../types/auth";

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: RegisterCredentials) =>
      authService.register(credentials),
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

export function useVerifyEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () => authService.getCurrentUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!useAuthStore.getState().token,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(["currentUser"], null);
      queryClient.clear();
    },
  });
}

export function useRequestPasswordReset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: RequestPasswordResetCredentials) =>
      authService.requestPasswordReset(credentials),
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({
      token,
      credentials,
    }: {
      token: string;
      credentials: ResetPasswordCredentials;
    }) => authService.resetPassword(token, credentials),
  });
}

export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: (email: string) => authService.resendVerificationEmail(email),
  });
}
