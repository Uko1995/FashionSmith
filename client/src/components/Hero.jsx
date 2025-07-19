export default function Hero() {
  return (
    <section className="bg-[url('FashionSmith.png')]  -mt-16 w-full min-h-screen bg-cover bg-no-repeat flex flex-col items-start justify-center lg: pt-60 lg:ps-5">
      <div className="text-left tracking-wide  text-white space-y-1 font-extrabold text-4xl md:text-6xl lg:text-7xl">
        <h1 className="">CRAFT YOUR</h1>
        <h1 className="text-accent text-shadow-xl text-shadow-base-content">
          STYLE
        </h1>
      </div>
      <p className="text-white lg:text-lg max-w-2xl lg:mt-6 font-semibold">
        Experience the art of bespoke tailoring where every stitch tells a story
        of excellence, precision, and personal style
      </p>
      <div>
        <button className="btn btn-neutral mt-6 text-white font-bold btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl">
          Get Started
        </button>
        <button className="btn btn-accent ml-4 mt-6 text-white font-bold btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl ">
          View Services
        </button>
      </div>
    </section>
  );
}
