import { useNavigate } from "react-router-dom";
import {
  CaretCircleLeftIcon,
  HouseLineIcon,
  LineVerticalIcon,
  PersonSimpleRunIcon,
} from "@phosphor-icons/react";

export default function ErrorElement() {
  const navigate = useNavigate();

  return (
    <div
      data-theme="fantasy"
      className="flex bg-base-100 text-base-content flex-col items-center justify-center min-h-screen"
    >
      <div className="flex justify-center items-center mb-8 animate-bounce">
        <PersonSimpleRunIcon weight="bold" size={90} />
        <LineVerticalIcon weight="bold" size={90} />
        <PersonSimpleRunIcon mirrored weight="bold" size={90} />
      </div>
      <h1 className="lg:text-5xl font-bold">
        <span className="text-accent">Oops!!!</span> Something went wrong.
      </h1>
      <h2 className="text-xl mt-4">
        We couldn't find the page you were looking for.
      </h2>
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          className="btn btn-primary text-base"
          onClick={() => navigate(-1)}
        >
          <CaretCircleLeftIcon weight="bold" size={25} />
          Go back
        </button>
        <button
          className="btn btn-primary text-base"
          onClick={() => navigate("/")}
        >
          <HouseLineIcon weight="bold" size={25} />
          Home
        </button>
      </div>
    </div>
  );
}
