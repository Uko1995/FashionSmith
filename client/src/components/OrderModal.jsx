import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  XIcon,
  UploadIcon,
  PaletteIcon,
  ScissorsIcon,
  CameraIcon,
  RulerIcon,
  CheckCircleIcon,
  InfoIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { userAPI } from "../services/api";
import { garmentSpecificMeasurements } from "../utils/garmentMeasurements";
import {
  availableColors,
  availableFabrics,
  calculateExtraCost,
} from "../utils/fabricsAndColors";
import { useUiStore } from "../store/uiStore";
import RedAsterix from "./RedAsterix";

export default function OrderModal({ isOpen, onClose, product }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("preferences");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedFabric, setSelectedFabric] = useState("");
  const [styleImage, setStyleImage] = useState(null);
  const [styleImagePreview, setStyleImagePreview] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user from store
  const { user } = useUiStore();

  // Load last preferences from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      const lastColor = localStorage.getItem("lastSelectedColor");
      const lastFabric = localStorage.getItem("lastSelectedFabric");

      if (lastColor && availableColors.find((c) => c.name === lastColor)) {
        setSelectedColor(lastColor);
      }
      if (lastFabric && availableFabrics.find((f) => f.name === lastFabric)) {
        setSelectedFabric(lastFabric);
      }

      // Set minimum delivery date to 7 days from now
      if (!deliveryDate) {
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + 7);
        setDeliveryDate(minDate.toISOString().split("T")[0]);
      }
    }
  }, [isOpen, deliveryDate]);

  // Fetch user profile for delivery address
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: userAPI.getProfile,
    enabled: isOpen,
    select: (response) => response.data,
  });

  // Fetch user measurements
  const { data: userMeasurements, isLoading: measurementsLoading } = useQuery({
    queryKey: ["userMeasurements"],
    queryFn: userAPI.getMeasurements,
    enabled: isOpen, // Fetch as soon as modal opens
    select: (response) => response.data,
  });

  // Auto-fill delivery address from user profile when available
  useEffect(() => {
    if (isOpen && userProfile?.address && !deliveryAddress) {
      const { street, state, country } = userProfile.address;
      const addressParts = [street, state, country].filter(Boolean);
      if (addressParts.length > 0) {
        setDeliveryAddress(addressParts.join(", "));
      }
    }
  }, [isOpen, userProfile?.address, deliveryAddress]);

  // Form for measurements
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    mode: "onChange",
  });

  // Get garment type from product name
  const getGarmentType = (productName) => {
    if (!productName) return "kaftan";
    const name = productName.toLowerCase();
    if (name.includes("kaftan")) return "kaftan";
    if (name.includes("agbada")) return "agbada";
    if (name.includes("suit")) return "suit";
    if (name.includes("trouser") || name.includes("pant")) return "trouser";
    if (name.includes("shirt")) return "shirt";
    return "kaftan";
  };

  const garmentType = product ? getGarmentType(product.name) : "kaftan";
  const requiredMeasurements = useMemo(() => {
    const measurements = garmentSpecificMeasurements[garmentType] || [];
    return measurements;
  }, [garmentType]);

  // Auto-fill measurements when user data loads
  useEffect(() => {
    if (userMeasurements && typeof userMeasurements === "object") {
      console.log("User measurements object:", userMeasurements);

      requiredMeasurements.forEach((measurement) => {
        if (
          userMeasurements[measurement] &&
          userMeasurements[measurement] !== 0
        ) {
          setValue(measurement, userMeasurements[measurement]);
        } else {
          setValue(measurement, "");
        }
      });
    }
  }, [userMeasurements, setValue, requiredMeasurements]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab("preferences");
      setSelectedColor("");
      setSelectedFabric("");
      setStyleImage(null);
      setStyleImagePreview(null);
      setQuantity(1);
      setDeliveryDate("");
      setDeliveryAddress("");
      setIsSubmitting(false);
      reset();
    }
  }, [isOpen, reset]);

  // Handle style image upload
  const handleStyleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStyleImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setStyleImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveStyleImage = () => {
    setStyleImage(null);
    setStyleImagePreview(null);
  };

  const createOrder = useMutation({
    mutationFn: async (orderData) => {
      const response = await userAPI.createOrder(orderData);
      return response;
    },
    onSuccess: () => {
      // Invalidate the exact query keys used by profile/dashboard components
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardOverview"] });
      queryClient.invalidateQueries({ queryKey: ["pendingOrders"] });
      queryClient.invalidateQueries({ queryKey: ["recentOrders"] });
      // optional: notifications/dashboard related
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Order creation failed");
    },
  });

  const onSubmitOrder = async (measurementData) => {
    if (isSubmitting) return;

    // Check if user is logged in
    if (!user) {
      toast.error("Please log in to place an order");
      return;
    }

    // Validate required fields
    if (
      !selectedColor ||
      !selectedFabric ||
      !deliveryDate ||
      !deliveryAddress.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate measurements
    const hasValidMeasurements = requiredMeasurements.some((measurement) => {
      const value = parseFloat(measurementData[measurement]);
      return value && value > 0;
    });

    if (!hasValidMeasurements) {
      toast.error("Please provide at least one valid measurement");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare measurements array from form data
      const measurementsArray = requiredMeasurements
        .map((measurement) => ({
          name: measurement,
          value: parseFloat(measurementData[measurement]) || 0,
        }))
        .filter((m) => m.value > 0); // only include measurements with values

      // 1. Create order with the expected API fields (matching backend schema)
      const orderData = {
        productId: product._id,
        quantity: quantity,
        garment: product.name,
        selectedFabric: selectedFabric, // string as expected by backend
        selectedColor: selectedColor, // string as expected by backend
        deliveryDate: deliveryDate,
        deliveryAddress: deliveryAddress.trim(),
        measurements: measurementsArray, // array of objects with name and value
        unit: "inches",
        status: "Pending",
        paymentStatus: "Pending",
      };
      console.log("order data: ", orderData);
      toast.loading("Creating your order...", { id: "order-process" });

      // Use mutateAsync so we can await the mutation result synchronously
      const createResult = await createOrder.mutateAsync(orderData);
      // createResult is the axios response returned by the mutationFn
      const created = createResult?.data || createResult;
      const orderId =
        created?.orderId || created?._id || created?.data?.orderId || created?.data?._id;
      toast.dismiss("order-process");

      toast.loading("Initializing payment...", { id: "order-process" });

      const totalPrice = calculateTotalPrice();

      // Initialize payment
      const paymentData = {
        orderId: orderId,
        amount: totalPrice,
        customerEmail: user?.email,
        callbackUrl: `${window.location.origin}/payment-success?orderId=${orderId}`,
        metadata: {
          orderId: orderId,
          productName: product.name,
          customerName: user?.firstName,
        },
      };

      const paymentResponse = await userAPI.initializePayment(paymentData);
      console.log("payment response: ", paymentResponse);
      const authUrl = paymentResponse?.data?.data?.authorizationUrl;

      if (!authUrl) {
        throw new Error("Payment initialization failed: no authorization URL");
      }

      toast.success("Order created! Redirecting to payment...");

      // 3. Redirect to Paystack
      setTimeout(() => {
        window.location.href = authUrl;
      }, 1500);
    } catch (error) {
      console.error("Order/Payment initialization failed:", error);
      setIsSubmitting(false);
      toast.dismiss("order-process");

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to process order. Please try again.");
      }
    }
  };

  const isPreferencesComplete =
    selectedColor &&
    selectedFabric &&
    quantity > 0 &&
    deliveryDate &&
    deliveryAddress.trim();

  // Format measurement labels
  const formatMeasurementLabel = (measurement) => {
    return measurement
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    const basePrice = product?.basePrice || 0;
    const extraCost = calculateExtraCost(
      getSelectedColorObj(),
      getSelectedFabricObj()
    );
    const unitPrice = basePrice + extraCost;
    return unitPrice * quantity;
  };

  // Get selected color and fabric objects
  const getSelectedColorObj = () =>
    availableColors.find((c) => c.name === selectedColor);
  const getSelectedFabricObj = () =>
    availableFabrics.find((f) => f.name === selectedFabric);

  // Get product image URL (same logic as ProductAndService)
  const getProductImageUrl = (product) => {
    if (!product) return "/placeholder-product.jpg";

    const mainImage =
      product.images?.find((img) => img.isMain) || product.images?.[0];
    const imageUrl =
      mainImage?.url || product.image || "/placeholder-product.jpg";

    return imageUrl;
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-base-200">
              <img
                src={getProductImageUrl(product)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-base-content">
                Order {product.name}
              </h2>
              <p className="text-base-content/70">
                Customize your order preferences and measurements
              </p>
              <p className="text-sm text-primary font-semibold">
                Base Price: ₦{product.basePrice?.toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle hover:bg-base-300"
          >
            <XIcon size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4">
          <div className="tabs tabs-bordered">
            <button
              className={`tab tab-lg ${
                activeTab === "preferences" ? "tab-active text-primary" : ""
              }`}
              onClick={() => setActiveTab("preferences")}
            >
              <PaletteIcon size={20} className="mr-2" />
              Preferences
              {isPreferencesComplete && (
                <CheckCircleIcon size={16} className="ml-2 text-success" />
              )}
            </button>
            <button
              className={`tab tab-lg ${
                activeTab === "measurements" ? "tab-active text-primary" : ""
              }`}
              onClick={() => setActiveTab("measurements")}
              disabled={!isPreferencesComplete}
            >
              <RulerIcon size={20} className="mr-2" />
              Measurements
            </button>
            <button
              className={`tab tab-lg ${
                activeTab === "summary" ? "tab-active text-primary" : ""
              }`}
              onClick={() => setActiveTab("summary")}
              disabled={!isPreferencesComplete}
            >
              <CheckCircleIcon size={20} className="mr-2" />
              Summary
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === "preferences" && (
            <div className="space-y-8">
              {/* Color Selection */}
              <div>
                <label className="label">
                  <span className="label-text text-lg font-semibold flex items-center gap-2">
                    <PaletteIcon size={20} />
                    Choose Color <RedAsterix />
                  </span>
                </label>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableColors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedColor(color.name);
                        localStorage.setItem("lastSelectedColor", color.name);
                      }}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                        selectedColor === color.name
                          ? "border-primary bg-primary/10"
                          : "border-base-300 hover:border-base-400"
                      }`}
                    >
                      <div
                        className="w-8 h-8  mx-auto mb-2 border border-base-300"
                        style={{ backgroundColor: color.hex }}
                      ></div>
                      <span className="text-sm font-medium capitalize">
                        {color.name}
                      </span>

                      {color.popular && (
                        <div className="text-xs text-success mt-1 font-medium">
                          Popular
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {!selectedColor && (
                  <div className="label">
                    <span className="label-text-alt text-error">
                      Please select a color
                    </span>
                  </div>
                )}
              </div>

              {/* Fabric Selection */}
              <div>
                <label className="label">
                  <span className="label-text text-lg font-semibold flex items-center gap-2">
                    <ScissorsIcon size={20} />
                    Choose Fabric *
                  </span>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableFabrics.map((fabric, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedFabric(fabric.name);
                        localStorage.setItem("lastSelectedFabric", fabric.name);
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.02] ${
                        selectedFabric === fabric.name
                          ? "border-primary bg-primary/10"
                          : "border-base-300 hover:border-base-400"
                      }`}
                    >
                      <div className="font-medium capitalize flex justify-between items-center">
                        {fabric.name}
                      </div>
                      <div className="text-sm text-base-content/70 mt-1">
                        {fabric.description}
                      </div>
                      <div className="flex gap-2 mt-2">
                        {fabric.popular && (
                          <span className="badge badge-success badge-sm">
                            Popular
                          </span>
                        )}
                        {fabric.premium && (
                          <span className="badge badge-warning badge-sm">
                            Premium
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {!selectedFabric && (
                  <div className="label">
                    <span className="label-text-alt text-error">
                      Please select a fabric
                    </span>
                  </div>
                )}
              </div>

              {/* Style Image Upload */}
              <div>
                <label className="label">
                  <span className="label-text text-lg font-semibold flex items-center gap-2">
                    <CameraIcon size={20} />
                    Upload your preferred style (Optional)
                  </span>
                </label>
                <div className="space-y-4">
                  {!styleImagePreview ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-base-300 rounded-xl cursor-pointer hover:border-primary hover:bg-base-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadIcon className="w-8 h-8 mb-2 text-base-content/50" />
                        <p className="mb-2 text-sm text-base-content/70">
                          <span className="font-semibold">Click to upload</span>{" "}
                          your preferred style
                        </p>
                        <p className="text-xs text-base-content/50">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleStyleImageChange}
                      />
                    </label>
                  ) : (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden bg-base-200">
                      <img
                        src={styleImagePreview}
                        alt="Style reference"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={handleRemoveStyleImage}
                        className="absolute top-2 right-2 btn btn-error btn-circle btn-sm"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Details */}
              <div className="space-y-6">
                <div className="divider">
                  <span className="text-base-content/60 flex items-center gap-2">
                    <InfoIcon size={16} />
                    Order Details
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Quantity */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-lg font-semibold">
                        Quantity <RedAsterix />
                      </span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(parseInt(e.target.value) || 1)
                      }
                      className="input input-bordered focus:input-primary"
                      placeholder="1"
                    />
                    <label className="label">
                      <span className="label-text-alt text-base-content/60">
                        Maximum 50 items per order
                      </span>
                    </label>
                  </div>

                  {/* Delivery Date */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-lg font-semibold">
                        Delivery Date <RedAsterix />
                      </span>
                    </label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      min={
                        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                          .toISOString()
                          .split("T")[0]
                      }
                      className="input input-bordered focus:input-primary"
                    />
                    <label className="label">
                      <span className="label-text-alt text-base-content/60">
                        Minimum 7 days from today
                      </span>
                    </label>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-lg font-semibold">
                      Delivery Address <RedAsterix />
                    </span>
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="textarea textarea-bordered focus:textarea-primary h-24 resize-none"
                    placeholder="Enter your complete delivery address..."
                  />
                  {userProfile?.address && (
                    <label className="label">
                      <span className="label-text-alt text-success">
                        ✓ Auto-filled from your profile address
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* Helpful tip */}
              {isPreferencesComplete && (
                <div className="alert alert-success">
                  <InfoIcon size={20} />
                  <div>
                    <p className="font-medium">
                      ✓ Preferences saved for future orders
                    </p>
                    <p className="text-sm">
                      Your color and fabric choices will be remembered to make
                      future ordering faster.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "measurements" && (
            <div className="space-y-6">
              <div className="alert alert-info">
                <InfoIcon size={20} />
                <div>
                  <h3 className="font-bold">
                    Measurements for {formatMeasurementLabel(garmentType)}
                  </h3>
                  <div className="text-sm">
                    {userMeasurements &&
                    Object.keys(userMeasurements).length > 0
                      ? "Your saved measurements have been pre-filled. You can modify them if needed."
                      : "Please enter your measurements in inches."}
                  </div>
                </div>
              </div>

              {measurementsLoading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="w-32 h-4 bg-base-300 rounded animate-pulse"></div>
                      <div className="w-20 h-10 bg-base-300 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  {console.log("Rendering measurements form:", {
                    requiredMeasurements: requiredMeasurements,
                    count: requiredMeasurements.length,
                    measurementsLoading,
                  })}
                  {requiredMeasurements.length === 0 ? (
                    <div className="alert alert-warning">
                      <InfoIcon size={20} />
                      <div>
                        <h3 className="font-bold">No measurements found</h3>
                        <div className="text-sm">
                          No measurement fields are defined for this garment
                          type: {garmentType}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSubmit(onSubmitOrder)}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {requiredMeasurements.map((measurement) => (
                          <div key={measurement} className="form-control">
                            <label className="label">
                              <span className="label-text font-medium">
                                {formatMeasurementLabel(measurement)}{" "}
                              </span>
                              <span className="label-text-alt">inches</span>
                              <RedAsterix />
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              placeholder="0.0"
                              className={`input input-bordered ${
                                errors[measurement] ? "input-error" : ""
                              }`}
                              {...register(measurement, {
                                required: `${formatMeasurementLabel(
                                  measurement
                                )} is required`,
                                min: {
                                  value: 0.1,
                                  message: "Must be greater than 0",
                                },
                              })}
                            />
                            {errors[measurement] && (
                              <label className="label">
                                <span className="label-text-alt text-error">
                                  {errors[measurement].message}
                                </span>
                              </label>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="divider"></div>

                      <div className="flex justify-end gap-4">
                        <button
                          type="button"
                          onClick={() => setActiveTab("preferences")}
                          className="btn btn-ghost"
                        >
                          Back to Preferences
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab("summary")}
                          className="btn btn-primary"
                        >
                          Continue to Summary
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "summary" && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-base-200 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <CheckCircleIcon size={20} className="text-primary" />
                  Order Summary
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-base-content/70">Product:</span>
                      <span className="font-medium">{product.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/70">Quantity:</span>
                      <span className="font-medium">{quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/70">Base Price:</span>
                      <span className="font-medium">
                        ₦{product.basePrice?.toFixed(2)}
                      </span>
                    </div>
                    {selectedColor && (
                      <div className="flex justify-between">
                        <span className="text-base-content/70">Color:</span>
                        <span className="font-medium flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{
                              backgroundColor: getSelectedColorObj()?.hex,
                            }}
                          ></div>
                          {selectedColor}
                          {getSelectedColorObj()?.extraPrice > 0 && (
                            <span className="text-primary">
                              +₦{getSelectedColorObj()?.extraPrice}
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    {selectedFabric && (
                      <div className="flex justify-between">
                        <span className="text-base-content/70">Fabric:</span>
                        <span className="font-medium">
                          {selectedFabric}
                          {getSelectedFabricObj()?.price > 0 && (
                            <span className="text-primary ml-2">
                              +₦{getSelectedFabricObj()?.price}
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-base-content/70">
                        Garment Type:
                      </span>
                      <span className="font-medium">
                        {formatMeasurementLabel(garmentType)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/70">
                        Delivery Date:
                      </span>
                      <span className="font-medium">
                        {deliveryDate
                          ? new Date(deliveryDate).toLocaleDateString()
                          : "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/70">
                        Measurements:
                      </span>
                      <span className="font-medium">
                        {userMeasurements &&
                        Object.keys(userMeasurements).length > 0
                          ? "✓ Auto-filled from profile"
                          : "Custom measurements"}
                      </span>
                    </div>
                    {styleImage && (
                      <div className="flex justify-between">
                        <span className="text-base-content/70">
                          Style Image:
                        </span>
                        <span className="font-medium">✓ Uploaded</span>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-base-content/70 text-xs mb-1">
                        Delivery Address:
                      </span>
                      <span className="font-medium text-xs break-words">
                        {deliveryAddress || "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="divider my-2"></div>

                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Price:</span>
                  <span className="text-primary">
                    ₦{calculateTotalPrice().toFixed(2)}
                  </span>
                </div>

                <div className="alert alert-info text-sm">
                  <InfoIcon size={16} />
                  <div>
                    <p>
                      <strong>💡 Multi-Item Orders:</strong>
                    </p>
                    <p>
                      This creates a separate order for better customization and
                      tracking. You can order additional items with different
                      options by repeating this process.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("measurements")}
                  className="btn btn-ghost"
                >
                  Back to Measurements
                </button>
                <button
                  onClick={handleSubmit(onSubmitOrder)}
                  disabled={isSubmitting || !user}
                  className="btn btn-primary btn-lg"
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Processing...
                    </>
                  ) : !user ? (
                    <>
                      <InfoIcon size={20} className="mr-2" />
                      Login Required
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon size={20} className="mr-2" />
                      Place Order - ₦{calculateTotalPrice().toFixed(2)}
                    </>
                  )}
                </button>
              </div>

              {!user && (
                <div className="alert alert-warning">
                  <InfoIcon size={20} />
                  <div>
                    <p className="font-medium">Login Required</p>
                    <p className="text-sm">
                      Please log in to your account to place an order.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Footer for Preferences Tab */}
        {activeTab === "preferences" && (
          <div className="p-6 border-t border-base-300">
            <div className="flex justify-between">
              <button onClick={onClose} className="btn btn-ghost">
                Cancel
              </button>
              <button
                onClick={() => setActiveTab("measurements")}
                disabled={!isPreferencesComplete}
                className="btn btn-primary"
              >
                Continue to Measurements
                <RulerIcon size={20} className="ml-2" />
              </button>
            </div>
            {!isPreferencesComplete && (
              <p className="text-sm text-error mt-2 text-right">
                Please complete all required fields (color, fabric, quantity,
                delivery date & address)
              </p>
            )}
          </div>
        )}

        {/* Navigation Footer for Measurements Tab */}
        {activeTab === "measurements" && (
          <div className="p-6 border-t border-base-300">
            <div className="flex justify-between">
              <button
                onClick={() => setActiveTab("preferences")}
                className="btn btn-ghost"
              >
                <PaletteIcon size={20} className="mr-2" />
                Back to Preferences
              </button>
              <button
                onClick={() => setActiveTab("summary")}
                className="btn btn-primary"
              >
                Review Order
                <CheckCircleIcon size={20} className="ml-2" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
