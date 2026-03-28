import { useEffect, useMemo, useState } from "react";
import {
  useParams,
  Link,
  Navigate,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { mlbDivisions } from "../data/mlbTeams";
import { mlbAwardsConfig } from "../data/mlbAwards";
import MLBStandingsSection from "../components/MLBStandingsSection";
import MLBAwardsSection from "../components/MLBAwardsSection";
import MLBPlayoffsSection from "../components/MLBPlayoffsSection";
import { availableYears } from "../data/availableYears";
import { getCurrentProfile } from "../utils/getCurrentProfile";
import {
  buildInitialPlayoffsState,
  buildFullPlayoffBracket,
} from "../utils/mlbPlayoffs";
import { isPredictionLocked, getMLBLockDeadline } from "../utils/mlbLocking";
import logo from "../assets/logo.png";
import crystalBall from "../assets/crystalball.png";

function buildInitialStandingsState() {
  const initialState = {};

  mlbDivisions.forEach((division) => {
    initialState[division.division] = {};

    division.teams.forEach((team) => {
      initialState[division.division][team] = {
        rank: "",
        isPlayoffTeam: false,
        seed: "",
        wins: "",
        losses: "",
      };
    });
  });

  return initialState;
}

function buildInitialAwardsState() {
  const initialState = {};

  mlbAwardsConfig.forEach((award) => {
    initialState[award.key] = Array(award.slots).fill("");
  });

  return initialState;
}

function MLBPredictions() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sectionFromUrl = searchParams.get("section") || "standings";

  const currentCalendarYear = String(new Date().getFullYear());
  const defaultYear = availableYears.includes(currentCalendarYear)
    ? currentCalendarYear
    : "2026";

  const [standings, setStandings] = useState(buildInitialStandingsState());
  const [awards, setAwards] = useState(buildInitialAwardsState());
  const [playoffs, setPlayoffs] = useState(buildInitialPlayoffsState());
  const [loadedPrediction, setLoadedPrediction] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingSavedData, setLoadingSavedData] = useState(true);
  const [canEdit, setCanEdit] = useState(false);

  const [selectedSection, setSelectedSection] = useState(sectionFromUrl);
  const [selectedLeague, setSelectedLeague] = useState("AL");
  const [selectedYear, setSelectedYear] = useState(defaultYear);

  const formattedName = useMemo(() => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1);
  }, [name]);

  const playoffBracket = useMemo(() => {
    return buildFullPlayoffBracket(standings, mlbDivisions, playoffs);
  }, [standings, playoffs]);

  const isLocked = useMemo(() => {
    return isPredictionLocked(loadedPrediction, selectedYear);
  }, [loadedPrediction, selectedYear]);

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
    if (!loadedPrediction?.locked_at) return null;

    return new Date(loadedPrediction.locked_at).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [loadedPrediction]);

  const handleFieldChange = (divisionName, teamName, field, value) => {
    if (isLocked) return;

    setStandings((prev) => {
      const updated = {
        ...prev,
        [divisionName]: {
          ...prev[divisionName],
          [teamName]: {
            ...prev[divisionName][teamName],
            [field]: value,
          },
        },
      };

      if (field === "isPlayoffTeam" && value === false) {
        updated[divisionName][teamName].seed = "";
      }

      return updated;
    });
  };

  const handleAwardChange = (awardKey, index, value) => {
    if (isLocked) return;

    setAwards((prev) => ({
      ...prev,
      [awardKey]: prev[awardKey].map((item, i) => (i === index ? value : item)),
    }));
  };

  const handlePlayoffChange = (league, field, value) => {
    if (isLocked) return;

    if (league === "worldSeries") {
      setPlayoffs((prev) => ({
        ...prev,
        worldSeriesWinner: value,
      }));
      return;
    }

    setPlayoffs((prev) => {
      const next = {
        ...prev,
        [league]: {
          ...prev[league],
          [field]: value,
        },
      };

      if (field === "wc1Winner") {
        next[league].ds2Winner = "";
        next[league].lcsWinner = "";
        next.worldSeriesWinner = "";
      }

      if (field === "wc2Winner") {
        next[league].ds1Winner = "";
        next[league].lcsWinner = "";
        next.worldSeriesWinner = "";
      }

      if (field === "ds1Winner" || field === "ds2Winner") {
        next[league].lcsWinner = "";
        next.worldSeriesWinner = "";
      }

      if (field === "lcsWinner") {
        next.worldSeriesWinner = "";
      }

      return next;
    });
  };

  const validateStandings = () => {
    const errors = [];

    mlbDivisions.forEach((division) => {
      const divisionData = standings[division.division];
      const rankMap = {};
      const ranksUsed = [];

      division.teams.forEach((team) => {
        const teamData = divisionData[team];
        const rank = teamData.rank;

        if (rank === "") {
          errors.push(
            `${division.division}: ${team} is missing a division rank.`,
          );
        } else {
          const numericRank = Number(rank);

          if (
            !Number.isInteger(numericRank) ||
            numericRank < 1 ||
            numericRank > 5
          ) {
            errors.push(
              `${division.division}: ${team} has invalid rank ${rank}. Rank must be 1 through 5.`,
            );
          } else {
            ranksUsed.push(numericRank);

            if (!rankMap[numericRank]) {
              rankMap[numericRank] = [];
            }

            rankMap[numericRank].push(team);
          }
        }

        const winsFilled = teamData.wins !== "";
        const lossesFilled = teamData.losses !== "";

        if (winsFilled !== lossesFilled) {
          errors.push(
            `${team}: wins and losses must both be filled in or both left blank.`,
          );
        }

        if (winsFilled && lossesFilled) {
          const wins = Number(teamData.wins);
          const losses = Number(teamData.losses);

          if (
            !Number.isInteger(wins) ||
            !Number.isInteger(losses) ||
            wins < 0 ||
            losses < 0
          ) {
            errors.push(
              `${team}: wins and losses must be whole numbers 0 or greater.`,
            );
          } else if (wins + losses !== 162) {
            errors.push(
              `${team}: wins and losses must add up to 162. Currently ${wins}-${losses}.`,
            );
          }
        }
      });

      Object.entries(rankMap).forEach(([rank, teams]) => {
        if (teams.length > 1) {
          errors.push(
            `${division.division}: duplicate rank ${rank} assigned to ${teams.join(
              ", ",
            )}.`,
          );
        }
      });

      const sortedRanks = [...new Set(ranksUsed)].sort((a, b) => a - b);
      const expectedRanks = [1, 2, 3, 4, 5];

      expectedRanks.forEach((expectedRank) => {
        if (!sortedRanks.includes(expectedRank)) {
          errors.push(
            `${division.division}: missing rank ${expectedRank}. Each division must have ranks 1 through 5 exactly once.`,
          );
        }
      });
    });

    ["AL", "NL"].forEach((league) => {
      const leagueDivisions = mlbDivisions.filter(
        (division) => division.league === league,
      );

      const playoffTeams = [];
      const seedMap = {};
      const seedsUsed = [];

      leagueDivisions.forEach((division) => {
        division.teams.forEach((team) => {
          const teamData = standings[division.division][team];
          const isPlayoffTeam = Boolean(teamData.isPlayoffTeam);
          const seed = teamData.seed;

          if (isPlayoffTeam) {
            playoffTeams.push(team);

            if (seed === "") {
              errors.push(
                `${league}: ${team} is marked as a playoff team but has no seed.`,
              );
            } else {
              const numericSeed = Number(seed);

              if (
                !Number.isInteger(numericSeed) ||
                numericSeed < 1 ||
                numericSeed > 6
              ) {
                errors.push(
                  `${league}: ${team} has invalid playoff seed ${seed}. Seed must be 1 through 6.`,
                );
              } else {
                seedsUsed.push(numericSeed);

                if (!seedMap[numericSeed]) {
                  seedMap[numericSeed] = [];
                }

                seedMap[numericSeed].push(team);
              }
            }
          } else if (seed !== "") {
            errors.push(
              `${league}: ${team} has seed ${seed} but is not marked as a playoff team.`,
            );
          }
        });
      });

      if (playoffTeams.length !== 6) {
        errors.push(
          `${league}: exactly 6 playoff teams must be selected. Currently ${playoffTeams.length}.`,
        );
      }

      Object.entries(seedMap).forEach(([seed, teams]) => {
        if (teams.length > 1) {
          errors.push(
            `${league}: duplicate playoff seed ${seed} assigned to ${teams.join(
              ", ",
            )}.`,
          );
        }
      });

      const sortedSeeds = [...new Set(seedsUsed)].sort((a, b) => a - b);
      const expectedSeeds = [1, 2, 3, 4, 5, 6];

      expectedSeeds.forEach((expectedSeed) => {
        if (!sortedSeeds.includes(expectedSeed)) {
          errors.push(
            `${league}: missing playoff seed ${expectedSeed}. Seeds 1 through 6 must each be used exactly once.`,
          );
        }
      });
    });

    return errors;
  };

  const handleSave = async () => {
    if (isLocked) {
      alert("These predictions are locked and can no longer be edited.");
      return;
    }

    const errors = validateStandings();

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    setSaving(true);

    try {
      const profile = await getCurrentProfile();

      const payload = {
        profile_id: profile.id,
        year: Number(selectedYear),
        standings_json: standings,
        awards_json: awards,
        playoffs_json: playoffs,
        is_locked: loadedPrediction?.is_locked || false,
        locked_at: loadedPrediction?.locked_at || null,
      };

      const { error } = await supabase
        .from("mlb_predictions")
        .upsert(payload, {
          onConflict: "profile_id,year",
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      navigate(`/users/${name}/mlb?saved=1&section=${selectedSection}`);
    } catch (error) {
      console.error("Error saving MLB predictions:", error);
      alert(error.message || "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleLockPredictions = async () => {
    if (isLocked) {
      return;
    }

    const errors = validateStandings();

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    setSaving(true);

    try {
      const profile = await getCurrentProfile();

      const payload = {
        profile_id: profile.id,
        year: Number(selectedYear),
        standings_json: standings,
        awards_json: awards,
        playoffs_json: playoffs,
        is_locked: true,
        locked_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("mlb_predictions")
        .upsert(payload, {
          onConflict: "profile_id,year",
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      navigate(`/users/${name}/mlb?saved=1&section=${selectedSection}`);
    } catch (error) {
      console.error("Error locking MLB predictions:", error);
      alert(error.message || "Something went wrong while locking predictions.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    setSelectedSection(sectionFromUrl);
  }, [sectionFromUrl]);

  useEffect(() => {
    const loadSavedPrediction = async () => {
      setLoadingSavedData(true);

      try {
        const profile = await getCurrentProfile();

        const routeName = formattedName.toLowerCase();
        const profileName = profile.display_name.toLowerCase();

        if (routeName !== profileName) {
          setCanEdit(false);
          setLoadingSavedData(false);
          return;
        }

        setCanEdit(true);

        const { data, error } = await supabase
          .from("mlb_predictions")
          .select("*")
          .eq("profile_id", profile.id)
          .eq("year", Number(selectedYear))
          .maybeSingle();

        if (error) {
          throw error;
        }

        setLoadedPrediction(data || null);

        if (data?.standings_json) {
          setStandings(data.standings_json);
        } else {
          setStandings(buildInitialStandingsState());
        }

        if (data?.awards_json) {
          setAwards(data.awards_json);
        } else {
          setAwards(buildInitialAwardsState());
        }

        if (data?.playoffs_json) {
          setPlayoffs(data.playoffs_json);
        } else {
          setPlayoffs(buildInitialPlayoffsState());
        }

        setValidationErrors([]);
      } catch (error) {
        console.error("Error loading saved MLB predictions:", error);
      } finally {
        setLoadingSavedData(false);
      }
    };

    loadSavedPrediction();
  }, [formattedName, selectedYear]);

  if (loadingSavedData) {
    return (
      <div className="min-h-screen bg-[#000000] px-4 py-8 text-white">
        Loading MLB predictions...
      </div>
    );
  }

  if (!canEdit) {
    return <Navigate to={`/users/${name}/mlb`} replace />;
  }

  const visibleDivisions = mlbDivisions.filter(
    (division) => division.league === selectedLeague,
  );

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
            <div className="w-[84px] sm:w-[92px]" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            {formattedName}
          </h1>
          <p className="mt-1 text-lg text-slate-300 sm:text-xl">
            MLB Predictions
          </p>
        </div>

        {validationErrors.length > 0 && selectedSection === "standings" && (
          <div className="mb-6 rounded-2xl border border-red-500 bg-[#222222] p-4 text-red-200 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
            <h2 className="mb-3 text-lg font-bold text-red-300">
              Please fix these issues:
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-red-100">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

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

              <div className="flex flex-1 justify-end gap-3">
                <button
                  onClick={handleLockPredictions}
                  disabled={saving || isLocked}
                  className="rounded-full border border-[#1DCD9F] bg-transparent px-4 py-2 text-sm font-semibold text-[#1DCD9F] transition hover:bg-[#1DCD9F] hover:text-black disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                >
                  {isLocked
                    ? "Locked In"
                    : saving
                      ? "Processing..."
                      : "Lock In Predictions"}
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving || isLocked}
                  className="rounded-full bg-[#1DCD9F] px-4 py-2 text-sm font-semibold text-black transition hover:shadow-[0_0_18px_rgba(29,205,159,0.25)] disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                >
                  {isLocked
                    ? "Predictions Locked"
                    : saving
                      ? "Saving..."
                      : "Save Predictions"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {selectedSection === "standings" && (
          <div className="space-y-6">
            {visibleDivisions.map((division) => (
              <MLBStandingsSection
                key={division.division}
                division={division}
                standingsData={standings[division.division]}
                onFieldChange={handleFieldChange}
              />
            ))}
          </div>
        )}

        {selectedSection === "awards" && (
          <MLBAwardsSection
            awardsData={awards}
            onAwardChange={handleAwardChange}
          />
        )}

        {selectedSection === "playoffs" && (
          <MLBPlayoffsSection
            playoffBracket={playoffBracket}
            onChange={handlePlayoffChange}
          />
        )}

        <div className="mt-10 pb-2 text-center text-sm text-slate-400 sm:text-base">
          {isLocked && (
            <span>
              Predictions locked
              {formattedLockedAt ? ` on ${formattedLockedAt}.` : "."}
            </span>
          )}

          {!isLocked && formattedLockDeadline && (
            <span>
              Predictions for {selectedYear} will automatically lock after{" "}
              {formattedLockDeadline}.
            </span>
          )}

          {!isLocked &&
            !formattedLockDeadline &&
            Number(selectedYear) <= 2025 && (
              <span>
                Historical seasons do not auto-lock. Use “Lock In Predictions”
                when you are ready to finalize this year.
              </span>
            )}
        </div>
      </main>
    </div>
  );
}

export default MLBPredictions;
