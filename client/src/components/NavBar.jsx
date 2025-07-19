import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  AddressBookIcon,
  CaretDownIcon,
  SealQuestionIcon,
} from "@phosphor-icons/react";
import UnderlineNavLink from "./UnderlineNavLink";
import NavbarWishlistIcon from "./NavBarWishList";
import NavbarCart from "./NavBarCart";

export default function NavBar() {
  const location = useLocation();
  const [className, setClassName] = useState("bg-transparent text-white");
  const ref = useRef();
  const isHomePage = location.pathname === "/" || location.pathname === "/home";

  const links = [
    { to: "/", text: "HOME" },
    { to: "/services", text: "SERVICES" },
    { to: "/about", text: "ABOUT" },
    { to: "/contacts", text: "CONTACT" },
    { to: "/faq", text: "FAQ" },
    { to: "/login", text: "LOGIN" },
    { to: "/register", text: "REGISTER" },
  ];

  useEffect(() => {
    if (isHomePage) {
      setClassName("bg-transparent text-white");
    } else {
      setClassName("bg-white text-grey-750 shadow-lg");
    }
    const handleScroll = () => {
      const nav = ref.current;
      if (!nav) return;
      if (window.scrollY > 0) {
        nav.classList.remove("bg-transparent", "text-white");
        nav.classList.add("bg-white", "text-grey-750", "shadow-lg");
      } else {
        nav.classList.remove("bg-white", "text-grey-750", "shadow-lg");
        nav.classList.add("bg-transparent", "text-white");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHomePage]);

  return (
    <header
      ref={ref}
      className={`w-full h-16 mx-auto fixed top-0 z-50 ${className}`}
    >
      <nav className="flex items-center justify-between p-4 ">
        <NavLink to="/">
          <h1 className="text-2xl font-bold">FashionSmith</h1>
        </NavLink>

        <div className="flex space-x-4 gap-4  font-semibold">
          {links.slice(0, -4).map((link) => (
            <UnderlineNavLink>
              <NavLink
                className="text-xs active:text-blue-600"
                key={link.to}
                to={link.to}
              >
                {link.text}
              </NavLink>
            </UnderlineNavLink>
          ))}
          <div className="dropdown dropdown-hover dropdown-bottom">
            <UnderlineNavLink>
              <div
                tabIndex={0}
                role="link"
                className="flex justify-center gap-1 items-start cursor-pointer text-sm"
              >
                <span className="text-xs mt-0.5">CONTACT</span>
                <CaretDownIcon weight="bold" size={20} />
              </div>
            </UnderlineNavLink>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 text-base-content  z-1 w-52 p-2 shadow-sm"
            >
              <UnderlineNavLink>
                <NavLink
                  className="text-xs  py-2 text-grey/750 flex justify-start items-center gap-1.5 active:text-blue-600"
                  key={links[3].to}
                  to={links[3].to}
                >
                  <AddressBookIcon size={16} />
                  <span className="text-grey/750 text-xs">{links[3].text}</span>
                </NavLink>
              </UnderlineNavLink>
              <UnderlineNavLink>
                <NavLink
                  className="text-xs py-1 text-grey/750 flex justify-start items-center gap-1.5 active:text-blue-600"
                  key={links[4].to}
                  to={links[4].to}
                >
                  <SealQuestionIcon size={16} />
                  <span className="text-grey/750 text-xs">{links[4].text}</span>
                </NavLink>
              </UnderlineNavLink>
            </ul>
          </div>
        </div>
        <div className="flex justify-center space-x-4 gap-1 mr-3 font-semibold">
          <UnderlineNavLink>
            <NavLink to="/login" className="text-xs active:text-blue-600">
              LOGIN
            </NavLink>
          </UnderlineNavLink>
          <NavbarWishlistIcon />
          <NavbarCart />
        </div>
      </nav>
    </header>
  );
}
