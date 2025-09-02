import {
  EnvelopeIcon,
  InstagramLogoIcon,
  WhatsappLogoIcon,
  MapPinIcon,
  PhoneIcon,
  CrownIcon,
  SparkleIcon,
  HeartIcon,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "About Us", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Gallery", path: "/gallery" },
    { name: "Contact", path: "/contact" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
    { name: "Size Guide", path: "/size-guide" },
    { name: "FAQ", path: "/faq" },
  ];

  return (
    <footer data-theme="fantasy" className="relative overflow-hidden">
      {/* Decorative Background Elements */}

      <div className="absolute top-10 right-10 opacity-5">
        <CrownIcon size={120} />
      </div>

      <div className="relative z-10 bg-base-200/90 text-base-content backdrop-blur-sm">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 lg:py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-1 space-y-6">
              <div className="flex items-center justify-start">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 cursor-default">
                  FashionSmith
                </h2>
              </div>

              <p className="text-base-content/90 leading-relaxed">
                Where traditional Nigerian craftsmanship meets contemporary
                elegance. Creating timeless pieces that tell your unique story
                through exceptional tailoring.
              </p>

              {/* Social Media */}
              <div className="space-y-3">
                <h4 className="font-semibold text-base-content flex items-center gap-2">
                  <HeartIcon size={18} className="text-red-500" />
                  Connect With Us
                </h4>
                <div className="flex gap-3">
                  <a
                    href="https://wa.me/+2348071167444"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-circle btn-outline btn-sm hover:btn-success hover:scale-110 transition-all duration-300"
                    aria-label="WhatsApp"
                  >
                    <WhatsappLogoIcon size={18} />
                  </a>
                  <a
                    href="mailto:fashionsmith.bespoke@gmail.com"
                    className="btn btn-circle btn-outline btn-sm hover:btn-primary hover:scale-110 transition-all duration-300"
                    aria-label="Email"
                  >
                    <EnvelopeIcon size={18} />
                  </a>
                  <a
                    href="https://www.instagram.com/fashionsmith_bespoke/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-circle btn-outline btn-sm hover:btn-secondary hover:scale-110 transition-all duration-300"
                    aria-label="Instagram"
                  >
                    <InstagramLogoIcon size={18} />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-base-content border-l-4 border-primary pl-3">
                Quick Links
              </h3>
              <div className="space-y-3">
                {quickLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="block text-base-content/90 hover:text-primary hover:translate-x-2 transition-all duration-300 group"
                  >
                    <span className="group-hover:border-b border-primary/50">
                      {link.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Legal & Support */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-base-content border-l-4 border-secondary pl-3">
                Support & Legal
              </h3>
              <div className="space-y-3">
                {legalLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="block text-base-content/90 hover:text-secondary hover:translate-x-2 transition-all duration-300 group"
                  >
                    <span className="group-hover:border-b border-secondary/50">
                      {link.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-base-content border-l-4 border-accent pl-3">
                Get In Touch
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 group">
                  <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors duration-300">
                    <MapPinIcon size={20} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-base-content/90 leading-relaxed">
                      Lagos, Nigeria
                      <br />
                      <span className="text-sm text-base-content/80">
                        Available for consultations
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-300">
                    <PhoneIcon size={20} className="text-primary" />
                  </div>
                  <div>
                    <a
                      href="tel:+2348071167444"
                      className="text-base-content/90 hover:text-primary transition-colors duration-300"
                    >
                      +234 807 116 7444
                    </a>
                    <p className="text-sm text-base-content/80">
                      Mon - Sat, 9AM - 6PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="p-2 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors duration-300">
                    <EnvelopeIcon size={20} className="text-secondary" />
                  </div>
                  <div>
                    <a
                      href="mailto:fashionsmith.bespoke@gmail.com"
                      className="text-base-content/90 hover:text-secondary transition-colors duration-300 break-all"
                    >
                      fashionsmith.bespoke@gmail.com
                    </a>
                    <p className="text-sm text-base-content/80">
                      We'll respond within 24hrs
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-base-content/50 bg-base-200/50">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 lg:py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
              {/* Copyright */}
              <div className="text-center md:text-left">
                <p className="text-base-content/90">
                  © {currentYear}{" "}
                  <span className="font-semibold text-primary">
                    FashionSmith
                  </span>
                  . All rights reserved.
                </p>
                <p className="text-sm text-base-content/90 mt-1">
                  Crafting excellence, one stitch at a time ✨
                </p>
              </div>

              {/* Credits */}
              <div className="text-center md:text-right">
                <p className="text-sm text-base-content/90">
                  Made with{" "}
                  <HeartIcon size={14} className="inline text-red-500 mx-1" />
                  for fashion enthusiasts
                </p>
                <p className="text-xs text-base-content/70 mt-1">
                  Nigerian Heritage • Global Standards
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
