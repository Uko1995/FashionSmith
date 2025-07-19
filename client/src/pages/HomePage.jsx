import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import LoginModal from "./Login";
import RegisterModal from "./Register";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen pt-16">
      <NavBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
