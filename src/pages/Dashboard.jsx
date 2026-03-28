import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

import alexAvatar from "../assets/alexIcon.png";
import dennisAvatar from "../assets/dennisIcon.png";
import jerryAvatar from "../assets/jerryIcon.png";
import alexFont from "../assets/alexfont.png";
import dennisFont from "../assets/dennisfont.png";
import jerryFont from "../assets/jerryfont.png";
import logo from "../assets/logo.png";
import crystalBall from "../assets/crystalball.png";
import mlbLogo from "../assets/mlb.png";
import nflLogo from "../assets/nfl.png";
import { Link } from "react-router-dom";

function Dashboard() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const avatarMap = {
    Alex: alexAvatar,
    Dennis: dennisAvatar,
    Jerry: jerryAvatar,
  };

  const nameImageMap = {
    Alex: alexFont,
    Dennis: dennisFont,
    Jerry: jerryFont,
  };

  const quoteMap = {
    Alex: "“Urm, actually... according to my calculations these predictions are correct”",
    Dennis: "“RIP the legand Paul Rizzuto”",
    Jerry: "“You mess with me you get the bull!”",
  };

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("display_name", { ascending: true });

      if (error) {
        console.error("Error fetching profiles:", error);
      } else {
        setProfiles(data);
      }

      setLoading(false);
    };

    fetchProfiles();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] p-6 text-white">Loading...</div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <header className="sticky top-0 z-20 border-b border-[#1DCD9F]/30 bg-[#222222]/95 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4">
          <div className="flex items-center">
            <img
              src={crystalBall}
              alt="Crystal Ball"
              className="h-9 w-9 object-contain sm:h-10 sm:w-10 md:h-11 md:w-11"
            />
          </div>

          <div className="flex justify-center">
            <div className="rounded-full px-3 py-1 shadow-[0_0_24px_rgba(29,205,159,0.14)]">
              <img
                src={logo}
                alt="Papa Predictions"
                className="h-8 w-auto object-contain sm:h-10 md:h-12"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSignOut}
              className="rounded-full bg-[#1DCD9F] px-4 py-2 text-sm font-medium text-black transition hover:bg-[#1DCD9F] hover:text-black hover:shadow-[0_0_18px_rgba(29,205,159,0.25)] sm:px-5 sm:text-base"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="px-3 py-4 sm:px-4 sm:py-6">
        <div className="mx-auto max-w-7xl">
          <div className="space-y-4">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="rounded-2xl border border-[#1DCD9F] bg-[#222222] px-3 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition duration-200 hover:-translate-y-[2px] hover:shadow-[0_16px_38px_rgba(0,0,0,0.48)] sm:px-5 sm:py-4"
              >
                <div className="flex items-center gap-3 sm:gap-5">
                  <img
                    src={avatarMap[profile.display_name]}
                    alt={profile.display_name}
                    className="h-20 w-20 flex-shrink-0 rounded-full object-cover ring-2 ring-[#1DCD9F]/30 sm:h-24 sm:w-24 md:h-28 md:w-28"
                  />

                  <div className="flex min-w-0 flex-1 flex-col justify-center md:flex-row md:items-center md:justify-between md:gap-8">
                    <div className="min-w-0 md:pr-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={nameImageMap[profile.display_name]}
                          alt={profile.display_name}
                          className="h-10 w-auto object-contain sm:h-12 md:h-14"
                        />

                        <Link
                          to={`/users/${profile.display_name.toLowerCase()}/mlb`}
                          className="group rounded-full p-1 transition"
                          aria-label={`${profile.display_name} MLB`}
                        >
                          <img
                            src={mlbLogo}
                            alt="MLB"
                            className="h-10 w-10 object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.45)] transition duration-200 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.65)] sm:h-12 sm:w-12"
                          />
                        </Link>

                        <Link
                          to={`/users/${profile.display_name.toLowerCase()}/nfl`}
                          className="group rounded-full p-1 transition"
                          aria-label={`${profile.display_name} NFL`}
                        >
                          <img
                            src={nflLogo}
                            alt="NFL"
                            className="h-10 w-10 object-contain drop-shadow-[0_0_10px_rgba(239,68,68,0.45)] transition duration-200 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.65)] sm:h-12 sm:w-12"
                          />
                        </Link>
                      </div>
                    </div>

                    <p className="mt-3 max-w-2xl text-sm italic leading-relaxed text-slate-300 sm:text-base md:mt-0 md:text-right md:text-lg">
                      {quoteMap[profile.display_name]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
