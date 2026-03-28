function BracketTeamRow({ team, isWinner = false }) {
  if (!team) {
    return (
      <div className="rounded-lg border border-dashed border-[#1DCD9F]/20 bg-black/40 px-3 py-2 text-sm text-slate-500">
        TBD
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border px-3 py-2 text-sm ${
        isWinner
          ? "border-[#1DCD9F] bg-[#1DCD9F]/15 text-white"
          : "border-[#1DCD9F]/20 bg-[#222222] text-slate-200"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span>{team}</span>
        {isWinner && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#1DCD9F]">
            Winner
          </span>
        )}
      </div>
    </div>
  );
}

function BracketSeries({ title, teams = [], winner }) {
  return (
    <div className="min-h-30 rounded-xl border border-[#1DCD9F]/25 bg-black/40 p-3">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <div className="space-y-2">
        {teams.length > 0 ? (
          teams.map((team) => (
            <BracketTeamRow key={team} team={team} isWinner={winner === team} />
          ))
        ) : (
          <>
            <BracketTeamRow team="" />
            <BracketTeamRow team="" />
          </>
        )}
      </div>

      {teams.length > 0 && !winner && (
        <div className="mt-3 rounded-lg border border-[#1DCD9F]/20 bg-[#222222] px-3 py-2 text-xs text-slate-400">
          No winner selected
        </div>
      )}
    </div>
  );
}

function RoundArrow() {
  return (
    <div className="flex justify-center py-1 text-slate-500 lg:hidden">
      <span className="text-lg">↓</span>
    </div>
  );
}

function LeagueBracketColumn({ title, bracket }) {
  return (
    <div className="rounded-2xl border border-[#1DCD9F] bg-[#222222] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      <h2 className="mb-5 text-2xl font-bold text-white">{title}</h2>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Round 1 • Wild Card
          </p>

          <BracketSeries
            title="3 vs 6"
            teams={[
              bracket.wildCard.series1.topSeed,
              bracket.wildCard.series1.bottomSeed,
            ].filter(Boolean)}
            winner={bracket.wildCard.series1.winner}
          />

          <BracketSeries
            title="4 vs 5"
            teams={[
              bracket.wildCard.series2.topSeed,
              bracket.wildCard.series2.bottomSeed,
            ].filter(Boolean)}
            winner={bracket.wildCard.series2.winner}
          />
        </div>

        <RoundArrow />

        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Round 2 • Division Series
          </p>

          <BracketSeries
            title="1 vs WC 4/5 Winner"
            teams={[
              bracket.divisionSeries.series1.topSeed,
              bracket.divisionSeries.series1.bottomSeed,
            ].filter(Boolean)}
            winner={bracket.divisionSeries.series1.winner}
          />

          <BracketSeries
            title="2 vs WC 3/6 Winner"
            teams={[
              bracket.divisionSeries.series2.topSeed,
              bracket.divisionSeries.series2.bottomSeed,
            ].filter(Boolean)}
            winner={bracket.divisionSeries.series2.winner}
          />
        </div>

        <RoundArrow />

        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Round 3 • Championship Series
          </p>

          <BracketSeries
            title="LCS"
            teams={[
              bracket.championshipSeries.team1,
              bracket.championshipSeries.team2,
            ].filter(Boolean)}
            winner={bracket.championshipSeries.winner}
          />
        </div>
      </div>
    </div>
  );
}

export default function MLBPlayoffsViewSection({ playoffBracket }) {
  return (
    <div className="space-y-6">
      <LeagueBracketColumn
        title="American League"
        bracket={playoffBracket.AL}
      />

      <LeagueBracketColumn
        title="National League"
        bracket={playoffBracket.NL}
      />

      <div className="rounded-2xl border border-[#1DCD9F] bg-[#222222] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
        <h2 className="mb-5 text-2xl font-bold text-white">World Series</h2>

        <div className="max-w-md">
          <p className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Final Round • World Series
          </p>

          <BracketSeries
            title="World Series"
            teams={[
              playoffBracket.worldSeries.team1,
              playoffBracket.worldSeries.team2,
            ].filter(Boolean)}
            winner={playoffBracket.worldSeries.winner}
          />
        </div>
      </div>
    </div>
  );
}
