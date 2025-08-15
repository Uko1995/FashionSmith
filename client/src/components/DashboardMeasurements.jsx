import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  UserIcon,
  RulerIcon,
  PencilIcon,
  CheckIcon,
  XIcon,
  PlayIcon,
  BookOpenIcon,
  SparkleIcon,
  TapeIcon,
  ArrowsOutIcon,
  ArrowUpDownIcon,
  ArrowLeftRightIcon,
  InformationCircleIcon,
  UserGroupIcon,
  ClipboardIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { userAPI } from "../services/api";
import SEO from "./SEO";

export default function DashboardMeasurements() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("essential");
  const [unit, setUnit] = useState("inches");
  const [showGuide, setShowGuide] = useState(false);

  // Fetch user measurements
  const {
    data: measurements,
    isLoading: measurementsLoading,
    error: measurementsError,
  } = useQuery({
    queryKey: ["userMeasurements"],
    queryFn: userAPI.getMeasurements,
    select: (response) => response.data,
  });

  // Form for measurements
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      unit: "inches",
    },
  });

  // Watch all form values for real-time validation
  const watchedValues = watch();

  // Add/Update measurements mutation
  const saveMeasurementsMutation = useMutation({
    mutationFn: (data) => {
      if (measurements) {
        return userAPI.updateMeasurement(data);
      } else {
        return userAPI.addMeasurement(data);
      }
    },
    onSuccess: () => {
      toast.success(
        measurements
          ? "Measurements updated successfully!"
          : "Measurements saved successfully!"
      );
      queryClient.invalidateQueries({ queryKey: ["userMeasurements"] });
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to save measurements"
      );
    },
  });

  // Delete measurements mutation
  const deleteMeasurementsMutation = useMutation({
    mutationFn: userAPI.deleteMeasurement,
    onSuccess: () => {
      toast.success("Measurements deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["userMeasurements"] });
      reset();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to delete measurements"
      );
    },
  });

  // Set form values when measurements data loads
  useEffect(() => {
    if (measurements) {
      Object.keys(measurements).forEach((key) => {
        if (
          key !== "_id" &&
          key !== "userId" &&
          key !== "createdAt" &&
          key !== "updatedAt"
        ) {
          setValue(key, measurements[key]);
        }
      });
      setUnit(measurements.unit || "inches");
    }
  }, [measurements, setValue]);

  // Handle form submission
  const onSubmit = async (data) => {
    const measurementData = {
      ...data,
      unit,
    };
    saveMeasurementsMutation.mutate(measurementData);
  };

  // Handle cancel editing
  const handleCancel = () => {
    if (measurements) {
      reset(measurements);
    } else {
      reset();
    }
    setIsEditing(false);
  };

  // Handle delete
  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete all measurements? This action cannot be undone."
      )
    ) {
      deleteMeasurementsMutation.mutate();
    }
  };

  // Measurement categories with professional organization
  const measurementCategories = {
    essential: {
      title: "Essential Measurements",
      description: "Core measurements required for all garments",
      icon: UserIcon,
      color: "primary",
      fields: [
        {
          name: "Neck",
          label: "Neck Circumference",
          description: "Around the base of the neck",
          icon: ArrowsOutIcon,
          required: true,
        },
        {
          name: "Shoulder",
          label: "Shoulder Width",
          description: "Across the shoulders from end to end",
          icon: ArrowLeftRightIcon,
          required: true,
        },
        {
          name: "Chest",
          label: "Chest Circumference",
          description: "Around the fullest part of the chest",
          icon: ArrowsOutIcon,
          required: true,
        },
        {
          name: "NaturalWaist",
          label: "Natural Waist",
          description: "Around the narrowest part of the waist",
          icon: ArrowsOutIcon,
          required: true,
        },
        {
          name: "Hip",
          label: "Hip Circumference",
          description: "Around the fullest part of the hips",
          icon: ArrowsOutIcon,
          required: true,
        },
      ],
    },
    formal: {
      title: "Formal & Suits",
      description: "Specialized measurements for suits and formal wear",
      icon: SparkleIcon,
      color: "accent",
      fields: [
        {
          name: "SuitChest",
          label: "Suit Chest",
          description: "Chest measurement specific for suit fitting",
          icon: ArrowsOutIcon,
          required: false,
        },
        {
          name: "SuitWaist",
          label: "Suit Waist",
          description: "Waist measurement for suit jacket",
          icon: ArrowsOutIcon,
          required: false,
        },
        {
          name: "SuitLength",
          label: "Suit Length",
          description: "From shoulder to desired suit length",
          icon: ArrowUpDownIcon,
          required: false,
        },
      ],
    },
    traditional: {
      title: "Traditional Wear",
      description: "Measurements for traditional garments",
      icon: UserGroupIcon,
      color: "secondary",
      fields: [
        {
          name: "KaftanLength",
          label: "Kaftan Length",
          description: "From shoulder to desired kaftan hemline",
          icon: ArrowUpDownIcon,
          required: false,
        },
        {
          name: "ShirtLength",
          label: "Shirt Length",
          description: "From shoulder to desired shirt length",
          icon: ArrowUpDownIcon,
          required: false,
        },
      ],
    },
    sleeves: {
      title: "Sleeve Measurements",
      description: "Detailed sleeve specifications",
      icon: TapeIcon,
      color: "info",
      fields: [
        {
          name: "LongSleeve",
          label: "Long Sleeve Length",
          description: "From shoulder to wrist",
          icon: ArrowUpDownIcon,
          required: false,
        },
        {
          name: "ShortSleeve",
          label: "Short Sleeve Length",
          description: "From shoulder to desired short sleeve end",
          icon: ArrowUpDownIcon,
          required: false,
        },
        {
          name: "MidSleeve",
          label: "Mid Sleeve Length",
          description: "From shoulder to elbow area",
          icon: ArrowUpDownIcon,
          required: false,
        },
        {
          name: "ShortSleeveWidth",
          label: "Short Sleeve Width",
          description: "Circumference around the arm for short sleeves",
          icon: ArrowsOutIcon,
          required: false,
        },
      ],
    },
    trousers: {
      title: "Trouser Measurements",
      description: "Lower body and trouser specifications",
      icon: ClipboardIcon,
      color: "warning",
      fields: [
        {
          name: "TrouserLength",
          label: "Trouser Length",
          description: "From waist to desired trouser hemline",
          icon: ArrowUpDownIcon,
          required: true,
        },
        {
          name: "ThighWidth",
          label: "Thigh Width",
          description: "Around the fullest part of the thigh",
          icon: ArrowsOutIcon,
          required: false,
        },
        {
          name: "KneeWidth",
          label: "Knee Width",
          description: "Around the knee area",
          icon: ArrowsOutIcon,
          required: false,
        },
        {
          name: "AnkleWidth",
          label: "Ankle Width",
          description: "Around the ankle area",
          icon: ArrowsOutIcon,
          required: false,
        },
      ],
    },
  };

  // Get progress statistics
  const getProgress = () => {
    if (!measurements) return { completed: 0, total: 0, percentage: 0 };

    const allFields = Object.values(measurementCategories).flatMap(
      (cat) => cat.fields
    );
    const requiredFields = allFields.filter((field) => field.required);
    const completedRequired = requiredFields.filter(
      (field) => measurements[field.name]
    ).length;
    const totalCompleted = allFields.filter(
      (field) => measurements[field.name]
    ).length;

    return {
      completed: totalCompleted,
      total: allFields.length,
      requiredCompleted: completedRequired,
      requiredTotal: requiredFields.length,
      percentage: Math.round((totalCompleted / allFields.length) * 100),
      requiredPercentage: Math.round(
        (completedRequired / requiredFields.length) * 100
      ),
    };
  };

  const progress = getProgress();

  // Input Field Component
  const MeasurementInput = ({ field }) => {
    const IconComponent = field.icon;
    const fieldValue = watchedValues[field.name];
    const hasError = errors[field.name];
    const isCompleted = fieldValue && fieldValue > 0;

    return (
      <div className="form-control">
        <label className="label">
          <span
            className={`label-text font-medium flex items-center gap-2 ${
              field.required ? "text-primary" : ""
            }`}
          >
            <IconComponent className="w-4 h-4" />
            {field.label}
            {field.required && <span className="text-error">*</span>}
          </span>
          <span className="label-text-alt">
            {unit === "inches" ? "in" : "cm"}
          </span>
        </label>
        <div className="relative">
          <input
            {...register(field.name, {
              required: field.required ? `${field.label} is required` : false,
              min: {
                value: 0,
                message: "Measurement must be positive",
              },
              valueAsNumber: true,
            })}
            type="number"
            step="0.1"
            className={`input input-bordered input-lg w-full pr-12 bg-base-100/80 backdrop-blur-sm transition-all duration-300 ${
              hasError
                ? "input-error"
                : isCompleted
                ? "input-success border-success/50"
                : "focus:border-primary"
            } ${!isEditing ? "input-disabled" : ""}`}
            disabled={!isEditing}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
          {isCompleted && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <CheckCircleIcon className="w-5 h-5 text-success" />
            </div>
          )}
        </div>
        {hasError && (
          <label className="label">
            <span className="label-text-alt text-error">
              {hasError.message}
            </span>
          </label>
        )}
        <label className="label">
          <span className="label-text-alt text-base-content/60 text-xs">
            {field.description}
          </span>
        </label>
      </div>
    );
  };

  // Category Card Component
  const CategoryCard = ({ categoryKey, category, isActive }) => {
    const IconComponent = category.icon;
    const completedFields = category.fields.filter(
      (field) => measurements?.[field.name] && measurements[field.name] > 0
    ).length;
    const totalFields = category.fields.length;
    const requiredFields = category.fields.filter((field) => field.required);
    const completedRequired = requiredFields.filter(
      (field) => measurements?.[field.name] && measurements[field.name] > 0
    ).length;

    return (
      <button
        onClick={() => setActiveCategory(categoryKey)}
        className={`card bg-gradient-to-br shadow-xl border transition-all duration-300 hover:shadow-2xl group text-left w-full ${
          isActive
            ? `from-${category.color}/20 to-${category.color}/5 border-${category.color}/30 shadow-${category.color}/20`
            : "from-base-100 to-base-50 border-base-300/50 hover:border-primary/30"
        }`}
      >
        <div className="card-body p-4">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`p-2 rounded-xl ${
                isActive ? `bg-${category.color}/20` : "bg-base-200"
              } transition-all duration-300`}
            >
              <IconComponent
                className={`w-5 h-5 ${
                  isActive ? `text-${category.color}` : "text-base-content"
                }`}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{category.title}</h3>
              <p className="text-xs text-base-content/60">
                {category.description}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Progress</span>
              <span className="font-medium">
                {completedFields}/{totalFields}
              </span>
            </div>
            <div className="w-full bg-base-300 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 bg-${category.color}`}
                style={{ width: `${(completedFields / totalFields) * 100}%` }}
              ></div>
            </div>
            {requiredFields.length > 0 && (
              <div className="text-xs text-base-content/70">
                Required: {completedRequired}/{requiredFields.length}
                {completedRequired === requiredFields.length && (
                  <CheckCircleIcon className="w-3 h-3 text-success inline ml-1" />
                )}
              </div>
            )}
          </div>
        </div>
      </button>
    );
  };

  // Measurement Guide Modal
  const MeasurementGuide = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card bg-gradient-to-br from-base-100 to-base-200 w-full max-w-4xl shadow-2xl border border-primary/20 max-h-[90vh] overflow-y-auto">
        <div className="card-body p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-xl">
                <BookOpenIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="card-title text-xl">Measurement Guide</h3>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="btn btn-ghost btn-sm btn-circle hover:bg-error/20 hover:text-error transition-all duration-300"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-8">
            <div className="alert alert-info">
              <InformationCircleIcon className="w-5 h-5" />
              <div>
                <h4 className="font-semibold">Important Tips</h4>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Use a flexible measuring tape</li>
                  <li>• Stand straight with arms relaxed</li>
                  <li>• Don't pull the tape too tight</li>
                  <li>• Measure over appropriate undergarments</li>
                  <li>• Have someone help you for accuracy</li>
                </ul>
              </div>
            </div>

            {Object.entries(measurementCategories).map(([key, category]) => (
              <div key={key} className="space-y-4">
                <div className="flex items-center gap-3">
                  <category.icon className={`w-6 h-6 text-${category.color}`} />
                  <h4 className="text-lg font-semibold">{category.title}</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.fields.map((field) => (
                    <div
                      key={field.name}
                      className="p-4 bg-base-100/50 rounded-xl"
                    >
                      <h5 className="font-medium mb-2">{field.label}</h5>
                      <p className="text-sm text-base-content/70">
                        {field.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-6 border-t">
            <button
              onClick={() => setShowGuide(false)}
              className="btn btn-primary"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (measurementsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (measurementsError && measurementsError.response?.status !== 404) {
    return (
      <div className="min-h-screen bg-base-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="alert alert-error">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span>
              Failed to load measurements: {measurementsError.message}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const activeCategory_ = measurementCategories[activeCategory];

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 p-4 md:p-6 lg:p-8">
      <SEO
        title="My Measurements - FashionSmith"
        description="Manage your body measurements for perfect custom tailoring and bespoke clothing."
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
            My Measurements
          </h1>
          <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
            Precise measurements for perfect bespoke tailoring
          </p>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-primary/10 to-primary/5 shadow-xl border border-primary/20">
            <div className="card-body p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <CheckCircleIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{progress.percentage}%</h3>
                  <p className="text-sm text-base-content/70">Complete</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-accent/10 to-accent/5 shadow-xl border border-accent/20">
            <div className="card-body p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/20 rounded-xl">
                  <RulerIcon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">
                    {progress.completed}/{progress.total}
                  </h3>
                  <p className="text-sm text-base-content/70">Measurements</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-success/10 to-success/5 shadow-xl border border-success/20">
            <div className="card-body p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-success/20 rounded-xl">
                  <CheckIcon className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">
                    {progress.requiredPercentage}%
                  </h3>
                  <p className="text-sm text-base-content/70">Required</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category Navigation */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Categories</h2>
                <button
                  onClick={() => setShowGuide(true)}
                  className="btn btn-outline btn-sm gap-2"
                >
                  <BookOpenIcon className="w-4 h-4" />
                  Guide
                </button>
              </div>

              {Object.entries(measurementCategories).map(([key, category]) => (
                <CategoryCard
                  key={key}
                  categoryKey={key}
                  category={category}
                  isActive={activeCategory === key}
                />
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Active Category Header */}
              <div className="card bg-gradient-to-br from-base-100 to-base-50 shadow-xl border border-base-300/50">
                <div className="card-body p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 bg-${activeCategory_.color}/20 rounded-xl`}
                      >
                        <activeCategory_.icon
                          className={`w-6 h-6 text-${activeCategory_.color}`}
                        />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">
                          {activeCategory_.title}
                        </h2>
                        <p className="text-base-content/70">
                          {activeCategory_.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Unit Toggle */}
                      <div className="form-control">
                        <label className="label cursor-pointer gap-2">
                          <span className="label-text">Inches</span>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={unit === "cm"}
                            onChange={(e) =>
                              setUnit(e.target.checked ? "cm" : "inches")
                            }
                            disabled={!isEditing}
                          />
                          <span className="label-text">CM</span>
                        </label>
                      </div>

                      {/* Action Buttons */}
                      {!isEditing ? (
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="btn btn-primary gap-2"
                          >
                            <PencilIcon className="w-5 h-5" />
                            {measurements ? "Edit" : "Add"} Measurements
                          </button>
                          {measurements && (
                            <button
                              type="button"
                              onClick={handleDelete}
                              className="btn btn-error btn-outline gap-2"
                              disabled={deleteMeasurementsMutation.isPending}
                            >
                              <XIcon className="w-5 h-5" />
                              Delete All
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            className="btn btn-success gap-2"
                            disabled={saveMeasurementsMutation.isPending}
                          >
                            {saveMeasurementsMutation.isPending ? (
                              <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                              <CheckIcon className="w-5 h-5" />
                            )}
                            Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="btn btn-outline gap-2"
                          >
                            <XIcon className="w-5 h-5" />
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Measurement Fields */}
              <div className="card bg-gradient-to-br from-base-100 to-base-50 shadow-xl border border-base-300/50">
                <div className="card-body p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {activeCategory_.fields.map((field) => (
                      <MeasurementInput key={field.name} field={field} />
                    ))}
                  </div>

                  {activeCategory_.fields.length === 0 && (
                    <div className="text-center py-12">
                      <RulerIcon className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        No Fields Available
                      </h3>
                      <p className="text-base-content/70">
                        This category doesn't have any measurement fields yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Measurement Guide Modal */}
        {showGuide && <MeasurementGuide />}

        {/* Help Section */}
        <div className="mt-12 card bg-gradient-to-br from-info/10 to-info/5 shadow-xl border border-info/20">
          <div className="card-body p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <InformationCircleIcon className="w-8 h-8 text-info" />
              <h3 className="text-2xl font-bold">Need Help?</h3>
            </div>
            <p className="text-base-content/70 mb-6 max-w-2xl mx-auto">
              Accurate measurements are crucial for perfect fit. If you're
              unsure about any measurement, consider visiting a professional
              tailor or contact our support team.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowGuide(true)}
                className="btn btn-info gap-2"
              >
                <BookOpenIcon className="w-5 h-5" />
                View Measurement Guide
              </button>
              <button className="btn btn-outline gap-2">
                <UserIcon className="w-5 h-5" />
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
