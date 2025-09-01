import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useUiStore } from "../store/uiStore";
import apiClient from "../utils/axiosConfig";

export default function useSignIn() {
  const queryClient = useQueryClient();
  const { setIsLoggedIn, setUser } = useUiStore();

  const mutation = useMutation({
    mutationFn: async (loginData) => {
      const response = await apiClient.post("/api/users/login", loginData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["auth"] });

      // Update UI state
      setIsLoggedIn(true);
      setUser(data.user);

      // Set auth provider for local login
      const { setAuthProvider } = useUiStore.getState();
      setAuthProvider("local");

      // Save user data to localStorage for persistence across page reloads
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("User data set in UI store:", data.user);

      // Show success toast
      toast.success(`Welcome back, ${data.user?.firstName || "User"}!`);
      console.log("Sign in successful:", data);
    },
    onError: (error) => {
      console.error("Sign in failed:", error);

      // Handle specific error messages
      const errorMessage = error.response?.data?.message || error.message;
      const errorCode = error.response?.data?.code;

      if (errorCode === "EMAIL_NOT_VERIFIED") {
        toast.error("Please verify your email address before logging in");
      } else if (
        errorMessage?.includes("Invalid credentials") ||
        errorMessage?.includes("User not found")
      ) {
        toast.error("Invalid email or password");
      } else if (errorMessage?.includes("Account not verified")) {
        toast.error("Please verify your email before logging in");
      } else if (errorMessage?.includes("Account locked")) {
        toast.error("Account temporarily locked. Please try again later");
      } else {
        toast.error(errorMessage || "Login failed. Please try again.");
      }
    },
  });

  return {
    // Mutation function
    signIn: mutation.mutateAsync,

    // Status booleans
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    isIdle: mutation.isIdle,

    // Data and error
    data: mutation.data,
    error: mutation.error,

    // Reset function
    reset: mutation.reset,

    // Additional mutation properties
    status: mutation.status,
    failureCount: mutation.failureCount,
    failureReason: mutation.failureReason,
  };
}
