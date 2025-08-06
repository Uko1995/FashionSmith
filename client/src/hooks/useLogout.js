import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useUiStore } from "../store/uiStore";
import apiClient from "../utils/axiosConfig";

export default function useLogout() {
  const queryClient = useQueryClient();
  const { setIsLoggedIn, setUser } = useUiStore();

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/api/users/logout', {}, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ["user"] });
      // Update UI state
      setIsLoggedIn(false);
      setUser(null);

      // Show success toast
      toast.success("You have been logged out successfully.");
      console.log("Logout successful");
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage || "Logout failed. Please try again.");
    },
  });

  return {
    logout: mutation.mutateAsync,
    isLoading: mutation.isLoading,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    reset: mutation.reset,
  };
}
