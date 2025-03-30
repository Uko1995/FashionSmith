import { useState } from "react";

export default function Header() {
  const [scrolling, setScrolling] = useState(false);
  const handleScroll = () => {
    if (window.scrollY > 72) {
      setScrolling(true);
    } else {
      setScrolling(false);
    }
  };
  window.addEventListener("scroll", handleScroll);

  return (
    <div
      className={`flex justify-between items-center top-0 sticky my-4 ${
        scrolling ? "bg-[#e43d12] text-white py-4" : "bg-transparent"
      } transition duration-300 ease-in-out`}
    >
      <Logo>
        <span className={`${scrolling ? "text-white" : "text-[#e43d12]"}`}>
          Fashion
        </span>
        <span className={`${scrolling ? "text-[#f7b79a]" : "text-[#f0763d]"}`}>
          Smith
        </span>
      </Logo>
      <Navs scrolling={scrolling} />
      <Login0rSignUp scrolling={scrolling} />
    </div>
  );
}

function Logo({ children }) {
  return (
    <div className="font-[Merienda] text-2xl italic font-bold ml-2">
      {children}
    </div>
  );
}

function Navs({ scrolling }) {
  return (
    <div
      className={`flex justify-center items-center gap-4 ${
        scrolling ? "text-white font-semibold" : "text-[#e43d12]"
      }`}
    >
      <a className="hover:border-b-1" href="#">
        Home
      </a>
      <a className="hover:border-b-1" href="#">
        Collections
      </a>
      <a className="hover:border-b-1" href="#">
        About
      </a>
    </div>
  );
}

function Login0rSignUp({ scrolling }) {
  return (
    <div className="flex justify-around items-center gap-4 mr-2">
      <button
        className={`hover:border-b-1 cursor-pointer ${
          scrolling ? "text-white font-semibold" : "text-[#e43d12]"
        }`}
      >
        Login
      </button>
      <button
        className={` cursor-pointer p-2 mr-2 rounded ${
          scrolling
            ? "bg-white text-[#e43d12] hover:font-bold"
            : "bg-[#e43d12] text-white"
        }`}
      >
        Sign Up
      </button>
    </div>
  );
}
