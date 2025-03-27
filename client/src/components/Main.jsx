export function Main() {
  return (
    <div className="main">
      <Hero />
    </div>
  );
}

function Hero() {
  return (
    <div className="hero" style={{}}>
      <h1>Refine Your Style</h1>
      <h2>bespoke tailored outfits just for you</h2>
      <Button
        bgColor="none"
        padding="10px 25px"
        fontSize="1rem"
        fontFamily="Cinzel Decorative"
      >
        Place Your Order
      </Button>
    </div>
  );
}

export function Button({
  children,
  fontSize = "",
  fontFamily = "",
  bgColor = "",
  padding = "",
  margin = "",
}) {
  const buttonStyles = {
    backgroundColor: bgColor,
    padding: padding,
    margin: margin,
    cursor: "pointer",
    fontSize: fontSize,
    fontFamily: fontFamily,
    border: "1px solid #fd0a02",
    borderRadius: "10px",
    color: "#fd0a02",
    fontWeight: "900",
  };
  return <button style={buttonStyles}>{children}</button>;
}
