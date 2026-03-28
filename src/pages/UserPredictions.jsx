import { Link, useParams } from "react-router-dom";
import logo from "../assets/logo.png";
import crystalBall from "../assets/crystalball.png";

function UserPredictions() {
  const { name, sport } = useParams();

  const formattedName = name
    ? name.charAt(0).toUpperCase() + name.slice(1)
    : "";

  const formattedSport = sport ? sport.toUpperCase() : "";

  const isNFL = formattedSport === "NFL";

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

      <main className="mx-auto max-w-7xl px-4 py-10 text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">{formattedName}</h1>

        {isNFL ? (
          <p className="mt-4 text-xl text-[#1DCD9F] sm:text-2xl">
            NFL Predictions Coming Soon
          </p>
        ) : (
          <p className="mt-4 text-xl text-slate-300 sm:text-2xl">
            {formattedSport} Predictions
          </p>
        )}
      </main>
    </div>
  );
}

export default UserPredictions;
