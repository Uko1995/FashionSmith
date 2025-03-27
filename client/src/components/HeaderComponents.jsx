export default function Header({ children }) {
  return <div className="header">{children}</div>;
}

export function Logo() {
  return <h2 className="logo">FashionSmith</h2>;
}

const nav = {
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  listStyleType: "none",
  fontSize: "1rem",
};

export function Nav({ children, capitalize = "none", color = "", font = "" }) {
  return (
    <div style={{ ...nav, textTransform: capitalize, color, fontFamily: font }}>
      {children}
    </div>
  );
}
