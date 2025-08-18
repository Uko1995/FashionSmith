/* eslint-disable no-unused-vars */
// ensure that there are no unused variables when all the functionalities have
// been tested
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreditCardIcon,
  BankIcon,
  DeviceMobileIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  WarningIcon,
  InfoIcon,
  EyeIcon,
  EyeSlashIcon,
  LockIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  EnvelopeIcon,
  BuildingIcon,
  MapPinIcon,
  FileIcon,
  ReceiptIcon,
  SparkleIcon,
  TruckIcon,
  PackageIcon,
  ClipboardIcon,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { userAPI, dashboardAPI } from "../services/api";
import { usePaystack } from "../hooks/usePaystack";
import SEO from "./SEO";

export default function DashboardPayment() {
  const queryClient = useQueryClient();

  // Paystack integration
  const {
    processPayment,
    isLoading: paystackLoading,
    formatAmount,
    validateAmount,
    error: paystackError,
    clearError,
  } = usePaystack();

  // State management
  const [activeStep, setActiveStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [billingAddressSame, setBillingAddressSame] = useState(true);
  const [showOrderSummary, setShowOrderSummary] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Fetch pending orders (orders that need payment)
  const {
    data: pendingOrders,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["pendingOrders"],
    queryFn: () => dashboardAPI.getUserOrders({ paymentStatus: "Pending" }),
    select: (response) => response.data?.data || [],
  });

  // Fetch user profile for email
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => userAPI.getProfile(),
    select: (response) => response.data?.user || {},
  });

  // Payment form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    trigger,
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      paymentMethod: "card",
      saveCard: false,
      billingAddressSame: true,
    },
  });

  // Billing form (separate for better validation)
  const billingForm = useForm({
    mode: "onBlur",
  });

  // Payment processing mutation with Paystack
  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData) => {
      // Use Paystack for payment processing
      return await processPayment(
        {
          orderId: selectedOrder?._id,
          amount: selectedOrder?.totalAmount,
          customerEmail: userProfile?.email || "user@example.com",
          callbackUrl: window.location.origin + "/dashboard/payments",
          metadata: {
            orderNumber: selectedOrder?.orderNumber,
            paymentMethod: paymentData.paymentMethod,
          },
        },
        {
          onSuccess: (data) => {
            toast.success("Payment completed successfully!");
            setActiveStep(4); // Success step
            queryClient.invalidateQueries({ queryKey: ["pendingOrders"] });
            queryClient.invalidateQueries({ queryKey: ["userOrders"] });
          },
          onError: (error) => {
            toast.error("Payment failed. Please try again.");
            console.error("Payment error:", error);
          },
          onCancel: () => {
            toast.error("Payment cancelled");
          },
        }
      );
    },
    onMutate: () => {
      setProcessingPayment(true);
    },
    onSettled: () => {
      setProcessingPayment(false);
    },
  });

  // Calculate totals
  const orderTotals = useMemo(() => {
    if (!selectedOrder) return { subtotal: 0, tax: 0, total: 0 };

    const subtotal = selectedOrder.cost || 0;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;

    return { subtotal, tax, total };
  }, [selectedOrder]);

  // Payment method options (Paystack supported methods)
  const paymentMethods = [
    {
      id: "card",
      name: "Debit/Credit Card",
      icon: CreditCardIcon,
      description: "Visa, Mastercard, Verve",
      recommended: true,
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: BankIcon,
      description: "Direct bank transfer",
      processingTime: "Instant",
    },
    {
      id: "ussd",
      name: "USSD",
      icon: DeviceMobileIcon,
      description: "Pay with USSD code",
      processingTime: "Instant",
    },
    {
      id: "mobile_money",
      name: "Mobile Money",
      icon: DeviceMobileIcon,
      description: "Mobile money payments",
      processingTime: "Instant",
    },
  ];

  // Form validation rules
  const validationRules = {
    cardNumber: {
      required: "Card number is required",
      pattern: {
        value: /^[0-9]{13,19}$/,
        message: "Please enter a valid card number",
      },
    },
    cardName: {
      required: "Cardholder name is required",
      minLength: {
        value: 2,
        message: "Name must be at least 2 characters",
      },
    },
    expiryDate: {
      required: "Expiry date is required",
      pattern: {
        value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
        message: "Please enter a valid expiry date (MM/YY)",
      },
    },
    cvv: {
      required: "CVV is required",
      pattern: {
        value: /^[0-9]{3,4}$/,
        message: "Please enter a valid CVV",
      },
    },
  };

  // Handle form submission
  const onSubmit = async (data) => {
    if (!selectedOrder) {
      toast.error("Please select an order to pay for");
      return;
    }

    // Validate billing address if different
    if (!billingAddressSame) {
      const billingValid = await billingForm.trigger();
      if (!billingValid) {
        toast.error("Please complete billing address information");
        return;
      }
    }

    const paymentData = {
      orderId: selectedOrder._id,
      paymentMethod: data.paymentMethod,
      amount: orderTotals.total,
      currency: "NGN",
      email: userProfile?.email || "",
      cardDetails:
        paymentMethod === "card"
          ? {
              number: data.cardNumber,
              name: data.cardName,
              expiry: data.expiryDate,
              cvv: data.cvv,
            }
          : null,
      billingAddress: billingAddressSame
        ? selectedOrder.deliveryAddress
        : billingForm.getValues(),
      saveCard: data.saveCard,
    };

    setActiveStep(3); // Processing step
    processPaymentMutation.mutate(paymentData);
  };

  // Auto-select first pending order
  useEffect(() => {
    if (pendingOrders && pendingOrders.length > 0 && !selectedOrder) {
      setSelectedOrder(pendingOrders[0]);
    }
  }, [pendingOrders, selectedOrder]);

  // Format currency using Paystack hook for consistency
  const formatCurrency = (amount) => {
    return formatAmount
      ? formatAmount(amount)
      : new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
        }).format(amount);
  };

  // Format card number for display
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  // Progress steps
  const steps = [
    { id: 1, name: "Select Order", icon: ClipboardIcon },
    { id: 2, name: "Payment Details", icon: CreditCardIcon },
    { id: 3, name: "Processing", icon: ClockIcon },
    { id: 4, name: "Complete", icon: CheckCircleIcon },
  ];

  if (ordersLoading || profileLoading) {
    return (
      <div className="h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-base-content/70">Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="min-h-screen bg-base-200 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="alert alert-error">
            <WarningIcon className="w-5 h-5" />
            <span>Failed to load orders: {ordersError.message}</span>
            <button
              onClick={() => refetchOrders()}
              className="btn btn-sm btn-outline"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show Paystack errors
  if (paystackError) {
    return (
      <div className="min-h-screen bg-base-200 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="alert alert-error">
            <WarningIcon className="w-5 h-5" />
            <span>Payment Error: {paystackError}</span>
            <button
              onClick={() => clearError()}
              className="btn btn-sm btn-outline"
            >
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
        title="Payment - FashionSmith"
        description="Secure payment processing for your custom tailoring orders."
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
            Secure Payment
          </h1>
          <p className="text-base-content/70 text-lg max-w-2xl mx-auto mb-4">
            Complete your payment securely with our encrypted payment system.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-base-content/60">
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Powered by Paystack - Secure & Trusted</span>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="card bg-base-100 shadow-xl border border-base-300/50 mb-8">
          <div className="card-body p-6">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                      activeStep >= step.id
                        ? "bg-primary text-primary-content"
                        : "bg-base-300 text-base-content/50"
                    }`}
                  >
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="ml-3 hidden md:block">
                    <p
                      className={`font-medium ${
                        activeStep >= step.id
                          ? "text-primary"
                          : "text-base-content/50"
                      }`}
                    >
                      {step.name}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 md:w-16 h-1 mx-4 rounded transition-all duration-300 ${
                        activeStep > step.id ? "bg-primary" : "bg-base-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Order Selection */}
              {activeStep === 1 && (
                <div className="card bg-base-100 shadow-xl border border-base-300/50">
                  <div className="card-body p-6">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                      <ClipboardIcon className="w-6 h-6 text-primary" />
                      Select Order to Pay
                    </h2>

                    {pendingOrders.length === 0 ? (
                      <div className="text-center py-12">
                        <PackageIcon className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">
                          No Pending Payments
                        </h3>
                        <p className="text-base-content/70 mb-4">
                          You don't have any pending orders yet.
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            (window.location.href = "/dashboard/orders")
                          }
                          className="btn btn-primary"
                        >
                          View All Orders
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingOrders.map((order) => (
                          <div
                            key={order._id}
                            className={`border border-base-300 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                              selectedOrder?._id === order._id
                                ? "border-primary bg-primary/5"
                                : "hover:border-primary/50"
                            }`}
                            onClick={() => setSelectedOrder(order)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <input
                                    type="radio"
                                    name="selectedOrder"
                                    className="radio radio-primary"
                                    checked={selectedOrder?._id === order._id}
                                    onChange={() => setSelectedOrder(order)}
                                  />
                                  <h4 className="font-semibold">
                                    {order.garment}
                                  </h4>
                                  <div className="badge badge-warning">
                                    Pending Payment
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-base-content/70">
                                  <p>
                                    <strong>Order ID:</strong>{" "}
                                    {order._id.slice(-8)}
                                  </p>
                                  <p>
                                    <strong>Quantity:</strong> {order.quantity}
                                  </p>
                                  <p>
                                    <strong>Delivery:</strong>{" "}
                                    {new Date(
                                      order.deliveryDate
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary">
                                  {formatCurrency(order.cost)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="flex justify-end pt-4">
                          <button
                            type="button"
                            onClick={() => setActiveStep(2)}
                            disabled={!selectedOrder}
                            className="btn btn-primary gap-2"
                          >
                            Continue to Payment
                            <ArrowRightIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Payment Details */}
              {activeStep === 2 && (
                <div className="space-y-6">
                  {/* Payment Method Selection */}
                  <div className="card bg-base-100 shadow-xl border border-base-300/50">
                    <div className="card-body p-6">
                      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                        <CreditCardIcon className="w-6 h-6 text-primary" />
                        Payment Method
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {paymentMethods.map((method) => (
                          <div
                            key={method.id}
                            className={`border border-base-300 rounded-lg p-4 cursor-pointer transition-all duration-200 relative ${
                              paymentMethod === method.id
                                ? "border-primary bg-primary/5"
                                : "hover:border-primary/50"
                            }`}
                            onClick={() => setPaymentMethod(method.id)}
                          >
                            {method.recommended && (
                              <div className="absolute -top-2 -right-2">
                                <div className="badge badge-primary badge-sm">
                                  Recommended
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-3 mb-2">
                              <input
                                type="radio"
                                name="paymentMethod"
                                className="radio radio-primary"
                                checked={paymentMethod === method.id}
                                onChange={() => setPaymentMethod(method.id)}
                                {...register("paymentMethod")}
                              />
                              <method.icon className="w-6 h-6 text-primary" />
                              <span className="font-medium">{method.name}</span>
                            </div>
                            <p className="text-sm text-base-content/70 mb-1">
                              {method.description}
                            </p>
                            {method.processingTime && (
                              <p className="text-xs text-warning">
                                Processing: {method.processingTime}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Card Payment Form */}
                      {paymentMethod === "card" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">
                              Card Information
                            </h3>
                            <div className="flex items-center gap-2">
                              <ShieldCheckIcon className="w-5 h-5 text-success" />
                              <span className="text-sm text-success">
                                SSL Encrypted
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Card Number */}
                            <div className="md:col-span-2">
                              <label className="label">
                                <span className="label-text font-medium">
                                  Card Number
                                </span>
                              </label>
                              <input
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                className={`input input-bordered w-full ${
                                  errors.cardNumber ? "input-error" : ""
                                }`}
                                maxLength="19"
                                onChange={(e) => {
                                  const formatted = formatCardNumber(
                                    e.target.value
                                  );
                                  setValue(
                                    "cardNumber",
                                    formatted.replace(/\s/g, "")
                                  );
                                  e.target.value = formatted;
                                }}
                                {...register(
                                  "cardNumber",
                                  validationRules.cardNumber
                                )}
                              />
                              {errors.cardNumber && (
                                <span className="text-error text-sm mt-1">
                                  {errors.cardNumber.message}
                                </span>
                              )}
                            </div>

                            {/* Cardholder Name */}
                            <div className="md:col-span-2">
                              <label className="label">
                                <span className="label-text font-medium">
                                  Cardholder Name
                                </span>
                              </label>
                              <input
                                type="text"
                                placeholder="John Doe"
                                className={`input input-bordered w-full ${
                                  errors.cardName ? "input-error" : ""
                                }`}
                                {...register(
                                  "cardName",
                                  validationRules.cardName
                                )}
                              />
                              {errors.cardName && (
                                <span className="text-error text-sm mt-1">
                                  {errors.cardName.message}
                                </span>
                              )}
                            </div>

                            {/* Expiry Date */}
                            <div>
                              <label className="label">
                                <span className="label-text font-medium">
                                  Expiry Date
                                </span>
                              </label>
                              <input
                                type="text"
                                placeholder="MM/YY"
                                className={`input input-bordered w-full ${
                                  errors.expiryDate ? "input-error" : ""
                                }`}
                                maxLength="5"
                                onChange={(e) => {
                                  let value = e.target.value.replace(/\D/g, "");
                                  if (value.length >= 2) {
                                    value =
                                      value.substring(0, 2) +
                                      "/" +
                                      value.substring(2, 4);
                                  }
                                  e.target.value = value;
                                  setValue("expiryDate", value);
                                }}
                                {...register(
                                  "expiryDate",
                                  validationRules.expiryDate
                                )}
                              />
                              {errors.expiryDate && (
                                <span className="text-error text-sm mt-1">
                                  {errors.expiryDate.message}
                                </span>
                              )}
                            </div>

                            {/* CVV */}
                            <div>
                              <label className="label">
                                <span className="label-text font-medium">
                                  CVV
                                </span>
                              </label>
                              <div className="relative">
                                <input
                                  type={showCVV ? "text" : "password"}
                                  placeholder="123"
                                  className={`input input-bordered w-full pr-12 ${
                                    errors.cvv ? "input-error" : ""
                                  }`}
                                  maxLength="4"
                                  {...register("cvv", validationRules.cvv)}
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                  onClick={() => setShowCVV(!showCVV)}
                                >
                                  {showCVV ? (
                                    <EyeSlashIcon className="w-5 h-5 text-base-content/50" />
                                  ) : (
                                    <EyeIcon className="w-5 h-5 text-base-content/50" />
                                  )}
                                </button>
                              </div>
                              {errors.cvv && (
                                <span className="text-error text-sm mt-1">
                                  {errors.cvv.message}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Save Card Option */}
                          <div className="form-control">
                            <label className="label cursor-pointer justify-start gap-3">
                              <input
                                type="checkbox"
                                className="checkbox checkbox-primary"
                                {...register("saveCard")}
                              />
                              <div>
                                <span className="label-text font-medium">
                                  Save card for future payments
                                </span>
                                <p className="text-sm text-base-content/70">
                                  Your card details will be encrypted and stored
                                  securely
                                </p>
                              </div>
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Bank Transfer Info */}
                      {paymentMethod === "bank" && (
                        <div className="alert alert-info">
                          <InfoIcon className="w-5 h-5" />
                          <div>
                            <h4 className="font-semibold">
                              Bank Transfer Instructions
                            </h4>
                            <p className="text-sm">
                              You will receive detailed bank transfer
                              instructions after confirming your order.
                              Processing time: 1-3 business days.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Mobile Payment Info */}
                      {paymentMethod === "mobile" && (
                        <div className="alert alert-info">
                          <InfoIcon className="w-5 h-5" />
                          <div>
                            <h4 className="font-semibold">Mobile Payment</h4>
                            <p className="text-sm">
                              You will be redirected to your mobile payment
                              provider to complete the transaction.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div className="card bg-base-100 shadow-xl border border-base-300/50">
                    <div className="card-body p-6">
                      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                        <MapPinIcon className="w-6 h-6 text-primary" />
                        Billing Address
                      </h2>

                      <div className="form-control mb-4">
                        <label className="label cursor-pointer justify-start gap-3">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary"
                            checked={billingAddressSame}
                            onChange={(e) =>
                              setBillingAddressSame(e.target.checked)
                            }
                            {...register("billingAddressSame")}
                          />
                          <span className="label-text font-medium">
                            Same as delivery address
                          </span>
                        </label>
                      </div>

                      {!billingAddressSame && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="label">
                              <span className="label-text font-medium">
                                Street Address
                              </span>
                            </label>
                            <input
                              type="text"
                              placeholder="123 Main Street"
                              className="input input-bordered w-full"
                              {...billingForm.register("street", {
                                required: "Street address is required",
                              })}
                            />
                          </div>
                          <div>
                            <label className="label">
                              <span className="label-text font-medium">
                                City
                              </span>
                            </label>
                            <input
                              type="text"
                              placeholder="New York"
                              className="input input-bordered w-full"
                              {...billingForm.register("city", {
                                required: "City is required",
                              })}
                            />
                          </div>
                          <div>
                            <label className="label">
                              <span className="label-text font-medium">
                                State/Province
                              </span>
                            </label>
                            <input
                              type="text"
                              placeholder="NY"
                              className="input input-bordered w-full"
                              {...billingForm.register("state", {
                                required: "State is required",
                              })}
                            />
                          </div>
                          <div>
                            <label className="label">
                              <span className="label-text font-medium">
                                ZIP/Postal Code
                              </span>
                            </label>
                            <input
                              type="text"
                              placeholder="10001"
                              className="input input-bordered w-full"
                              {...billingForm.register("zipCode", {
                                required: "ZIP code is required",
                              })}
                            />
                          </div>
                          <div>
                            <label className="label">
                              <span className="label-text font-medium">
                                Country
                              </span>
                            </label>
                            <select
                              className="select select-bordered w-full"
                              {...billingForm.register("country", {
                                required: "Country is required",
                              })}
                            >
                              <option value="">Select Country</option>
                              <option value="US">United States</option>
                              <option value="CA">Canada</option>
                              <option value="UK">United Kingdom</option>
                              <option value="NG">Nigeria</option>
                              <option value="GH">Ghana</option>
                              <option value="KE">Kenya</option>
                              <option value="ZA">South Africa</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="btn btn-outline gap-2"
                    >
                      <ArrowLeftIcon className="w-5 h-5" />
                      Back to Orders
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary gap-2"
                      disabled={
                        !selectedOrder || paystackLoading || processingPayment
                      }
                    >
                      {paystackLoading || processingPayment ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <LockIcon className="w-5 h-5" />
                          Pay {formatCurrency(orderTotals.total)}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Step 3: Processing */}
            {activeStep === 3 && (
              <div className="card bg-base-100 shadow-xl border border-base-300/50">
                <div className="card-body p-12 text-center">
                  <div className="loading loading-spinner loading-lg text-primary mb-6"></div>
                  <h2 className="text-2xl font-semibold mb-4">
                    Processing Payment
                  </h2>
                  <p className="text-base-content/70 mb-6">
                    Please wait while we securely process your payment. This may
                    take a few moments.
                  </p>
                  <div className="alert alert-warning max-w-md mx-auto">
                    <WarningIcon className="w-5 h-5" />
                    <span className="text-sm">
                      Please do not close this window or navigate away.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {activeStep === 4 && (
              <div className="card bg-base-100 shadow-xl border border-base-300/50">
                <div className="card-body p-12 text-center">
                  <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircleIcon className="w-12 h-12 text-success" />
                  </div>
                  <h2 className="text-3xl font-bold text-success mb-4">
                    Payment Successful!
                  </h2>
                  <p className="text-base-content/70 mb-6 max-w-md mx-auto">
                    Your payment has been processed successfully. You will
                    receive a confirmation email shortly.
                  </p>

                  <div className="space-y-4 max-w-md mx-auto">
                    <div className="flex justify-between text-sm">
                      <span>Transaction ID:</span>
                      <span className="font-mono">TXN{Date.now()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Amount Paid:</span>
                      <span className="font-semibold">
                        {formatCurrency(orderTotals.total)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Payment Date:</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                    <button
                      onClick={() =>
                        (window.location.href = "/dashboard/orders")
                      }
                      className="btn btn-primary gap-2"
                    >
                      <TruckIcon className="w-5 h-5" />
                      View Order Status
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="btn btn-outline gap-2"
                    >
                      <ReceiptIcon className="w-5 h-5" />
                      Print Receipt
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="card bg-base-100 shadow-xl border border-base-300/50">
                <div className="card-body p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Order Summary</h3>
                    <button
                      onClick={() => setShowOrderSummary(!showOrderSummary)}
                      className="btn btn-ghost btn-sm lg:hidden"
                    >
                      {showOrderSummary ? "Hide" : "Show"}
                    </button>
                  </div>

                  <div
                    className={`${
                      showOrderSummary ? "block" : "hidden lg:block"
                    }`}
                  >
                    {selectedOrder ? (
                      <div className="space-y-4">
                        {/* Order Details */}
                        <div className="border border-base-300 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <SparkleIcon className="w-5 h-5 text-primary" />
                            <h4 className="font-semibold">
                              {selectedOrder.garment}
                            </h4>
                          </div>
                          <div className="space-y-2 text-sm text-base-content/70">
                            <div className="flex justify-between">
                              <span>Order ID:</span>
                              <span className="font-mono">
                                {selectedOrder._id.slice(-8)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Quantity:</span>
                              <span>{selectedOrder.quantity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Fabric:</span>
                              <span>{selectedOrder.selectedFabric}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Color:</span>
                              <span>{selectedOrder.selectedColor}</span>
                            </div>
                          </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(orderTotals.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax (8%):</span>
                            <span>{formatCurrency(orderTotals.tax)}</span>
                          </div>
                          <div className="divider my-2"></div>
                          <div className="flex justify-between text-lg font-semibold">
                            <span>Total:</span>
                            <span className="text-primary">
                              {formatCurrency(orderTotals.total)}
                            </span>
                          </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="border border-base-300 rounded-lg p-4">
                          <h5 className="font-semibold mb-2 flex items-center gap-2">
                            <TruckIcon className="w-4 h-4" />
                            Delivery Information
                          </h5>
                          <div className="space-y-1 text-sm text-base-content/70">
                            <p>
                              <strong>Date:</strong>{" "}
                              {new Date(
                                selectedOrder.deliveryDate
                              ).toLocaleDateString()}
                            </p>
                            <p>
                              <strong>Address:</strong>{" "}
                              {selectedOrder.deliveryAddress}
                            </p>
                          </div>
                        </div>

                        {/* Security Info */}
                        <div className="alert alert-info text-sm">
                          <ShieldCheckIcon className="w-4 h-4" />
                          <div>
                            <p className="font-semibold">Secure Payment</p>
                            <p className="text-xs">
                              Your payment information is encrypted and secure.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileIcon className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
                        <p className="text-base-content/70">
                          Select an order to view summary
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Security Features */}
              <div className="card bg-base-100 shadow-xl border border-base-300/50 mt-6">
                <div className="card-body p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Security Features
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <ShieldCheckIcon className="w-5 h-5 text-success" />
                      <div>
                        <p className="font-medium text-sm">SSL Encryption</p>
                        <p className="text-xs text-base-content/70">
                          256-bit encryption
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <LockIcon className="w-5 h-5 text-success" />
                      <div>
                        <p className="font-medium text-sm">PCI Compliant</p>
                        <p className="text-xs text-base-content/70">
                          Industry standard security
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-success" />
                      <div>
                        <p className="font-medium text-sm">Fraud Protection</p>
                        <p className="text-xs text-base-content/70">
                          Real-time monitoring
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
