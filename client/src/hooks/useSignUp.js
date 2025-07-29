import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

export default function useSignUp() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (userData) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/signup`,
        userData,
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
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Registered successfully");
      console.log("Sign up successful:", data);
    },
    onError: (error) => {
      console.error("Sign up failed:", error);
      toast.error("Registration not successful!!!");
    },
  });

  return {
    // Mutation function
    signUp: mutation.mutate,

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
