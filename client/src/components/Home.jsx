import AppGuide from "./AppGuide";
import Contacts from "./Contacts";
import Hero from "./Hero";
import ProductAndService from "./ProductAndService";

export default function Home() {
  return (
    <div className="space-y-8 md:space-y-16 lg:space-y-20">
      <Hero />
      <AppGuide />
      <ProductAndService />
      <Contacts />
    </div>
  );
}
