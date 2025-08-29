import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  PaperPlaneTiltIcon,
  CheckCircleIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";

import RedAsterix from "./RedAsterix";
import { emailAPI } from "@/services/api";

export default function Contacts() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const response = await emailAPI.sendEmail(data);
      console.log(response);

      if (response.status === 200) {
        setIsSubmitted(true);

        toast.success(response?.data?.message);
        reset();
      } else {
        toast.error(response?.data?.message);
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("EmailJS error:", error);
      toast.error(
        `Email failed: ${error.text || error.message || "Unknown error"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <PhoneIcon size={24} />,
      title: "Phone",
      details: ["+234 807 116 7444"],
      color: "text-primary",
    },
    {
      icon: <WhatsappLogoIcon size={24} />,
      title: "WhatsApp",
      details: ["+234 807 116 7444"],
      color: "text-success",
      link: "https://wa.me/2348071167444",
    },
    {
      icon: <EnvelopeIcon size={24} />,
      title: "Email",
      details: ["fashionsmith.bespoke@gmail.com"],
      color: "text-secondary",
    },
    {
      icon: <MapPinIcon size={24} />,
      title: "Address",
      details: ["Lagos, Nigeria"],
      color: "text-accent",
    },
    {
      icon: <ClockIcon size={24} />,
      title: "Business Hours",
      details: ["Mon - Fri: 9:00 AM - 6:00 PM", "Sat: 10:00 AM - 4:00 PM"],
      color: "text-info",
    },
  ];

  return (
    <section className="py-6 md:py-12 w-full lg:py-16 px-4 bg-gradient-to-br from-base-100 to-base-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-base-content mb-4">
            Get In Touch
          </h2>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Have questions about our services? Want to place a custom order?
            We'd love to hear from you. Send us a message and we'll respond as
            soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-base-content mb-6">
                Contact Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {contactInfo.map((item, index) => (
                  <div
                    key={index}
                    className="bg-base-100 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className={`${item.color} mb-3`}>{item.icon}</div>
                    <h4 className="font-semibold text-base-content mb-2">
                      {item.title}
                    </h4>
                    {item.details.map((detail, idx) => (
                      <div key={idx}>
                        {item.link ? (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-success hover:text-success/80 text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                          >
                            {detail}
                            <span className="text-xs">↗</span>
                          </a>
                        ) : (
                          <p className="text-base-content/70 text-sm">
                            {detail}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-base-100 rounded-xl shadow-md overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <div className="text-center">
                  <MapPinIcon size={48} className="text-primary mx-auto mb-2" />
                  <p className="text-base-content/70">
                    Interactive Map Coming Soon
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-base-100 p-4 md:p-6 lg:p-8 rounded-xl shadow-lg">
            <h3 className="text-xl md:text-2xl font-bold text-base-content mb-4 md:mb-6">
              Send us a Message
            </h3>

            {/* Success Message */}
            {isSubmitted && (
              <div className="alert alert-success mb-6">
                <CheckCircleIcon size={24} />
                <span>
                  Message sent successfully! We'll get back to you soon.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Fields */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">First Name </span>
                    <RedAsterix />
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered w-full ${
                      errors.firstName ? "input-error" : ""
                    }`}
                    placeholder="John"
                    {...register("firstName", {
                      required: "First name is required",
                      minLength: {
                        value: 2,
                        message: "First name must be at least 2 characters",
                      },
                    })}
                  />
                  {errors.firstName && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.firstName.message}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Last Name </span>
                    <RedAsterix />
                  </label>
                  <input
                    type="text"
                    className={`input input-bordered w-full ${
                      errors.lastName ? "input-error" : ""
                    }`}
                    placeholder="Doe"
                    {...register("lastName", {
                      required: "Last name is required",
                      minLength: {
                        value: 2,
                        message: "Last name must be at least 2 characters",
                      },
                    })}
                  />
                  {errors.lastName && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.lastName.message}
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email Address</span>
                  <RedAsterix />
                </label>
                <input
                  type="email"
                  className={`input input-bordered w-full ${
                    errors.email ? "input-error" : ""
                  }`}
                  placeholder="john.doe@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.email.message}
                    </span>
                  </label>
                )}
              </div>

              {/* Subject */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Subject</span>
                  <RedAsterix />
                </label>
                <select
                  className={`select select-bordered w-full ${
                    errors.subject ? "select-error" : ""
                  }`}
                  {...register("subject", {
                    required: "Please select a subject",
                  })}
                >
                  <option value="">Choose a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="custom-order">Custom Order</option>
                  <option value="measurements">Measurements Help</option>
                  <option value="delivery">Delivery Information</option>
                  <option value="complaint">Complaint</option>
                  <option value="other">Other</option>
                </select>
                {errors.subject && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.subject.message}
                    </span>
                  </label>
                )}
              </div>

              {/* Message */}
              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text font-medium">Message </span>
                  <RedAsterix />
                </label>
                <textarea
                  className={`textarea textarea-bordered h-32 w-full resize-none ${
                    errors.message ? "textarea-error" : ""
                  }`}
                  placeholder="Tell us more about your inquiry..."
                  {...register("message", {
                    required: "Message is required",
                    minLength: {
                      value: 10,
                      message: "Message must be at least 10 characters",
                    },
                  })}
                ></textarea>
                {errors.message && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.message.message}
                    </span>
                  </label>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full"
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Sending Message...
                  </>
                ) : (
                  <>
                    <PaperPlaneTiltIcon size={20} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
