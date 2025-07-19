import {
  EnvelopeIcon,
  InstagramLogoIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";

import UnderlineNavLink from "./UnderlineNavLink";

export default function Footer() {
  return (
    <footer
      data-theme="aqua"
      className=" w-full bg-base-100 text-base-content p-4"
    >
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex flex-col items-top justify-center">
          <h1 className="text-lg font-bold">FashionSmith</h1>
          <p className="">Crafting excellence, one stitch at a time</p>
          <div className="flex gap-4 my-2">
            <a
              href="https://wa.me/+2348071167444"
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsappLogoIcon
                className="hover:opacity-85 transition-opacity "
                size={25}
                weight="duotone"
              />
            </a>
            <a href="mailto:fashionsmith.bespoke@gmail.com">
              <EnvelopeIcon
                className="hover:opacity-85 transition-opacity "
                size={25}
                weight="duotone"
              />
            </a>
            <a
              href="https://www.instagram.com/fashionsmith_bespoke/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramLogoIcon
                className="hover:opacity-85 transition-opacity "
                size={25}
                weight="duotone"
              />
            </a>
          </div>
        </div>
        <div className="flex flex-col items-top justify-center gap-2 my-2">
          <UnderlineNavLink>
            <Link to="/about"> Privacy Policy</Link>
          </UnderlineNavLink>
          <UnderlineNavLink>
            <Link to="/about"> Terms of Service</Link>
          </UnderlineNavLink>
          <UnderlineNavLink>
            <Link to="/contacts"> Contact Us</Link>
          </UnderlineNavLink>
        </div>
      </div>
      <hr className="py-3" />
      <p className="text-center">© 2025 FashionSmith. All rights reserved.</p>
    </footer>
  );
}
