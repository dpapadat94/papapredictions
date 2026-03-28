export function buildInitialPlayoffsState() {
  return {
    AL: {
      wc1Winner: "",
      wc2Winner: "",
      ds1Winner: "",
      ds2Winner: "",
      lcsWinner: "",
    },
    NL: {
      wc1Winner: "",
      wc2Winner: "",
      ds1Winner: "",
      ds2Winner: "",
      lcsWinner: "",
    },
    worldSeriesWinner: "",
  };
}

function flattenLeagueStandings(standings, mlbDivisions, league) {
  return mlbDivisions
    .filter((division) => division.league === league)
    .flatMap((division) =>
      division.teams.map((team) => {
        const teamData = standings?.[division.division]?.[team] || {};

        return {
          team,
          division: division.division,
          league,
          rank: Number(teamData.rank) || null,
          seed: Number(teamData.seed) || null,
          isPlayoffTeam: Boolean(teamData.isPlayoffTeam),
          wins: teamData.wins,
          losses: teamData.losses,
        };
      }),
    );
}

export function getLeaguePlayoffTeams(standings, mlbDivisions, league) {
  return flattenLeagueStandings(standings, mlbDivisions, league)
    .filter((team) => team.isPlayoffTeam && team.seed)
    .sort((a, b) => a.seed - b.seed);
}

function getSeedTeam(playoffTeams, seed) {
  return playoffTeams.find((team) => team.seed === seed)?.team || "";
}

function cleanWinner(winner, validOptions) {
  return validOptions.includes(winner) ? winner : "";
}

export function buildLeagueBracket(standings, mlbDivisions, league, playoffs) {
  const playoffTeams = getLeaguePlayoffTeams(standings, mlbDivisions, league);

  const seed1 = getSeedTeam(playoffTeams, 1);
  const seed2 = getSeedTeam(playoffTeams, 2);
  const seed3 = getSeedTeam(playoffTeams, 3);
  const seed4 = getSeedTeam(playoffTeams, 4);
  const seed5 = getSeedTeam(playoffTeams, 5);
  const seed6 = getSeedTeam(playoffTeams, 6);

  const wc1Teams = [seed3, seed6].filter(Boolean);
  const wc2Teams = [seed4, seed5].filter(Boolean);

  const wc1Winner = cleanWinner(playoffs?.[league]?.wc1Winner || "", wc1Teams);
  const wc2Winner = cleanWinner(playoffs?.[league]?.wc2Winner || "", wc2Teams);

  const ds1Teams = [seed1, wc2Winner].filter(Boolean);
  const ds2Teams = [seed2, wc1Winner].filter(Boolean);

  const ds1Winner = cleanWinner(playoffs?.[league]?.ds1Winner || "", ds1Teams);
  const ds2Winner = cleanWinner(playoffs?.[league]?.ds2Winner || "", ds2Teams);

  const lcsTeams = [ds1Winner, ds2Winner].filter(Boolean);
  const lcsWinner = cleanWinner(playoffs?.[league]?.lcsWinner || "", lcsTeams);

  return {
    playoffTeams,
    seeds: {
      1: seed1,
      2: seed2,
      3: seed3,
      4: seed4,
      5: seed5,
      6: seed6,
    },
    wildCard: {
      series1: {
        topSeed: seed3,
        bottomSeed: seed6,
        winner: wc1Winner,
        options: wc1Teams,
      },
      series2: {
        topSeed: seed4,
        bottomSeed: seed5,
        winner: wc2Winner,
        options: wc2Teams,
      },
    },
    divisionSeries: {
      series1: {
        topSeed: seed1,
        bottomSeed: wc2Winner,
        winner: ds1Winner,
        options: ds1Teams,
      },
      series2: {
        topSeed: seed2,
        bottomSeed: wc1Winner,
        winner: ds2Winner,
        options: ds2Teams,
      },
    },
    championshipSeries: {
      team1: ds1Winner,
      team2: ds2Winner,
      winner: lcsWinner,
      options: lcsTeams,
    },
  };
}

export function buildFullPlayoffBracket(standings, mlbDivisions, playoffs) {
  const al = buildLeagueBracket(standings, mlbDivisions, "AL", playoffs);
  const nl = buildLeagueBracket(standings, mlbDivisions, "NL", playoffs);

  const worldSeriesOptions = [
    al.championshipSeries.winner,
    nl.championshipSeries.winner,
  ].filter(Boolean);

  const worldSeriesWinner = cleanWinner(
    playoffs?.worldSeriesWinner || "",
    worldSeriesOptions,
  );

  return {
    AL: al,
    NL: nl,
    worldSeries: {
      team1: al.championshipSeries.winner,
      team2: nl.championshipSeries.winner,
      winner: worldSeriesWinner,
      options: worldSeriesOptions,
    },
  };
}
