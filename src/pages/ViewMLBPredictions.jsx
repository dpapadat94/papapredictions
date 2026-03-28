import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { getCurrentProfile } from "../utils/getCurrentProfile";
import { mlbDivisions } from "../data/mlbTeams";
import { buildFullPlayoffBracket } from "../utils/mlbPlayoffs";
import { availableYears } from "../data/availableYears";
import { isPredictionLocked, getMLBLockDeadline } from "../utils/mlbLocking";
import MLBPlayoffsViewSection from "../components/MLBPlayoffsViewSection";

import alexIcon from "../assets/alexIcon.png";
import dennisIcon from "../assets/dennisIcon.png";
import jerryIcon from "../assets/jerryIcon.png";
import logo from "../assets/logo.png";
import crystalBall from "../assets/crystalball.png";

function ViewMLBPredictions() {
  const { name } = useParams();
  const [searchParams] = useSearchParams();
  const sectionFromUrl = searchParams.get("section") || "standings";

  const currentCalendarYear = String(new Date().getFullYear());
  const defaultYear = availableYears.includes(currentCalendarYear)
    ? currentCalendarYear
    : "2026";

  const [currentProfile, setCurrentProfile] = useState(null);
  const [viewedProfile, setViewedProfile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedLeague, setSelectedLeague] = useState("AL");
  const [selectedSection, setSelectedSection] = useState(sectionFromUrl);
  const [selectedYear, setSelectedYear] = useState(defaultYear);

  const justSaved = searchParams.get("saved") === "1";

  const formattedName = useMemo(() => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1);
  }, [name]);

  const avatarMap = {
    Alex: alexIcon,
    Dennis: dennisIcon,
    Jerry: jerryIcon,
  };

  const visibleDivisions = mlbDivisions.filter(
    (division) => division.league === selectedLeague,
  );

  const playoffBracket = useMemo(() => {
    if (!prediction?.standings_json) return null;

    return buildFullPlayoffBracket(
      prediction.standings_json,
      mlbDivisions,
      prediction.playoffs_json || {},
    );
  }, [prediction]);

  const isLocked = useMemo(() => {
    return isPredictionLocked(prediction, selectedYear);
  }, [prediction, selectedYear]);

  const lockDeadline = useMemo(() => {
    return getMLBLockDeadline(selectedYear);
  }, [selectedYear]);

  const formattedLockDeadline = useMemo(() => {
    if (!lockDeadline) return null;

    return lockDeadline.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [lockDeadline]);

  const formattedLockedAt = useMemo(() => {
    if (!prediction?.locked_at) return null;

    return new Date(prediction.locked_at).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [prediction]);

  useEffect(() => {
    setSelectedSection(sectionFromUrl);
  }, [sectionFromUrl]);

  useEffect(() => {
    const loadPageData = async () => {
      setLoading(true);

      try {
        const loggedInProfile = await getCurrentProfile();
        setCurrentProfile(loggedInProfile);

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .ilike("display_name", formattedName)
          .single();

        if (profileError) {
          throw profileError;
        }

        setViewedProfile(profileData);

        const { data: predictionData, error: predictionError } = await supabase
          .from("mlb_predictions")
          .select("*")
          .eq("profile_id", profileData.id)
          .eq("year", Number(selectedYear))
          .maybeSingle();

        if (predictionError) {
          throw predictionError;
        }

        setPrediction(predictionData || null);
      } catch (error) {
        console.error("Error loading MLB prediction view:", error);
      } finally {
        setLoading(false);
      }
    };

    if (formattedName) {
      loadPageData();
    }
  }, [formattedName, selectedYear]);

  const isOwner =
    currentProfile && viewedProfile
      ? currentProfile.id === viewedProfile.id
      : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] px-4 py-8 text-white">
        Loading MLB predictions...
      </div>
    );
  }

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

          <div className="flex justify-end">
            {isOwner && !isLocked ? (
              <Link
                to={`/users/${name}/mlb/edit?section=${selectedSection}`}
                className="rounded-full bg-[#1DCD9F] px-4 py-2 text-sm font-medium text-black transition hover:shadow-[0_0_18px_rgba(29,205,159,0.25)] sm:px-5 sm:text-base"
              >
                {prediction ? "Edit" : "Enter"}
              </Link>
            ) : isOwner && isLocked ? (
              <div className="rounded-full border border-[#1DCD9F] bg-transparent px-4 py-2 text-sm font-medium text-[#1DCD9F] sm:px-5 sm:text-base">
                Locked
              </div>
            ) : (
              <div className="w-[84px] sm:w-[92px]" />
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
        {justSaved && (
          <div className="mb-6 rounded-2xl border border-[#1DCD9F] bg-[#222222] p-4 text-[#1DCD9F] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
            Predictions saved successfully.
          </div>
        )}

        <div className="mb-6 text-center">
          <img
            src={avatarMap[formattedName]}
            alt={formattedName}
            className="mx-auto h-16 w-16 rounded-full object-cover ring-2 ring-[#1DCD9F]/30 sm:h-20 sm:w-20"
          />
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            {formattedName}
          </h1>
          <p className="mt-1 text-lg text-slate-300 sm:text-xl">
            MLB Predictions
          </p>
        </div>

        {!prediction && (
          <div className="rounded-2xl border border-[#1DCD9F] bg-[#222222] p-6 text-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
            {isOwner ? (
              <p>
                You have not entered MLB predictions for {selectedYear} yet.
              </p>
            ) : (
              <p>
                {formattedName} has not made predictions for {selectedYear} yet.
              </p>
            )}
          </div>
        )}

        {prediction &&
          selectedSection !== "awards" &&
          selectedSection !== "playoffs" &&
          null}

        <div className="mb-8">
          <div className="mb-5 flex justify-center">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="rounded-xl border border-[#1DCD9F]/40 bg-black px-4 py-2 text-3xl font-bold text-white outline-none transition focus:border-[#1DCD9F] sm:text-5xl"
            >
              {availableYears
                .slice()
                .reverse()
                .map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex justify-center">
              <div className="inline-flex flex-wrap items-center justify-center gap-1 rounded-full bg-[#2f2f2f] p-1">
                <button
                  onClick={() => setSelectedSection("awards")}
                  className={`rounded-full px-4 py-2 transition ${
                    selectedSection === "awards"
                      ? "bg-[#1DCD9F] font-semibold text-black"
                      : "text-white hover:text-[#1DCD9F]"
                  }`}
                >
                  Awards
                </button>

                <button
                  onClick={() => setSelectedSection("standings")}
                  className={`rounded-full px-4 py-2 transition ${
                    selectedSection === "standings"
                      ? "bg-[#1DCD9F] font-semibold text-black"
                      : "text-white hover:text-[#1DCD9F]"
                  }`}
                >
                  Standings
                </button>

                <button
                  onClick={() => setSelectedSection("playoffs")}
                  className={`rounded-full px-4 py-2 transition ${
                    selectedSection === "playoffs"
                      ? "bg-[#1DCD9F] font-semibold text-black"
                      : "text-white hover:text-[#1DCD9F]"
                  }`}
                >
                  Playoffs
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-1 justify-start">
                {selectedSection === "standings" ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedLeague("AL")}
                      className={`rounded-full px-4 py-2 transition ${
                        selectedLeague === "AL"
                          ? "bg-[#1DCD9F] text-black"
                          : "text-white hover:bg-[#1DCD9F]/10 hover:text-[#1DCD9F]"
                      }`}
                    >
                      AL
                    </button>

                    <button
                      onClick={() => setSelectedLeague("NL")}
                      className={`rounded-full px-4 py-2 transition ${
                        selectedLeague === "NL"
                          ? "bg-[#1DCD9F] text-black"
                          : "text-white hover:bg-[#1DCD9F]/10 hover:text-[#1DCD9F]"
                      }`}
                    >
                      NL
                    </button>
                  </div>
                ) : (
                  <div />
                )}
              </div>

              <div className="flex flex-1 justify-end">
                {isOwner && !isLocked && (
                  <Link
                    to={`/users/${name}/mlb/edit?section=${selectedSection}`}
                    className="rounded-full bg-[#1DCD9F] px-4 py-2 text-sm font-semibold text-black transition hover:shadow-[0_0_18px_rgba(29,205,159,0.25)] sm:text-base"
                  >
                    {prediction ? "Edit Predictions" : "Enter Predictions"}
                  </Link>
                )}

                {isOwner && isLocked && (
                  <div className="rounded-full border border-[#1DCD9F] px-4 py-2 text-sm font-semibold text-[#1DCD9F] sm:text-base">
                    Locked
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {prediction && selectedSection === "awards" && (
          <div className="space-y-6">
            {[
              { key: "al_mvp", label: "AL MVP" },
              { key: "nl_mvp", label: "NL MVP" },
              { key: "al_cy_young", label: "AL Cy Young" },
              { key: "nl_cy_young", label: "NL Cy Young" },
              { key: "al_rookie", label: "AL Rookie of the Year" },
              { key: "nl_rookie", label: "NL Rookie of the Year" },
              { key: "flop_of_the_year", label: "Flop of the Year" },
              { key: "comeback_player", label: "Comeback Player" },
            ].map((award) => {
              const picks = prediction.awards_json?.[award.key] || [];

              return (
                <section
                  key={award.key}
                  className="rounded-2xl border border-[#1DCD9F] bg-[#222222] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                >
                  <h2 className="mb-4 text-xl font-bold text-white">
                    {award.label}
                  </h2>

                  <div className="space-y-2">
                    {picks.some((pick) => pick && pick.trim() !== "") ? (
                      picks.map((pick, index) =>
                        pick && pick.trim() !== "" ? (
                          <div
                            key={index}
                            className="rounded-xl border border-[#1DCD9F]/25 bg-black/40 px-3 py-2"
                          >
                            <span className="mr-2 font-semibold text-[#1DCD9F]">
                              {index + 1}.
                            </span>
                            <span className="text-white">{pick}</span>
                          </div>
                        ) : null,
                      )
                    ) : (
                      <div className="rounded-xl border border-[#1DCD9F]/25 bg-black/40 px-3 py-2 text-slate-400">
                        No picks entered
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {prediction && selectedSection === "playoffs" && (
          <>
            {playoffBracket ? (
              <MLBPlayoffsViewSection playoffBracket={playoffBracket} />
            ) : (
              <div className="rounded-2xl border border-[#1DCD9F] bg-[#222222] p-6 text-slate-300 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                No playoff bracket available.
              </div>
            )}
          </>
        )}

        {prediction &&
          prediction.standings_json &&
          selectedSection === "standings" && (
            <div className="space-y-8">
              {visibleDivisions.map((division) => {
                const divisionData =
                  prediction.standings_json[division.division];

                return (
                  <section
                    key={division.division}
                    className="overflow-hidden rounded-2xl border border-[#1DCD9F] bg-[#222222] shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                  >
                    <div className="border-b border-[#1DCD9F]/25 bg-black/30 px-4 py-3">
                      <h2 className="text-lg font-bold text-white">
                        {division.division}
                      </h2>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse text-[11px] sm:text-sm">
                        <thead className="bg-black/40 text-white">
                          <tr>
                            <th className="px-3 py-3 text-center font-semibold">
                              #
                            </th>
                            <th className="px-3 py-3 text-left font-semibold">
                              Team
                            </th>
                            <th className="px-3 py-3 text-center font-semibold">
                              Playoffs
                            </th>
                            <th className="px-3 py-3 text-center font-semibold">
                              Seed
                            </th>
                            <th className="px-3 py-3 text-center font-semibold">
                              W
                            </th>
                            <th className="px-3 py-3 text-center font-semibold">
                              L
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {division.teams
                            .slice()
                            .sort((a, b) => {
                              const rankA = Number(divisionData[a]?.rank || 99);
                              const rankB = Number(divisionData[b]?.rank || 99);
                              return rankA - rankB;
                            })
                            .map((team) => {
                              const teamData = divisionData[team];
                              const isFirstPlace = Number(teamData.rank) === 1;

                              return (
                                <tr
                                  key={team}
                                  className="border-t border-[#1DCD9F]/15 bg-[#222222] text-white"
                                >
                                  <td className="px-3 py-3 text-center font-semibold text-[#1DCD9F]">
                                    {teamData.rank || "-"}
                                  </td>

                                  <td className="px-3 py-3">
                                    {isFirstPlace ? (
                                      <span className="rounded-md bg-[#deb948d4] px-2 py-1 font-bold text-black">
                                        {team}
                                      </span>
                                    ) : (
                                      <span className="font-medium">
                                        {team}
                                      </span>
                                    )}
                                  </td>

                                  <td className="px-3 py-3 text-center">
                                    {teamData.isPlayoffTeam ? "Yes" : "No"}
                                  </td>

                                  <td className="px-3 py-3 text-center">
                                    {teamData.seed || "-"}
                                  </td>

                                  <td className="px-3 py-3 text-center">
                                    {teamData.wins || "-"}
                                  </td>

                                  <td className="px-3 py-3 text-center">
                                    {teamData.losses || "-"}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </section>
                );
              })}
            </div>
          )}

        <div className="mt-10 pb-2 text-center text-sm text-slate-400 sm:text-base">
          {!prediction && Number(selectedYear) <= 2025 && (
            <span>
              Historical seasons can still be entered later unless manually
              locked.
            </span>
          )}

          {!prediction && formattedLockDeadline && (
            <span>
              Predictions for {selectedYear} lock after {formattedLockDeadline}.
            </span>
          )}

          {prediction && !isLocked && formattedLockDeadline && (
            <span>
              Predictions for {selectedYear} will lock after{" "}
              {formattedLockDeadline}.
            </span>
          )}

          {prediction &&
            !isLocked &&
            !formattedLockDeadline &&
            Number(selectedYear) <= 2025 && (
              <span>
                This is a historical season. It stays editable until manually
                locked.
              </span>
            )}

          {prediction && isLocked && (
            <span>
              Predictions locked in
              {formattedLockedAt ? ` on ${formattedLockedAt}.` : "."}
            </span>
          )}
        </div>
      </main>
    </div>
  );
}

export default ViewMLBPredictions;
