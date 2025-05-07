import { useMutation, useQuery } from "@tanstack/react-query";
import {
  authService,
  type LoginCredentials,
  type RegisterCredentials,
} from "@/services/auth";
import { useRouter } from "next/navigation";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: () => {
      router.push("/dashboard"); // or wherever you want to redirect after login
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) =>
      authService.register(credentials),
    onSuccess: () => {
      router.push("/dashboard"); // or wherever you want to redirect after registration
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () => authService.getCurrentUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useLogout() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      authService.logout();
      router.push("/login");
    },
  });

  return mutation;
}
