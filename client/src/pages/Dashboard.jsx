import { useQuery } from "@tanstack/react-query";
import { dashboardAPI } from "../services/api";

export default function Dashboard() {
  // This will trigger an API call that tests authentication
  // and automatically refresh tokens when they expire
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboardOverview"],
    queryFn: dashboardAPI.getOverview,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center">
        <div className="text-error text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold mb-2">Dashboard Error</h3>
        <p className="text-base-content/60 mb-4">
          {error.response?.data?.message || "Failed to load dashboard data"}
        </p>
        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title">Welcome!</h2>
              <p>Your dashboard is ready.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
