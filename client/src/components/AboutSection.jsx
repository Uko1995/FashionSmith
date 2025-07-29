import { CheckCircleIcon } from "@phosphor-icons/react";

export default function AboutSection() {
  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-3 animate-fade-in animation-delay-700">
        {[
          "Premium Nigerian Fabrics",
          "Expert Craftsmanship",
          "Perfect Custom Fit",
          "Cultural Authenticity",
        ].map((feature) => (
          <div key={feature} className="flex items-center gap-2">
            <CheckCircleIcon size={16} className="text-accent flex-shrink-0" />
            <span className="text-white/80 text-sm">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
