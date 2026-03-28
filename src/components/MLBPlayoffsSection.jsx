function SeriesSelect({ label, teams = [], value, onChange }) {
  const validValue = teams.includes(value) ? value : "";

  return (
    <div className="rounded-xl border border-[#1DCD9F]/25 bg-black/40 p-4">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mb-3 space-y-2 text-sm text-slate-200">
        {teams.length > 0 ? (
          teams.map((team) => (
            <div
              key={team}
              className="rounded-lg border border-[#1DCD9F]/20 bg-[#222222] px-3 py-2 text-white"
            >
              {team}
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-[#1DCD9F]/20 px-3 py-2 text-slate-500">
            Waiting for matchup
          </div>
        )}
      </div>

      <select
        value={validValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={teams.length < 2}
        className="w-full rounded-xl border border-[#1DCD9F]/30 bg-black px-3 py-2 text-white outline-none transition focus:border-[#1DCD9F] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">Select winner</option>
        {teams.map((team) => (
          <option key={team} value={team}>
            {team}
          </option>
        ))}
      </select>
    </div>
  );
}

function LeagueBracket({ league, bracket, onChange }) {
  return (
    <div className="rounded-2xl border border-[#1DCD9F] bg-[#222222] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      <h2 className="mb-5 text-2xl font-bold text-white">{league}</h2>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <SeriesSelect
          label="Wild Card: 3 vs 6"
          teams={[
            bracket.wildCard.series1.topSeed,
            bracket.wildCard.series1.bottomSeed,
          ].filter(Boolean)}
          value={bracket.wildCard.series1.winner}
          onChange={(value) => onChange(league, "wc1Winner", value)}
        />

        <SeriesSelect
          label="Wild Card: 4 vs 5"
          teams={[
            bracket.wildCard.series2.topSeed,
            bracket.wildCard.series2.bottomSeed,
          ].filter(Boolean)}
          value={bracket.wildCard.series2.winner}
          onChange={(value) => onChange(league, "wc2Winner", value)}
        />
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <SeriesSelect
          label="Division Series: 1 vs WC 4/5 Winner"
          teams={[
            bracket.divisionSeries.series1.topSeed,
            bracket.divisionSeries.series1.bottomSeed,
          ].filter(Boolean)}
          value={bracket.divisionSeries.series1.winner}
          onChange={(value) => onChange(league, "ds1Winner", value)}
        />

        <SeriesSelect
          label="Division Series: 2 vs WC 3/6 Winner"
          teams={[
            bracket.divisionSeries.series2.topSeed,
            bracket.divisionSeries.series2.bottomSeed,
          ].filter(Boolean)}
          value={bracket.divisionSeries.series2.winner}
          onChange={(value) => onChange(league, "ds2Winner", value)}
        />
      </div>

      <SeriesSelect
        label="League Championship Series"
        teams={[
          bracket.championshipSeries.team1,
          bracket.championshipSeries.team2,
        ].filter(Boolean)}
        value={bracket.championshipSeries.winner}
        onChange={(value) => onChange(league, "lcsWinner", value)}
      />
    </div>
  );
}

export default function MLBPlayoffsSection({ playoffBracket, onChange }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <LeagueBracket
          league="AL"
          bracket={playoffBracket.AL}
          onChange={onChange}
        />

        <LeagueBracket
          league="NL"
          bracket={playoffBracket.NL}
          onChange={onChange}
        />
      </div>

      <div className="rounded-2xl border border-[#1DCD9F] bg-[#222222] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
        <h2 className="mb-5 text-2xl font-bold text-white">World Series</h2>

        <SeriesSelect
          label="World Series"
          teams={[
            playoffBracket.worldSeries.team1,
            playoffBracket.worldSeries.team2,
          ].filter(Boolean)}
          value={playoffBracket.worldSeries.winner}
          onChange={(value) => onChange("worldSeries", "winner", value)}
        />
      </div>
    </div>
  );
}
