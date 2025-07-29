export default function Spinner() {
  const colorClasses = [
    "text-primary",
    "text-secondary",
    "text-accent",
    "text-neutral",
    "text-info",
    "text-success",
    "text-warning",
    "text-error",
  ];

  const SpinnerRow = () => (
    <div className="space-x-2">
      {colorClasses.map((colorClass, index) => (
        <span
          key={index}
          className={`loading w-10 loading-infinity ${colorClass} text-xl`}
        />
      ))}
    </div>
  );

  return (
    <div className="grid h-screen place-items-center">
      <div className="space-y-2">
        <SpinnerRow />
        <SpinnerRow />
        <SpinnerRow />
      </div>
    </div>
  );
}
