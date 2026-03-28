import { Link, useParams } from "react-router-dom";
import logo from "../assets/logo.png";
import crystalBall from "../assets/crystalball.png";

function UserPredictions() {
  const { name, sport } = useParams();

  const formattedName = name
    ? name.charAt(0).toUpperCase() + name.slice(1)
    : "";

  const formattedSport = sport ? sport.toUpperCase() : "";

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <header className="sticky top-0 z-20 border-b border-[#1DCD9F]/30 bg-[#222222]/95 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4">
          <div className="flex items-center">
            <Link to="/">
              <img
                src={crystalBall}
                alt="Crystal Ball"
                className="h-9 w-9 object-contain sm:h-10 sm:w-10 md:h-11 md:w-11"
              />
            </Link>
          </div>

          <div className="flex justify-center">
            <Link
              to="/"
              className="rounded-full px-3 py-1 shadow-[0_0_24px_rgba(29,205,159,0.14)]"
            >
              <img
                src={logo}
                alt="Papa Predictions"
                className="h-8 w-auto object-contain sm:h-10 md:h-12"
              />
            </Link>
          </div>

          <div className="w-[84px] sm:w-[92px]" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            {formattedName}
          </h1>
          <p className="mt-2 text-lg text-slate-300 sm:text-xl">
            {formattedSport} Predictions
          </p>
        </div>
      </main>
    </div>
  );
}

export default UserPredictions;
