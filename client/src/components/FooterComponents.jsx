export default function Footer({ children }) {
  return <footer>{children}</footer>;
}

export function ArrowUp() {
  return (
    <div style={{ justifyItems: "center" }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#E43D12"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" fill="none" opacity="0.9" />
        <path d="M16 12l-4-4-4 4M12 16V8" stroke="#E43D12" />
      </svg>
    </div>
  );
}
