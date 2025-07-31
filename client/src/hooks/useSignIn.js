import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

export default function useSignIn() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (loginData) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/login`,
        loginData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["auth"] });

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
