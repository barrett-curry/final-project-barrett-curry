import express from "express";

const app = express();
app.use(express.json());

const pokemon = [
  {
    id: 1,
    name: "Bulbasaur",
    type: ["Grass", "Poison"],
    hp: 45,
    attack: 49,
    defense: 49,
    height: 0.7,
    weight: 6.9,
  },
  {
    id: 2,
    name: "Ivysaur",
    type: ["Grass", "Poison"],
    hp: 60,
    attack: 62,
    defense: 63,
    height: 1.0,
    weight: 13.0,
  },
  {
    id: 3,
    name: "Venusaur",
    type: ["Grass", "Poison"],
    hp: 80,
    attack: 82,
    defense: 83,
    height: 2.0,
    weight: 100.0,
  },
  {
    id: 4,
    name: "Charmander",
    type: ["Fire"],
    hp: 39,
    attack: 52,
    defense: 43,
    height: 0.6,
    weight: 8.5,
  },
  {
    id: 5,
    name: "Charmeleon",
    type: ["Fire"],
    hp: 58,
    attack: 64,
    defense: 58,
    height: 1.1,
    weight: 19.0,
  },
  {
    id: 6,
    name: "Charizard",
    type: ["Fire", "Flying"],
    hp: 78,
    attack: 84,
    defense: 78,
    height: 1.7,
    weight: 90.5,
  },
  {
    id: 7,
    name: "Squirtle",
    type: ["Water"],
    hp: 44,
    attack: 48,
    defense: 65,
    height: 0.5,
    weight: 9.0,
  },
  {
    id: 8,
    name: "Wartortle",
    type: ["Water"],
    hp: 59,
    attack: 63,
    defense: 80,
    height: 1.0,
    weight: 22.5,
  },
  {
    id: 9,
    name: "Blastoise",
    type: ["Water"],
    hp: 79,
    attack: 83,
    defense: 100,
    height: 1.6,
    weight: 85.5,
  },
  {
    id: 25,
    name: "Pikachu",
    type: ["Electric"],
    hp: 35,
    attack: 55,
    defense: 40,
    height: 0.4,
    weight: 6.0,
  },
];

let trainers = [
  {
    id: 1,
    name: "Ash Ketchum",
    hometown: "Pallet Town",
    badges: 8,
    team: [25, 1, 4],
  },
  {
    id: 2,
    name: "Misty",
    hometown: "Cerulean City",
    badges: 1,
    team: [7, 8, 9],
  },
];

const getPokemonById = (id) => pokemon.find((entry) => entry.id === id);

const searchPokemonByName = (query) =>
  pokemon.filter((entry) =>
    entry.name.toLowerCase().includes(query.toLowerCase()),
  );

const searchPokemonByType = (type) =>
  pokemon.filter((entry) =>
    entry.type.some(
      (entryType) => entryType.toLowerCase() === type.toLowerCase(),
    ),
  );

const formatTrainer = (trainer) => ({
  ...trainer,
  team: trainer.team.map(
    (pokemonId) =>
      getPokemonById(pokemonId)?.name || `Unknown (ID: ${pokemonId})`,
  ),
});

const getPokemonStats = () => {
  const typeCount = {};
  let totalHp = 0;
  let totalAttack = 0;
  let totalDefense = 0;
  let totalWeight = 0;
  let totalHeight = 0;

  pokemon.forEach((entry) => {
    entry.type.forEach((type) => {
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    totalHp += entry.hp;
    totalAttack += entry.attack;
    totalDefense += entry.defense;
    totalWeight += entry.weight;
    totalHeight += entry.height;
  });

  const averageStats = {
    hp: Math.round(totalHp / pokemon.length),
    attack: Math.round(totalAttack / pokemon.length),
    defense: Math.round(totalDefense / pokemon.length),
    weight: Math.round((totalWeight / pokemon.length) * 10) / 10,
    height: Math.round((totalHeight / pokemon.length) * 10) / 10,
  };

  const strongestPokemon = pokemon.reduce((prev, current) =>
    prev.attack > current.attack ? prev : current,
  );
  const tankiestPokemon = pokemon.reduce((prev, current) =>
    prev.defense > current.defense ? prev : current,
  );
  const healthiestPokemon = pokemon.reduce((prev, current) =>
    prev.hp > current.hp ? prev : current,
  );
  const heaviestPokemon = pokemon.reduce((prev, current) =>
    prev.weight > current.weight ? prev : current,
  );
  const tallestPokemon = pokemon.reduce((prev, current) =>
    prev.height > current.height ? prev : current,
  );
  const lightestPokemon = pokemon.reduce((prev, current) =>
    prev.weight < current.weight ? prev : current,
  );
  const shortestPokemon = pokemon.reduce((prev, current) =>
    prev.height < current.height ? prev : current,
  );

  const pokemonWithPowerRating = pokemon.map((entry) => ({
    ...entry,
    powerRating: entry.hp + entry.attack + entry.defense,
  }));
  const mostPowerfulPokemon = pokemonWithPowerRating.reduce((prev, current) =>
    prev.powerRating > current.powerRating ? prev : current,
  );

  const mostCommonType = Object.entries(typeCount).reduce((prev, current) =>
    current[1] > prev[1] ? current : prev,
  );
  const rareTypes = Object.entries(typeCount).filter(
    ([, count]) => count === 1,
  );

  const totalBadges = trainers.reduce(
    (sum, trainer) => sum + trainer.badges,
    0,
  );
  const averageBadges = Math.round((totalBadges / trainers.length) * 10) / 10;
  const mostExperiencedTrainer = trainers.reduce((prev, current) =>
    prev.badges > current.badges ? prev : current,
  );

  return {
    overview: {
      totalPokemon: pokemon.length,
      totalTrainers: trainers.length,
      totalTypes: Object.keys(typeCount).length,
    },
    typeAnalysis: {
      distribution: typeCount,
      mostCommonType: {
        type: mostCommonType[0],
        count: mostCommonType[1],
      },
      rareTypes: rareTypes.map(([type]) => type),
    },
    averageStats,
    champions: {
      strongest: {
        name: strongestPokemon.name,
        attack: strongestPokemon.attack,
      },
      tankiest: {
        name: tankiestPokemon.name,
        defense: tankiestPokemon.defense,
      },
      healthiest: { name: healthiestPokemon.name, hp: healthiestPokemon.hp },
      mostPowerful: {
        name: mostPowerfulPokemon.name,
        powerRating: mostPowerfulPokemon.powerRating,
        breakdown: `${mostPowerfulPokemon.hp} HP + ${mostPowerfulPokemon.attack} ATK + ${mostPowerfulPokemon.defense} DEF`,
      },
    },
    physicalStats: {
      heaviest: { name: heaviestPokemon.name, weight: heaviestPokemon.weight },
      lightest: { name: lightestPokemon.name, weight: lightestPokemon.weight },
      tallest: { name: tallestPokemon.name, height: tallestPokemon.height },
      shortest: { name: shortestPokemon.name, height: shortestPokemon.height },
    },
    trainerStats: {
      totalBadges,
      averageBadges,
      mostExperienced: {
        name: mostExperiencedTrainer.name,
        badges: mostExperiencedTrainer.badges,
        hometown: mostExperiencedTrainer.hometown,
      },
    },
  };
};

const getPokemonPowerRating = (entry) =>
  entry.hp + entry.attack + entry.defense;

const getPokemonStatValue = (entry, stat) => entry[stat];

const buildPokemonComparison = (firstPokemon, secondPokemon) => {
  const firstPower = getPokemonPowerRating(firstPokemon);
  const secondPower = getPokemonPowerRating(secondPokemon);

  const winner =
    firstPower === secondPower
      ? "tie"
      : firstPower > secondPower
        ? firstPokemon
        : secondPokemon;

  return {
    first: {
      id: firstPokemon.id,
      name: firstPokemon.name,
      powerRating: firstPower,
      stats: {
        hp: firstPokemon.hp,
        attack: firstPokemon.attack,
        defense: firstPokemon.defense,
      },
    },
    second: {
      id: secondPokemon.id,
      name: secondPokemon.name,
      powerRating: secondPower,
      stats: {
        hp: secondPokemon.hp,
        attack: secondPokemon.attack,
        defense: secondPokemon.defense,
      },
    },
    winner:
      winner === "tie"
        ? { result: "tie" }
        : {
            result: "winner",
            id: winner.id,
            name: winner.name,
          },
  };
};

const getTrainerTeamSummary = (trainer) => {
  const teamPokemon = trainer.team
    .map((pokemonId) => getPokemonById(pokemonId))
    .filter(Boolean);

  const totalPower = teamPokemon.reduce(
    (sum, entry) => sum + getPokemonPowerRating(entry),
    0,
  );

  const strongestPokemon = teamPokemon.reduce((prev, current) =>
    getPokemonPowerRating(prev) > getPokemonPowerRating(current)
      ? prev
      : current,
  );

  return {
    trainer: {
      id: trainer.id,
      name: trainer.name,
      hometown: trainer.hometown,
      badges: trainer.badges,
    },
    team: formatTrainer(trainer).team,
    summary: {
      totalMembers: teamPokemon.length,
      totalPower,
      averagePower: Math.round((totalPower / teamPokemon.length) * 10) / 10,
      strongestPokemon: {
        id: strongestPokemon.id,
        name: strongestPokemon.name,
        powerRating: getPokemonPowerRating(strongestPokemon),
      },
      typeCoverage: [...new Set(teamPokemon.flatMap((entry) => entry.type))],
    },
  };
};

const buildTeamRankings = () =>
  trainers
    .map((trainer) => {
      const summary = getTrainerTeamSummary(trainer);

      return {
        ...summary,
        summary: {
          ...summary.summary,
          averagePower: Math.round(summary.summary.averagePower * 10) / 10,
        },
      };
    })
    .sort((left, right) => {
      if (right.summary.totalPower !== left.summary.totalPower) {
        return right.summary.totalPower - left.summary.totalPower;
      }

      return right.trainer.badges - left.trainer.badges;
    });

const getPokemonTypeMatchups = (pokemonEntry) => {
  const offensiveTypes = pokemonEntry.type;
  const defensiveTypes = pokemonEntry.type;
  const strongAgainst = [];
  const vulnerableTo = [];

  if (offensiveTypes.includes("Fire")) {
    strongAgainst.push("Grass", "Ice", "Bug", "Steel");
  }
  if (offensiveTypes.includes("Water")) {
    strongAgainst.push("Fire", "Ground", "Rock");
  }
  if (offensiveTypes.includes("Electric")) {
    strongAgainst.push("Water", "Flying");
  }
  if (offensiveTypes.includes("Grass")) {
    strongAgainst.push("Water", "Ground", "Rock");
  }
  if (offensiveTypes.includes("Flying")) {
    strongAgainst.push("Grass", "Fighting", "Bug");
  }

  if (defensiveTypes.includes("Fire")) {
    vulnerableTo.push("Water", "Ground", "Rock");
  }
  if (defensiveTypes.includes("Water")) {
    vulnerableTo.push("Electric", "Grass");
  }
  if (defensiveTypes.includes("Electric")) {
    vulnerableTo.push("Ground");
  }
  if (defensiveTypes.includes("Grass")) {
    vulnerableTo.push("Fire", "Ice", "Flying", "Bug");
  }
  if (defensiveTypes.includes("Flying")) {
    vulnerableTo.push("Electric", "Ice", "Rock");
  }

  return {
    strongAgainst: [...new Set(strongAgainst)],
    vulnerableTo: [...new Set(vulnerableTo)],
  };
};

const pokemonEvolutionChains = {
  1: [1, 2, 3],
  2: [2, 3],
  3: [3],
  4: [4, 5, 6],
  5: [5, 6],
  6: [6],
  7: [7, 8, 9],
  8: [8, 9],
  9: [9],
  25: [25],
};

const buildPokemonTypeSummary = (type) => {
  const filteredPokemon = searchPokemonByType(type);

  if (filteredPokemon.length === 0) {
    return null;
  }

  const totalHp = filteredPokemon.reduce((sum, entry) => sum + entry.hp, 0);
  const totalAttack = filteredPokemon.reduce(
    (sum, entry) => sum + entry.attack,
    0,
  );
  const totalDefense = filteredPokemon.reduce(
    (sum, entry) => sum + entry.defense,
    0,
  );
  const totalPower = filteredPokemon.reduce(
    (sum, entry) => sum + getPokemonPowerRating(entry),
    0,
  );

  const strongestPokemon = filteredPokemon.reduce((prev, current) =>
    getPokemonPowerRating(prev) > getPokemonPowerRating(current)
      ? prev
      : current,
  );
  const weakestPokemon = filteredPokemon.reduce((prev, current) =>
    getPokemonPowerRating(prev) < getPokemonPowerRating(current)
      ? prev
      : current,
  );

  return {
    type,
    count: filteredPokemon.length,
    names: filteredPokemon.map((entry) => entry.name),
    averages: {
      hp: Math.round(totalHp / filteredPokemon.length),
      attack: Math.round(totalAttack / filteredPokemon.length),
      defense: Math.round(totalDefense / filteredPokemon.length),
      power: Math.round(totalPower / filteredPokemon.length),
    },
    champions: {
      strongest: {
        name: strongestPokemon.name,
        powerRating: getPokemonPowerRating(strongestPokemon),
      },
      weakest: {
        name: weakestPokemon.name,
        powerRating: getPokemonPowerRating(weakestPokemon),
      },
    },
  };
};

const buildPokemonLibrary = () => {
  const sortedPokemon = [...pokemon].sort((left, right) =>
    left.name.localeCompare(right.name),
  );

  return {
    totalPokemon: sortedPokemon.length,
    names: sortedPokemon.map((entry) => entry.name),
    first: sortedPokemon[0].name,
    last: sortedPokemon[sortedPokemon.length - 1].name,
    typeCounts: sortedPokemon.reduce((counts, entry) => {
      entry.type.forEach((type) => {
        counts[type] = (counts[type] || 0) + 1;
      });

      return counts;
    }, {}),
  };
};

const buildCollectionSummary = () => {
  const typeSummary = Object.entries(
    pokemon.reduce((counts, entry) => {
      entry.type.forEach((type) => {
        counts[type] = (counts[type] || 0) + 1;
      });

      return counts;
    }, {}),
  ).sort((left, right) => right[1] - left[1]);

  return {
    totalPokemon: pokemon.length,
    totalTrainers: trainers.length,
    totalPower: pokemon.reduce(
      (sum, entry) => sum + getPokemonPowerRating(entry),
      0,
    ),
    typeSummary,
    topType: typeSummary[0],
    averagePower:
      Math.round(
        (pokemon.reduce((sum, entry) => sum + getPokemonPowerRating(entry), 0) /
          pokemon.length) *
          10,
      ) / 10,
  };
};

const getTrainerAcePokemon = (trainer) => {
  const teamPokemon = trainer.team
    .map((pokemonId) => getPokemonById(pokemonId))
    .filter(Boolean);

  const acePokemon = teamPokemon.reduce((prev, current) =>
    getPokemonPowerRating(prev) > getPokemonPowerRating(current)
      ? prev
      : current,
  );

  return {
    trainer: formatTrainer(trainer),
    ace: {
      id: acePokemon.id,
      name: acePokemon.name,
      powerRating: getPokemonPowerRating(acePokemon),
    },
    teamPower: teamPokemon.reduce(
      (sum, entry) => sum + getPokemonPowerRating(entry),
      0,
    ),
  };
};

const buildTrainerLineup = () =>
  [...trainers]
    .sort((left, right) => right.badges - left.badges)
    .map((trainer, index) => ({
      position: index + 1,
      trainer: trainer.name,
      hometown: trainer.hometown,
      badges: trainer.badges,
    }));

const buildTrainerBattle = (firstTrainer, secondTrainer) => {
  const firstSummary = getTrainerTeamSummary(firstTrainer);
  const secondSummary = getTrainerTeamSummary(secondTrainer);

  let winner = {
    result: "tie",
  };

  if (firstSummary.summary.totalPower > secondSummary.summary.totalPower) {
    winner = {
      result: "winner",
      trainerId: firstTrainer.id,
      trainerName: firstTrainer.name,
      reason: "higher total team power",
    };
  } else if (
    firstSummary.summary.totalPower < secondSummary.summary.totalPower
  ) {
    winner = {
      result: "winner",
      trainerId: secondTrainer.id,
      trainerName: secondTrainer.name,
      reason: "higher total team power",
    };
  } else if (firstTrainer.badges > secondTrainer.badges) {
    winner = {
      result: "winner",
      trainerId: firstTrainer.id,
      trainerName: firstTrainer.name,
      reason: "badge tiebreaker",
    };
  } else if (firstTrainer.badges < secondTrainer.badges) {
    winner = {
      result: "winner",
      trainerId: secondTrainer.id,
      trainerName: secondTrainer.name,
      reason: "badge tiebreaker",
    };
  }

  return {
    first: firstSummary,
    second: secondSummary,
    winner,
  };
};

app.get("/bug", (req, res) => {
  const venomoth = "a cool bug Pokémon";
  res.json({
    message: "Bug Pokémon endpoint hit",
    venomoth: venomoth,
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Pokédex API!",
    endpoints: {
      "GET /": "This welcome message",
      "GET /pokemon": "Get all Pokémon",
      "GET /pokemon/:id": "Get a specific Pokémon by ID",
      "GET /pokemon/type/:type": "Get Pokémon by type",
      "GET /pokemon/search": "Search Pokémon by name",
      "GET /trainers": "Get all trainers",
      "GET /stats": "Get Pokédex statistics",
    },
  });
});

app.get("/pokemon", (req, res) => {
  res.json({
    count: pokemon.length,
    pokemon: pokemon,
  });
});

app.get("/pokemon/random", (req, res) => {
  const randomIndex = Math.floor(Math.random() * pokemon.length);
  res.json({
    pokemon: pokemon[randomIndex],
  });
});

app.get("/pokemon/library", (req, res) => {
  res.json(buildPokemonLibrary());
});

app.get("/pokemon/collection-summary", (req, res) => {
  res.json(buildCollectionSummary());
});

app.get("/pokemon/type-summary/:type", (req, res) => {
  const summary = buildPokemonTypeSummary(req.params.type);

  if (!summary) {
    return res
      .status(404)
      .json({ error: `No Pokémon found with type: ${req.params.type}` });
  }

  res.json(summary);
});

app.get("/pokemon/evolution/:id", (req, res) => {
  const pokemonId = parseInt(req.params.id);
  const pokemonEntry = getPokemonById(pokemonId);

  if (!pokemonEntry) {
    return res.status(404).json({ error: "Pokémon not found" });
  }

  const chainIds = pokemonEvolutionChains[pokemonId] || [pokemonId];
  const chain = chainIds
    .map((entryId) => getPokemonById(entryId))
    .filter(Boolean)
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      types: entry.type,
    }));

  res.json({
    starter: pokemonEntry.name,
    chain,
    length: chain.length,
  });
});

app.get("/pokemon/top/:stat", (req, res) => {
  const stat = req.params.stat.toLowerCase();
  const supportedStats = ["hp", "attack", "defense", "weight", "height"];

  if (!supportedStats.includes(stat)) {
    return res.status(400).json({
      error: `Unsupported stat: ${stat}`,
      supportedStats,
    });
  }

  const topPokemon = pokemon.reduce((prev, current) =>
    getPokemonStatValue(prev, stat) > getPokemonStatValue(current, stat)
      ? prev
      : current,
  );

  res.json({
    stat,
    pokemon: {
      id: topPokemon.id,
      name: topPokemon.name,
      value: getPokemonStatValue(topPokemon, stat),
    },
  });
});

app.get("/pokemon/type-matchup/:id", (req, res) => {
  const pokemonId = parseInt(req.params.id);
  const pokemonEntry = getPokemonById(pokemonId);

  if (!pokemonEntry) {
    return res.status(404).json({ error: "Pokémon not found" });
  }

  res.json({
    id: pokemonEntry.id,
    name: pokemonEntry.name,
    types: pokemonEntry.type,
    matchups: getPokemonTypeMatchups(pokemonEntry),
  });
});

app.get("/pokemon/compare/:firstId/:secondId", (req, res) => {
  const firstId = parseInt(req.params.firstId);
  const secondId = parseInt(req.params.secondId);
  const firstPokemon = getPokemonById(firstId);
  const secondPokemon = getPokemonById(secondId);

  if (!firstPokemon || !secondPokemon) {
    return res
      .status(404)
      .json({ error: "One or both Pokémon were not found" });
  }

  res.json(buildPokemonComparison(firstPokemon, secondPokemon));
});

app.get("/pokemon/search", (req, res) => {
  const query = req.query.name;

  if (!query) {
    return res
      .status(400)
      .json({ error: "Please provide a 'name' query parameter" });
  }

  const results = searchPokemonByName(query);

  res.json({
    query: query,
    count: results.length,
    pokemon: results,
  });
});

app.get("/pokemon/type/:type", (req, res) => {
  const type = req.params.type;
  const filteredPokemon = searchPokemonByType(type);

  if (filteredPokemon.length === 0) {
    return res
      .status(404)
      .json({ error: `No Pokémon found with type: ${type}` });
  }

  res.json({
    type: type,
    count: filteredPokemon.length,
    pokemon: filteredPokemon,
  });
});

app.get("/pokemon/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const foundPokemon = getPokemonById(id);

  if (!foundPokemon) {
    return res.status(404).json({ error: "Pokémon not found" });
  }

  res.json(foundPokemon);
});

app.get("/stats", (req, res) => {
  const stats = getPokemonStats();
  res.json({
    ...stats,
  });
});

app.get("/trainers", (req, res) => {
  const trainersWithPokemon = trainers.map((trainer) => formatTrainer(trainer));

  res.json({
    count: trainers.length,
    trainers: trainersWithPokemon,
  });
});

app.get("/trainers/lineup", (req, res) => {
  res.json({
    count: trainers.length,
    lineup: buildTrainerLineup(),
  });
});

app.get("/trainers/hometown/:city", (req, res) => {
  const city = req.params.city.toLowerCase();
  const matchingTrainers = trainers.filter((trainer) =>
    trainer.hometown.toLowerCase().includes(city),
  );

  if (matchingTrainers.length === 0) {
    return res
      .status(404)
      .json({ error: `No trainers found from ${req.params.city}` });
  }

  res.json({
    city: req.params.city,
    count: matchingTrainers.length,
    trainers: matchingTrainers.map((trainer) => formatTrainer(trainer)),
  });
});

app.get("/trainers/:id/ace", (req, res) => {
  const trainerId = parseInt(req.params.id);
  const trainer = trainers.find((entry) => entry.id === trainerId);

  if (!trainer) {
    return res.status(404).json({ error: "Trainer not found" });
  }

  res.json(getTrainerAcePokemon(trainer));
});

app.get("/trainers/rankings", (req, res) => {
  res.json({
    count: trainers.length,
    rankings: buildTeamRankings(),
  });
});

app.get("/trainers/battle/:firstId/:secondId", (req, res) => {
  const firstId = parseInt(req.params.firstId);
  const secondId = parseInt(req.params.secondId);
  const firstTrainer = trainers.find((entry) => entry.id === firstId);
  const secondTrainer = trainers.find((entry) => entry.id === secondId);

  if (!firstTrainer || !secondTrainer) {
    return res
      .status(404)
      .json({ error: "One or both trainers were not found" });
  }

  res.json(buildTrainerBattle(firstTrainer, secondTrainer));
});

app.get("/trainers/:id/team-summary", (req, res) => {
  const trainerId = parseInt(req.params.id);
  const trainer = trainers.find((entry) => entry.id === trainerId);

  if (!trainer) {
    return res.status(404).json({ error: "Trainer not found" });
  }

  res.json(getTrainerTeamSummary(trainer));
});

app.get("/trainers/:id", (req, res) => {
  const trainerId = parseInt(req.params.id);
  const trainer = trainers.find((entry) => entry.id === trainerId);

  if (!trainer) {
    return res.status(404).json({ error: "Trainer not found" });
  }

  res.json(formatTrainer(trainer));
});

export default app;

export {
  formatTrainer,
  getPokemonById,
  getPokemonStats,
  getPokemonPowerRating,
  getPokemonStatValue,
  buildPokemonComparison,
  getTrainerTeamSummary,
  pokemon,
  searchPokemonByName,
  searchPokemonByType,
  trainers,
};
