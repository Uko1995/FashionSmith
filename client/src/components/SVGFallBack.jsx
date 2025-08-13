import FashionSmithLogo from "./FashionSmithLogo";

const SVGFallback = () => (
  <div className="flex h-screen justify-center items-center bg-base-100">
    <FashionSmithLogo className="animate-pulse size-3/5 text-primary" />
  </div>
);

export default SVGFallback;
