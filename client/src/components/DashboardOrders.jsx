// If any bug is noticed in this component?, the icons should be checked first.

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  EyeIcon,
  // PencilIcon,
  TrashIcon,
  // CalendarIcon,
  // CurrencyDollarIcon,
  MapPinIcon,
  PackageIcon,
  SparkleIcon,
  // ArrowPathIcon,
  FunnelIcon,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { userAPI, dashboardAPI } from "../services/api";
import SEO from "./SEO";

export default function DashboardOrders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("active");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("orderDate");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fetch user orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["userOrders", { filterStatus, sortBy, sortOrder }],
    queryFn: () =>
      dashboardAPI.getUserOrders({
        status: filterStatus !== "all" ? filterStatus : undefined,
        sortBy,
        sortOrder,
        limit: 100,
      }),
    select: (response) => response.data?.data || [],
  });

  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: (orderId) => userAPI.deleteOrder(orderId),
    onSuccess: () => {
      toast.success("Order cancelled successfully!");
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
      setShowOrderModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    },
  });

  // Process and categorize orders
  const { activeOrders, orderHistory, trackingData } = useMemo(() => {
    if (!ordersData)
      return { activeOrders: [], orderHistory: [], trackingData: [] };

    const active = ordersData.filter((order) =>
      ["Pending", "In Progress", "Ready"].includes(order.status)
    );

    const history = ordersData.filter((order) =>
      ["Delivered", "Cancelled", "Failed"].includes(order.status)
    );

    const tracking = ordersData
      .filter((order) =>
        ["Pending", "In Progress", "Ready", "Delivered"].includes(order.status)
      )
      .map((order) => ({
        ...order,
        trackingSteps: getTrackingSteps(
          order.status,
          order.orderDate || order.createdAt,
          order.deliveryDate
        ),
      }));

    return {
      activeOrders: active,
      orderHistory: history,
      trackingData: tracking,
    };
  }, [ordersData]);

  // Get tracking steps based on order status
  const getTrackingSteps = (status, orderDate, deliveryDate) => {
    const steps = [
      {
        id: "pending",
        title: "Order Placed",
        description: "Your order has been received and is being processed",
        icon: ShoppingBagIcon,
        date: orderDate,
        completed: true,
      },
      {
        id: "in-progress",
        title: "In Production",
        description: "Your garment is being tailored by our skilled craftsmen",
        icon: SparkleIcon,
        date: null,
        completed: ["In Progress", "Ready", "Delivered"].includes(status),
      },
      {
        id: "ready",
        title: "Ready for Delivery",
        description: "Your order is complete and ready for pickup/delivery",
        icon: PackageIcon,
        date: null,
        completed: ["Ready", "Delivered"].includes(status),
      },
      {
        id: "delivered",
        title: "Delivered",
        description: "Your order has been successfully delivered",
        icon: CheckCircleIcon,
        date: status === "Delivered" ? deliveryDate : null,
        completed: status === "Delivered",
      },
    ];

    return steps;
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusStyles = {
      Pending: "badge-warning",
      "In Progress": "badge-info",
      Ready: "badge-success",
      Delivered: "badge-success",
      Cancelled: "badge-error",
      Failed: "badge-error",
    };

    return `badge ${statusStyles[status] || "badge-ghost"}`;
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      Pending: ClockIcon,
      "In Progress": SparkleIcon,
      Ready: PackageIcon,
      Delivered: CheckCircleIcon,
      Cancelled: XCircleIcon,
      Failed: XCircleIcon,
    };

    return icons[status] || ClockIcon;
  };

  // Handle order details view
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  // Handle order cancellation
  const handleCancelOrder = (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  // Order Card Component
  const OrderCard = ({ order, showActions = false }) => {
    const StatusIcon = getStatusIcon(order.status);

    return (
      <div className="card bg-gradient-to-br from-base-100 to-base-50 shadow-xl border border-base-300/50 hover:shadow-2xl transition-all duration-300 group">
        <div className="card-body p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-xl">
                <StatusIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="card-title text-lg">
                  {order.garment || "Custom Garment"}
                </h3>
                <p className="text-sm text-base-content/60">
                  Order #{order._id?.slice(-8) || "N/A"}
                </p>
              </div>
            </div>
            <div className={`${getStatusBadge(order.status)} badge-lg`}>
              {order.status}
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CurrencyDollarIcon className="w-4 h-4 text-accent" />
                <span className="font-medium">
                  ₦{(order.totalCost || order.cost)?.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-base-content/70">
                <PackageIcon className="w-4 h-4" />
                <span>Qty: {order.quantity}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-base-content/70">
                <CalendarIcon className="w-4 h-4" />
                <span>
                  {new Date(
                    order.orderDate || order.createdAt
                  ).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-base-content/70">
                <TruckIcon className="w-4 h-4" />
                <span>{new Date(order.deliveryDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Fabric & Color */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="badge badge-outline gap-2">
              <div
                className="w-3 h-3 rounded-full border"
                style={{ backgroundColor: order.selectedColor?.hex || "#gray" }}
              ></div>
              {order.selectedColor?.name || "Default"}
            </div>
            <div className="badge badge-outline">
              {order.selectedFabric?.name || "Cotton"}
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 mt-4">
              <button
                // onClick={() => viewOrderDetails(order)}
                className="btn btn-outline btn-sm flex-1 gap-2"
              >
                <EyeIcon className="w-4 h-4" />
                View Details
              </button>
              {["Pending"].includes(order.status) && (
                <button
                  onClick={() => handleCancelOrder(order._id)}
                  className="btn btn-error btn-outline btn-sm gap-2"
                  disabled={deleteOrderMutation.isPending}
                >
                  <TrashIcon className="w-4 h-4" />
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Tracking Step Component
  const TrackingStep = ({ step, isLast, isActive }) => {
    const IconComponent = step.icon;

    return (
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center">
          <div
            className={`p-3 rounded-full ${
              step.completed
                ? "bg-success text-success-content"
                : isActive
                ? "bg-primary text-primary-content"
                : "bg-base-300 text-base-content/50"
            } transition-all duration-300`}
          >
            <IconComponent className="w-5 h-5" />
          </div>
          {!isLast && (
            <div
              className={`w-0.5 h-16 mt-2 ${
                step.completed ? "bg-success" : "bg-base-300"
              } transition-all duration-300`}
            />
          )}
        </div>
        <div className="flex-1 pb-8">
          <h4
            className={`font-semibold ${
              step.completed
                ? "text-success"
                : isActive
                ? "text-primary"
                : "text-base-content/70"
            }`}
          >
            {step.title}
          </h4>
          <p className="text-sm text-base-content/60 mt-1">
            {step.description}
          </p>
          {step.date && (
            <p className="text-xs text-base-content/50 mt-2">
              {new Date(step.date).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    );
  };

  if (ordersLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="card bg-base-100 shadow-xl max-w-md">
          <div className="card-body text-center">
            <XCircleIcon className="w-16 h-16 text-error mx-auto mb-4" />
            <h3 className="card-title justify-center">Failed to Load Orders</h3>
            <p className="text-base-content/70">
              {ordersError.message || "Something went wrong"}
            </p>
            <button
              onClick={() => refetchOrders()}
              className="btn btn-primary gap-2 mt-4"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 p-4 md:p-6 lg:p-8">
      <SEO
        title="My Orders - FashionSmith"
        description="View and manage your custom clothing orders, track delivery status and order history."
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
            My Orders
          </h1>
          <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
            Track your custom garments from order to delivery
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs tabs-boxed bg-base-200/80 backdrop-blur-sm mb-8 p-2 shadow-lg">
        <button
          className={`tab tab-lg flex-1 gap-2 ${
            activeTab === "active" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("active")}
        >
          <ShoppingBagIcon className="w-5 h-5" />
          Active Orders ({activeOrders.length})
        </button>
        <button
          className={`tab tab-lg flex-1 gap-2 ${
            activeTab === "tracking" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("tracking")}
        >
          <TruckIcon className="w-5 h-5" />
          Order Tracking
        </button>
        <button
          className={`tab tab-lg flex-1 gap-2 ${
            activeTab === "history" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("history")}
        >
          <ClockIcon className="w-5 h-5" />
          Order History ({orderHistory.length})
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="form-control">
          <select
            className="select select-bordered bg-base-100/80 backdrop-blur-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Ready">Ready</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="form-control">
          <select
            className="select select-bordered bg-base-100/80 backdrop-blur-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="orderDate">Order Date</option>
            <option value="deliveryDate">Delivery Date</option>
            <option value="totalCost">Total Cost</option>
          </select>
        </div>
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="btn btn-outline gap-2"
        >
          <FunnelIcon className="w-4 h-4" />
          {sortOrder === "asc" ? "Ascending" : "Descending"}
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Active Orders Tab */}
        {activeTab === "active" && (
          <div>
            {activeOrders.length === 0 ? (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center py-16">
                  <ShoppingBagIcon className="w-24 h-24 text-base-content/30 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4">No Active Orders</h3>
                  <p className="text-base-content/70 mb-6">
                    You don't have any active orders at the moment.
                  </p>
                  <button
                    className="btn btn-primary gap-2"
                    onClick={() => navigate("/gallery")}
                  >
                    <SparkleIcon className="w-5 h-5" />
                    Browse Products
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {activeOrders.map((order) => (
                  <OrderCard key={order._id} order={order} showActions={true} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Order Tracking Tab */}
        {activeTab === "tracking" && (
          <div>
            {trackingData.length === 0 ? (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center py-16">
                  <TruckIcon className="w-24 h-24 text-base-content/30 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4">
                    No Orders to Track
                  </h3>
                  <p className="text-base-content/70">
                    You don't have any orders to track at the moment.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {trackingData.map((order) => (
                  <div
                    key={order._id}
                    className="card bg-gradient-to-br from-base-100 to-base-50 shadow-xl border border-base-300/50"
                  >
                    <div className="card-body p-8">
                      {/* Order Header */}
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">
                            {order.garment || "Custom Garment"}
                          </h3>
                          <p className="text-base-content/60">
                            Order #{order._id?.slice(-8) || "N/A"} • Placed on{" "}
                            {new Date(
                              order.orderDate || order.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div
                          className={`${getStatusBadge(
                            order.status
                          )} badge-lg mt-4 lg:mt-0`}
                        >
                          {order.status}
                        </div>
                      </div>

                      {/* Tracking Steps */}
                      <div className="relative">
                        {order.trackingSteps.map((step, index) => {
                          const isLast =
                            index === order.trackingSteps.length - 1;
                          const isActive =
                            !step.completed &&
                            order.trackingSteps[index - 1]?.completed;

                          return (
                            <TrackingStep
                              key={step.id}
                              step={step}
                              isLast={isLast}
                              isActive={isActive}
                            />
                          );
                        })}
                      </div>

                      {/* Delivery Info */}
                      <div className="flex items-center gap-2 mt-6 p-4 bg-base-200/50 rounded-xl">
                        <MapPinIcon className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">Delivery Address</p>
                          <p className="text-sm text-base-content/70">
                            {order.deliveryAddress}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Order History Tab */}
        {activeTab === "history" && (
          <div>
            {orderHistory.length === 0 ? (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center py-16">
                  <ClockIcon className="w-24 h-24 text-base-content/30 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4">No Order History</h3>
                  <p className="text-base-content/70">
                    Your completed orders will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {orderHistory.map((order) => (
                  <div
                    key={order._id}
                    className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="card-body p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Order Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              {order.garment || "Custom Garment"}
                            </h3>
                            <div
                              className={`${getStatusBadge(
                                order.status
                              )} badge-sm`}
                            >
                              {order.status}
                            </div>
                          </div>
                          <p className="text-sm text-base-content/60 mb-2">
                            Order #{order._id?.slice(-8) || "N/A"}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm text-base-content/70">
                            <span>
                              ₦
                              {(
                                order.totalCost || order.cost
                              )?.toLocaleString()}
                            </span>
                            <span>Qty: {order.quantity}</span>
                            <span>
                              {new Date(
                                order.orderDate || order.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewOrderDetails(order)}
                            className="btn btn-outline btn-sm gap-2"
                          >
                            <EyeIcon className="w-4 h-4" />
                            View Details
                          </button>
                          {order.status === "Delivered" && (
                            <button className="btn btn-primary btn-sm gap-2">
                              <SparkleIcon className="w-4 h-4" />
                              Reorder
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card bg-gradient-to-br from-base-100 to-base-200 w-full max-w-2xl shadow-2xl border border-primary/20 max-h-[90vh] overflow-y-auto">
            <div className="card-body p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-xl">
                    <ShoppingBagIcon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="card-title text-xl">Order Details</h3>
                </div>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="btn btn-ghost btn-sm btn-circle hover:bg-error/20 hover:text-error transition-all duration-300"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Order Information</h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Order ID:</span> #
                          {selectedOrder._id?.slice(-8) || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Garment:</span>{" "}
                          {selectedOrder.garment || "Custom Garment"}
                        </p>
                        <p>
                          <span className="font-medium">Quantity:</span>{" "}
                          {selectedOrder.quantity}
                        </p>
                        <p>
                          <span className="font-medium">Status:</span>
                          <span
                            className={`ml-2 ${getStatusBadge(
                              selectedOrder.status
                            )} badge-sm`}
                          >
                            {selectedOrder.status}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Customization</h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Fabric:</span>{" "}
                          {selectedOrder.selectedFabric?.name || "Cotton"}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Color:</span>
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{
                              backgroundColor:
                                selectedOrder.selectedColor?.hex || "#gray",
                            }}
                          ></div>
                          {selectedOrder.selectedColor?.name || "Default"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Pricing</h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Unit Price:</span> ₦
                          {(
                            selectedOrder.unitPrice || selectedOrder.price
                          )?.toLocaleString()}
                        </p>
                        <p>
                          <span className="font-medium">Fabric Cost:</span> ₦
                          {selectedOrder.selectedFabric?.price?.toLocaleString() ||
                            0}
                        </p>
                        <p>
                          <span className="font-medium">Color Premium:</span> ₦
                          {selectedOrder.selectedColor?.extraPrice?.toLocaleString() ||
                            0}
                        </p>
                        <div className="border-t pt-2 mt-2">
                          <p className="font-bold">
                            <span>Total Cost:</span> ₦
                            {(
                              selectedOrder.totalCost || selectedOrder.cost
                            )?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Delivery</h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Expected Date:</span>{" "}
                          {new Date(
                            selectedOrder.deliveryDate
                          ).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-medium">Address:</span>{" "}
                          {selectedOrder.deliveryAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  {["Pending"].includes(selectedOrder.status) && (
                    <button
                      onClick={() => handleCancelOrder(selectedOrder._id)}
                      className="btn btn-error gap-2"
                      disabled={deleteOrderMutation.isPending}
                    >
                      {deleteOrderMutation.isPending ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        <TrashIcon className="w-5 h-5" />
                      )}
                      Cancel Order
                    </button>
                  )}
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="btn btn-outline flex-1"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
