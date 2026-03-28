function MLBStandingsSection({ division, standingsData, onFieldChange }) {
  return (
    <section className="rounded-2xl border border-[#1DCD9F] bg-[#222222] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      <h2 className="mb-4 text-2xl font-bold text-white">
        {division.division}
      </h2>

      <div className="space-y-4">
        {division.teams.map((team) => {
          const teamData = standingsData[team];

          return (
            <div
              key={team}
              className="rounded-xl border border-[#1DCD9F]/25 bg-black/40 p-4"
            >
              <h3 className="mb-3 text-xl font-semibold text-white">{team}</h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Rank */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-200">
                    Division Rank
                  </label>
                  <select
                    value={teamData.rank}
                    onChange={(e) =>
                      onFieldChange(
                        division.division,
                        team,
                        "rank",
                        e.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-[#1DCD9F]/30 bg-black px-3 py-2 text-white outline-none transition focus:border-[#1DCD9F]"
                  >
                    <option value="">Select rank</option>
                    <option value="1">1st</option>
                    <option value="2">2nd</option>
                    <option value="3">3rd</option>
                    <option value="4">4th</option>
                    <option value="5">5th</option>
                  </select>
                </div>

                {/* Playoff Checkbox */}
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                    <input
                      type="checkbox"
                      checked={teamData.isPlayoffTeam}
                      onChange={(e) =>
                        onFieldChange(
                          division.division,
                          team,
                          "isPlayoffTeam",
                          e.target.checked,
                        )
                      }
                      className="h-4 w-4 accent-[#1DCD9F]"
                    />
                    Playoff Team?
                  </label>
                </div>

                {/* Seed */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-200">
                    Playoff Seed
                  </label>
                  <select
                    value={teamData.seed}
                    onChange={(e) =>
                      onFieldChange(
                        division.division,
                        team,
                        "seed",
                        e.target.value,
                      )
                    }
                    disabled={!teamData.isPlayoffTeam}
                    className="w-full rounded-xl border border-[#1DCD9F]/30 bg-black px-3 py-2 text-white outline-none transition focus:border-[#1DCD9F] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">No seed</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                  </select>
                </div>

                {/* Wins */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-200">
                    Wins
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="162"
                    value={teamData.wins}
                    onChange={(e) =>
                      onFieldChange(
                        division.division,
                        team,
                        "wins",
                        e.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-[#1DCD9F]/30 bg-black px-3 py-2 text-white outline-none transition focus:border-[#1DCD9F]"
                    placeholder="Optional"
                  />
                </div>

                {/* Losses */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-200">
                    Losses
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="162"
                    value={teamData.losses}
                    onChange={(e) =>
                      onFieldChange(
                        division.division,
                        team,
                        "losses",
                        e.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-[#1DCD9F]/30 bg-black px-3 py-2 text-white outline-none transition focus:border-[#1DCD9F]"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default MLBStandingsSection;
