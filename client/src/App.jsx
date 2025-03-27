import Header from "./components/HeaderComponents";
import { Logo, Nav } from "./components/HeaderComponents";
import Footer from "./components/FooterComponents";
import { ArrowUp } from "./components/FooterComponents";
import "./App.css";
import { Main } from "./components/Main";

export default function App() {
  return (
    <>
      <Header>
        <Logo />
        <Nav capitalize="capitalize" color="#e43d12" className="">
          <ul className="nav">
            <li>Login</li>
            <li>Sign Up</li>
            <li>Collections</li>
            <li>About</li>
          </ul>
        </Nav>
      </Header>
      <Main />
      <Footer>
        <ArrowUp />
        <div>
          <Nav color="#e43d12">
            <ul className="nav">
              <li>Login</li>
              <li>Sign Up</li>
              <li>Collections</li>
              <li>About</li>
            </ul>
          </Nav>
          <Nav color="#e43d12">
            <ul className="nav">
              <li>facebook</li>
              <li>Instagram</li>
              <li>Gmail</li>
              <li>Whatsapp</li>
            </ul>
          </Nav>
        </div>
      </Footer>
    </>
  );
}
