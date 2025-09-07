import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "../services/api";
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@phosphor-icons/react";

const getStatusBadge = (status) => {
  switch (status) {
    case "pending":
      return "badge-warning";
    case "in-progress":
      return "badge-info";
    case "completed":
      return "badge-success";
    case "cancelled":
      return "badge-error";
    default:
      return "badge-ghost";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "pending":
      return <ClockIcon className="h-5 w-5 text-warning" />;
    case "in-progress":
      return <ArrowPathIcon className="h-5 w-5 text-info" />;
    case "completed":
      return <CheckCircleIcon className="h-5 w-5 text-success" />;
    case "cancelled":
      return <XCircleIcon className="h-5 w-5 text-error" />;
    default:
      return null;
  }
};

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: orders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: adminAPI.getAllOrders,
  });

  const allOrders = orders?.data?.data || [];
  console.log("all orders: ", allOrders);

  const filteredOrders = allOrders.filter((order) => {
    const matchesSearch =
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading orders: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-base-content">
            Orders
          </h1>
          <p className="text-base-content/60 mt-1 sm:mt-2">
            Manage all customer orders ({allOrders.length} total)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="form-control flex-1">
          <div className="input-group flex gap-1">
            <input
              type="text"
              placeholder="Search orders, customers..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-square">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Status Filter */}
        <select
          className="select select-bordered w-full sm:max-w-xs"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders List for Mobile */}
      <div className="sm:hidden space-y-4">
        {filteredOrders?.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order._id} className="card bg-base-100 shadow-md">
              <div className="card-body p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-mono text-xs text-base-content/60">
                      #{order.orderId.slice(-8)}
                    </div>
                    <div className="font-bold">
                      {order.user?.username || "Unknown"}
                    </div>
                    <div className="text-sm text-base-content/70">
                      {order.garment || "Unknown Product"}
                    </div>
                  </div>
                  <div className={`badge ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </div>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <div className="text-lg font-semibold">
                    ₦{order.totalCost?.toLocaleString() || "0"}
                  </div>
                  <div className="text-xs text-base-content/60">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <ShoppingBagIcon className="h-12 w-12 mx-auto text-base-content/40 mb-2" />
            <p className="text-base-content/60">No orders found</p>
          </div>
        )}
      </div>

      {/* Orders Table for Desktop */}
      <div className="hidden sm:block card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Products</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders?.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <div className="font-mono text-sm">
                          #{order.orderId.slice(-8)}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="avatar placeholder">
                            <div className="bg-neutral text-neutral-content rounded-full w-8">
                              <span className="text-xs">
                                {order.user?.username
                                  ?.charAt(0)
                                  .toUpperCase() || "?"}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">
                              {order.user?.username || "Unknown"}
                            </div>
                            <div className="text-sm opacity-50">
                              {order.user?.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="max-w-xs">
                          {order.garment.length > 0 ? (
                            <div className="text-sm">
                              {order.garment || "Unknown Product"}
                            </div>
                          ) : (
                            <span className="text-base-content/50">
                              No items
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold">
                          ₦{order.totalCost?.toLocaleString() || "0"}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <span
                            className={`badge ${getStatusBadge(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-base-content/50">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td>
                        <div className="dropdown dropdown-end">
                          <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-ghost btn-sm"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 5v.01M12 12v.01M12 19v.01"
                              />
                            </svg>
                          </div>
                          <ul
                            tabIndex={0}
                            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                          >
                            <li>
                              <a>View Details</a>
                            </li>
                            <li>
                              <a>Update Status</a>
                            </li>
                            <li>
                              <a>Send Update</a>
                            </li>
                            <li>
                              <a className="text-error">Cancel Order</a>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-8">
                      <ShoppingBagIcon className="h-12 w-12 mx-auto text-base-content/40 mb-2" />
                      <p className="text-base-content/60">
                        {searchTerm || statusFilter !== "all"
                          ? "No orders found matching your filters"
                          : "No orders found"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat bg-base-100 shadow-lg rounded-lg p-4">
          <div className="stat-title text-xs sm:text-sm">Total Orders</div>
          <div className="stat-value text-primary text-xl sm:text-2xl">
            {allOrders.length}
          </div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg p-4">
          <div className="stat-title text-xs sm:text-sm">Pending</div>
          <div className="stat-value text-warning text-xl sm:text-2xl">
            {allOrders.filter((order) => order.status === "pending").length}
          </div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg p-4">
          <div className="stat-title text-xs sm:text-sm">Completed</div>
          <div className="stat-value text-success text-xl sm:text-2xl">
            {allOrders.filter((order) => order.status === "completed").length}
          </div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg p-4">
          <div className="stat-title text-xs sm:text-sm">Total Revenue</div>
          <div className="stat-value text-info text-xl sm:text-2xl">
            ₦
            {allOrders
              .filter((order) => order.status === "completed")
              .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
              .toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
