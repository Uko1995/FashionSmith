import { ShoppingCartIcon } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { useUiStore } from "../store/uiStore";

export default function NavbarCart() {
  const { getCartItemsCount } = useUiStore();
  const itemCount = getCartItemsCount();

  return (
    <Link to="/cart" className="relative inline-block hover:opacity-80">
      <ShoppingCartIcon size={20} weight="bold" />

      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
