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
import alexJoke from "../assets/alexjoke.png";
import dadJoke from "../assets/dadjoke.png";
import jesusLogo from "../assets/jesus.png";
import { Link } from "react-router-dom";

function Dashboard() {
  const [profiles, setProfiles] = useState([]);
  const [currentProfileName, setCurrentProfileName] = useState("");
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
    Dennis: "“RIP the legend Paul Rizzuto”",
    Jerry: "“You mess with me you get the bull!”",
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: currentProfileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("auth_user_id", user.id)
            .maybeSingle();

          if (currentProfileData?.display_name) {
            setCurrentProfileName(currentProfileData.display_name);
          }
        }

        const { data } = await supabase
          .from("profiles")
          .select("*")
          .order("display_name", { ascending: true });

        setProfiles(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const jokeAdSrc =
    currentProfileName === "Alex"
      ? alexJoke
      : currentProfileName === "Jerry"
        ? dadJoke
        : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] p-6 text-white">Loading...</div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <header className="sticky top-0 z-20 border-b border-[#1DCD9F]/30 bg-[#222222]/95 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3">
          <img src={crystalBall} className="h-10 w-10" />

          <div className="flex justify-center">
            <img src={logo} className="h-10" />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSignOut}
              className="rounded-full bg-[#1DCD9F] px-4 py-2 text-black"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="px-3 py-4 sm:px-4 sm:py-6">
        <div className="mx-auto max-w-7xl space-y-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="rounded-2xl border border-[#1DCD9F] bg-[#222222] p-4 overflow-hidden"
            >
              <div className="flex items-start gap-4">
                {/* AVATAR */}
                <img
                  src={avatarMap[profile.display_name]}
                  className="h-20 w-20 rounded-full flex-shrink-0"
                />

                {/* RIGHT SIDE */}
                <div className="flex flex-col flex-1 gap-2">
                  {/* TOP ROW: NAME + LOGOS */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <img
                      src={nameImageMap[profile.display_name]}
                      className="h-10"
                    />

                    <Link
                      to={`/users/${profile.display_name.toLowerCase()}/mlb`}
                    >
                      <img src={mlbLogo} className="h-10 w-10 object-contain" />
                    </Link>

                    <Link
                      to={`/users/${profile.display_name.toLowerCase()}/nfl`}
                    >
                      <img src={nflLogo} className="h-10 w-10 object-contain" />
                    </Link>
                  </div>

                  {/* QUOTE */}
                  <p className="text-sm italic text-slate-300 leading-relaxed">
                    {quoteMap[profile.display_name]}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {jokeAdSrc && (
            <div className="mt-6 -mx-3 sm:mx-0">
              <img
                src={jokeAdSrc}
                className="w-full h-auto rounded-none border-y border-[#1DCD9F]/30 sm:border"
              />
            </div>
          )}

          <div className="mt-8 rounded-xl border border-[#1DCD9F]/30 bg-[#222222]/70 p-4 text-center">
            <p className="text-[#1DCD9F] font-semibold">
              New Features Coming Soon!
            </p>
            <p className="text-sm text-slate-300 mt-2">
              Compare your picks to real results + NFL coming soon.
            </p>
          </div>

          <div className="mt-10 text-center">
            <p className="text-xs text-slate-400 italic">
              Brought to you free of charge and with limited ads by the Church
              Of Jesus Christ of Latter-Day Saints
            </p>

            <img src={jesusLogo} className="mx-auto mt-3 h-12 opacity-80" />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
