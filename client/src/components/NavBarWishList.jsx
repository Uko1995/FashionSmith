import { HeartIcon } from "@phosphor-icons/react";
import { Link } from "react-router-dom"; // or use Next.js `Link`

export default function NavbarWishlistIcon() {
  return (
    <Link to="/wishlist" className="relative inline-block hover:opacity-80">
      <HeartIcon size={20} weight="bold" />

      <span className=" absolute -top-2 -right-2 bg-base-300 text-base-content text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {0} {/* Replace with actual wishlist count */}
      </span>
    </Link>
  );
}
