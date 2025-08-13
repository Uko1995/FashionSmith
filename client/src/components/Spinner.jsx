import FashionSmithLogo from "./FashionSmithLogo";

export default function Spinner() {
  return (
    <div className="grid h-screen place-items-center bg-base-100">
      <div className="flex flex-col items-center space-y-4">
        <FashionSmithLogo className="animate-pulse w-20 h-20 text-primary" />
        <div className="text-sm text-base-content/60 animate-pulse">
          Loading...
        </div>
      </div>
    </div>
  );
}
