export default function UnderlineNavLink({ children }) {
  return (
    <div className="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 ">
      {children}
    </div>
  );
}
