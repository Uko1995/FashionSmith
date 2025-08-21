import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "../services/api";
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";

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

  const filteredOrders = allOrders.filter((order) => {
    const matchesSearch =
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return "badge-success";
      case "cancelled":
        return "badge-error";
      case "in-progress":
        return "badge-info";
      default:
        return "badge-warning";
    }
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Orders</h1>
          <p className="text-base-content/60 mt-2">
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
          className="select select-bordered w-full max-w-xs"
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

      {/* Orders Table */}
      <div className="card bg-base-100 shadow-lg">
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
                          #{order._id.slice(-8)}
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
                          {order.items?.length > 0 ? (
                            <div className="text-sm">
                              {order.items.map((item, index) => (
                                <div key={index} className="truncate">
                                  {item.product?.name || "Unknown Product"} x
                                  {item.quantity}
                                </div>
                              ))}
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
                          ₦{order.totalAmount?.toLocaleString() || "0"}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-title">Total Orders</div>
          <div className="stat-value text-primary">{allOrders.length}</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-title">Pending</div>
          <div className="stat-value text-warning">
            {allOrders.filter((order) => order.status === "pending").length}
          </div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-title">Completed</div>
          <div className="stat-value text-success">
            {allOrders.filter((order) => order.status === "completed").length}
          </div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-title">Total Revenue</div>
          <div className="stat-value text-info">
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
