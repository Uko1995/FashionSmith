import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import LoginModal from "./Login";
import RegisterModal from "./Register";
import Footer from "../components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export default function HomePage() {
  return (
    <>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen ">
        <NavBar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}
