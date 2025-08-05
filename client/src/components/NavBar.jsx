import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  AddressBookIcon,
  CaretDownIcon,
  SealQuestionIcon,
  ListIcon,
  XIcon,
  UserCircleIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import UnderlineNavLink from "./UnderlineNavLink";
import NavbarWishlistIcon from "./NavBarWishList";
import NavbarCart from "./NavBarCart";
import FashionSmithLogo from "./FashionSmithLogo";
import { useUiStore } from "../store/uiStore";
import useLogout from "../hooks/useLogout";

export default function NavBar() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const ref = useRef();
  const isHomePage = location.pathname === "/" || location.pathname === "/home";
  const isLoggedIn = useUiStore((state) => state.isLoggedIn);
  const user = useUiStore((state) => state.user);
  const { logout } = useLogout();
  const navigate = useNavigate();

  const links = [
    { to: "/", text: "HOME", icon: null },
    { to: "/gallery", text: "GALLERY", icon: null },
    { to: "/about", text: "ABOUT", icon: null },
    { to: "/contacts", text: "CONTACT", icon: AddressBookIcon },
    { to: "/faq", text: "FAQ", icon: SealQuestionIcon },
    { to: "/login", text: "SIGN IN", icon: null },
    { to: "/register", text: "SIGN UP", icon: null },
  ];

  const mainLinks = links.slice(0, 3);
  const contactLinks = links.slice(3, 5);
  const authLinks = links.slice(5);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Memoized scroll handler to prevent unnecessary re-renders
  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > 10;
    setIsScrolled(scrolled);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Dynamic navbar styling based on page and scroll state
  const getNavBarClass = () => {
    if (isHomePage && !isScrolled) {
      return "bg-transparent text-white backdrop-blur-none";
    }
    return "bg-white/95 text-gray-800 shadow-lg backdrop-blur-md border-b border-gray-200";
  };

  // Close mobile menu when clicking outside
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header
        ref={ref}
        className={`w-full h-16 fixed top-0 z-50 transition-all duration-300 ${getNavBarClass()}`}
      >
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 lg:px-6 h-full">
          {/* Logo */}
          <NavLink
            to="/"
            className="flex items-center"
            aria-label="FashionSmith Home"
          >
            <FashionSmithLogo
              className="h-60 -ms-10 md:-ms-20  md:h-65 w-auto"
              isScrolled={isScrolled}
              isHomePage={isHomePage}
            />
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Main Links */}
            {mainLinks.map((link) => (
              <UnderlineNavLink key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors duration-200 hover:text-accent ${
                      isActive ? "text-accent" : ""
                    }`
                  }
                >
                  {link.text}
                </NavLink>
              </UnderlineNavLink>
            ))}

            {/* Contact Dropdown */}
            <div className="dropdown dropdown-hover dropdown-bottom">
              <UnderlineNavLink>
                <div
                  tabIndex={0}
                  role="button"
                  className="flex items-center gap-1 cursor-pointer text-sm font-medium hover:text-accent transition-colors duration-200"
                  aria-label="Contact menu"
                >
                  <span>CONTACT</span>
                  <CaretDownIcon
                    size={16}
                    className="transition-transform duration-200"
                  />
                </div>
              </UnderlineNavLink>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-white shadow-xl rounded-lg border border-gray-100 w-48 p-2 mt-2"
              >
                {contactLinks.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 text-sm transition-colors duration-200 rounded-md hover:bg-primary/10 ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-gray-700"
                        }`
                      }
                    >
                      {link.icon && <link.icon size={16} />}
                      {link.text}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Desktop Auth & Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <UnderlineNavLink>
                  <NavLink
                    to="/profile"
                    aria-label="profile"
                    className={({ isActive }) =>
                      `text-sm font-medium transition-colors duration-200 hover:text-accent ${
                        isActive ? "text-accent" : ""
                      }`
                    }
                  >
                    <div className="flex items-center justify-center gap-1">
                      <UserCircleIcon size={24} />
                      {user ? user.name : ""}
                    </div>
                  </NavLink>
                </UnderlineNavLink>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-md hover:text-accent transition-colors duration-200 cursor-pointer"
                  aria-label="Logout"
                >
                  <SignOutIcon size={24} />
                </button>
              </div>
            ) : (
              authLinks.map((link) => (
                <UnderlineNavLink key={link.to}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      `text-sm font-medium transition-colors duration-200 hover:text-accent ${
                        isActive ? "text-accent" : ""
                      }`
                    }
                  >
                    {link.text}
                  </NavLink>
                </UnderlineNavLink>
              ))
            )}
            <div className="flex items-center space-x-2 ml-2">
              <NavbarWishlistIcon />
              <NavbarCart />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <XIcon size={24} /> : <ListIcon size={24} />}
          </button>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {/* {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )} */}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className={`fixed top-16 left-0 right-0 z-45 bg-white shadow-lg border-t border-gray-200 lg:hidden transform transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <nav className="max-w-7xl mx-auto px-4 py-6">
            {/* Mobile Main Links */}
            <div className="space-y-4 mb-6">
              {mainLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `block py-2 text-lg font-medium transition-colors duration-200 ${
                      isActive
                        ? "text-primary border-l-4 border-primary pl-4"
                        : "text-gray-700 hover:text-primary"
                    }`
                  }
                >
                  {link.text}
                </NavLink>
              ))}
            </div>

            {/* Mobile Contact Section */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Contact & Support
              </h3>
              <div className="space-y-2">
                {contactLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 py-2 text-base transition-colors duration-200 ${
                        isActive
                          ? "text-primary"
                          : "text-gray-700 hover:text-primary"
                      }`
                    }
                  >
                    {link.icon && <link.icon size={18} />}
                    {link.text}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Mobile Auth & Actions */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex flex-col space-y-4">
                {authLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `py-2 text-lg font-medium transition-colors duration-200 ${
                        isActive
                          ? "text-primary"
                          : "text-gray-700 hover:text-primary"
                      }`
                    }
                  >
                    {link.text}
                  </NavLink>
                ))}
                <div className="flex items-center justify-center space-x-6 pt-4">
                  <NavbarWishlistIcon />
                  <NavbarCart />
                </div>
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
