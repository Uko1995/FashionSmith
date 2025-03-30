import pic1 from "../assets/pic-blurred.webp";

export default function Main() {
  return (
    <div className=" m-4">
      <Hero />
    </div>
  );
}

function Hero() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-6 h-auto p-6 w-full">
      {/* Left Content */}
      <div className="w-full md:w-1/2 text-center md:text-left">
        <h1 className="font-[Work Sans] text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 leading-tight">
          DISCOVER YOUR STYLE
        </h1>
        <h3 className="italic font-bold text-lg sm:text-xl md:text-2xl text-[#e43d12] my-4 font-[Playfair]">
          Fashion is not just about clothes, it's about expressing yourself
        </h3>
        <button className="px-6 py-3 md:px-8 md:py-3 text- border-[#e43d12] border-1 font-semibold text-lg rounded-lg hover:bg-[#e43d12] hover:text-white transition duration-400">
          Make an Order
        </button>
      </div>

      {/* Right Image Section */}
      <div className="w-full md:w-1/2 flex justify-center">
        <Image
          picture={pic1}
          className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
}

function Image({ picture }) {
  return (
    <img src={picture} className="w-fit h-fit object-cover mx-auto" alt="pic" />
  );
}
