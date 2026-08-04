// The domain layer for Pokémon: every rule about what the numbers *mean*.
//
// Nothing in here knows about Express. Handlers were doing arithmetic inline
// before, which made the rules impossible to test without spinning up HTTP and
// impossible to reuse — the type-count loop, for instance, was written three
// separate times in three endpoints. Now it is `countTypes`, used by all three.
//
// When a request cannot be satisfied this layer throws an ApiError describing
// what went wrong. It picks the status because "no such Pokémon" has exactly
// one sensible answer, but it never touches a response object.
import * as repository from "../data/pokedexRepository.js";
import { badRequest, notFound } from "../errors.js";

/** The one definition of "how strong is this thing", used everywhere. */
export const powerRating = (entry) => entry.hp + entry.attack + entry.defense;

export const statValue = (entry, stat) => entry[stat];

const STAT_FIELDS = ["hp", "attack", "defense", "weight", "height"];

const round1 = (value) => Math.round(value * 10) / 10;
const sumBy = (list, pick) => list.reduce((total, entry) => total + pick(entry), 0);
const maxBy = (list, pick) => list.reduce((best, entry) => (pick(entry) > pick(best) ? entry : best));
const minBy = (list, pick) => list.reduce((best, entry) => (pick(entry) < pick(best) ? entry : best));

/** How many Pokémon carry each type. Was duplicated in three endpoints. */
function countTypes(list) {
  return list.reduce((counts, entry) => {
    entry.type.forEach((type) => {
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, {});
}

export function getPokemon(id) {
  const found = repository.findPokemonById(id);
  if (!found) throw notFound("Pokémon not found", { code: "POKEMON_NOT_FOUND" });
  return found;
}

export const listPokemon = () => repository.allPokemon();

export function randomPokemon() {
  const list = repository.allPokemon();
  return list[Math.floor(Math.random() * list.length)];
}

export const searchByName = (query) => repository.findPokemonByName(query);

export function listByType(type) {
  const matches = repository.findPokemonByType(type);
  if (matches.length === 0) {
    throw notFound(`No Pokémon found with type: ${type}`, { code: "TYPE_NOT_FOUND" });
  }
  return matches;
}

export function topByStat(stat) {
  if (!STAT_FIELDS.includes(stat)) {
    // The list of what *would* have worked is part of the error, so a client can
    // correct itself without going to the docs.
    throw badRequest(`Unsupported stat: ${stat}`, {
      code: "UNSUPPORTED_STAT",
      supportedStats: STAT_FIELDS,
    });
  }

  const best = maxBy(repository.allPokemon(), (entry) => statValue(entry, stat));
  return { stat, pokemon: { id: best.id, name: best.name, value: statValue(best, stat) } };
}

export function comparePokemon(firstId, secondId) {
  const first = repository.findPokemonById(firstId);
  const second = repository.findPokemonById(secondId);

  if (!first || !second) {
    throw notFound("One or both Pokémon were not found", { code: "POKEMON_NOT_FOUND" });
  }

  const firstPower = powerRating(first);
  const secondPower = powerRating(second);
  const winner = firstPower === secondPower ? "tie" : firstPower > secondPower ? first : second;

  const side = (entry, power) => ({
    id: entry.id,
    name: entry.name,
    powerRating: power,
    stats: { hp: entry.hp, attack: entry.attack, defense: entry.defense },
  });

  return {
    first: side(first, firstPower),
    second: side(second, secondPower),
    winner:
      winner === "tie"
        ? { result: "tie" }
        : { result: "winner", id: winner.id, name: winner.name },
  };
}

// Hardcoded matchup tables. Real type effectiveness is a 18x18 matrix; this is
// the subset the seeded Pokémon actually need.
const OFFENSIVE = {
  Fire: ["Grass", "Ice", "Bug", "Steel"],
  Water: ["Fire", "Ground", "Rock"],
  Electric: ["Water", "Flying"],
  Grass: ["Water", "Ground", "Rock"],
  Flying: ["Grass", "Fighting", "Bug"],
};

const DEFENSIVE = {
  Fire: ["Water", "Ground", "Rock"],
  Water: ["Electric", "Grass"],
  Electric: ["Ground"],
  Grass: ["Fire", "Ice", "Flying", "Bug"],
  Flying: ["Electric", "Ice", "Rock"],
};

// Five near-identical if-blocks per direction became a table lookup. Adding a
// type is now a data change rather than a code change.
const lookupMatchups = (types, table) => [...new Set(types.flatMap((type) => table[type] ?? []))];

export function typeMatchups(id) {
  const entry = getPokemon(id);
  return {
    id: entry.id,
    name: entry.name,
    types: entry.type,
    matchups: {
      strongAgainst: lookupMatchups(entry.type, OFFENSIVE),
      vulnerableTo: lookupMatchups(entry.type, DEFENSIVE),
    },
  };
}

export function evolutionChain(id) {
  const starter = getPokemon(id);
  const chain = repository
    .findEvolutionChain(id)
    .map((entryId) => repository.findPokemonById(entryId))
    .filter(Boolean)
    .map((entry) => ({ id: entry.id, name: entry.name, types: entry.type }));

  return { starter: starter.name, chain, length: chain.length };
}

export function typeSummary(type) {
  const matches = repository.findPokemonByType(type);
  if (matches.length === 0) {
    throw notFound(`No Pokémon found with type: ${type}`, { code: "TYPE_NOT_FOUND" });
  }

  const strongest = maxBy(matches, powerRating);
  const weakest = minBy(matches, powerRating);

  return {
    type,
    count: matches.length,
    names: matches.map((entry) => entry.name),
    averages: {
      hp: Math.round(sumBy(matches, (entry) => entry.hp) / matches.length),
      attack: Math.round(sumBy(matches, (entry) => entry.attack) / matches.length),
      defense: Math.round(sumBy(matches, (entry) => entry.defense) / matches.length),
      power: Math.round(sumBy(matches, powerRating) / matches.length),
    },
    champions: {
      strongest: { name: strongest.name, powerRating: powerRating(strongest) },
      weakest: { name: weakest.name, powerRating: powerRating(weakest) },
    },
  };
}

export function library() {
  const sorted = repository.allPokemon().sort((left, right) => left.name.localeCompare(right.name));

  return {
    totalPokemon: sorted.length,
    names: sorted.map((entry) => entry.name),
    first: sorted[0].name,
    last: sorted[sorted.length - 1].name,
    typeCounts: countTypes(sorted),
  };
}

export function collectionSummary() {
  const list = repository.allPokemon();
  const typeSummaryPairs = Object.entries(countTypes(list)).sort((left, right) => right[1] - left[1]);
  const totalPower = sumBy(list, powerRating);

  return {
    totalPokemon: list.length,
    totalTrainers: repository.allTrainers().length,
    totalPower,
    typeSummary: typeSummaryPairs,
    topType: typeSummaryPairs[0],
    averagePower: round1(totalPower / list.length),
  };
}

export function pokedexStats() {
  const list = repository.allPokemon();
  const trainers = repository.allTrainers();
  const typeCount = countTypes(list);

  const mostCommonType = Object.entries(typeCount).reduce((prev, current) =>
    current[1] > prev[1] ? current : prev,
  );
  const rareTypes = Object.entries(typeCount).filter(([, count]) => count === 1);
  const mostPowerful = maxBy(list, powerRating);
  const mostExperienced = maxBy(trainers, (trainer) => trainer.badges);
  const totalBadges = sumBy(trainers, (trainer) => trainer.badges);

  const strongest = maxBy(list, (entry) => entry.attack);
  const tankiest = maxBy(list, (entry) => entry.defense);
  const healthiest = maxBy(list, (entry) => entry.hp);

  return {
    overview: {
      totalPokemon: list.length,
      totalTrainers: trainers.length,
      totalTypes: Object.keys(typeCount).length,
    },
    typeAnalysis: {
      distribution: typeCount,
      mostCommonType: { type: mostCommonType[0], count: mostCommonType[1] },
      rareTypes: rareTypes.map(([type]) => type),
    },
    averageStats: {
      hp: Math.round(sumBy(list, (entry) => entry.hp) / list.length),
      attack: Math.round(sumBy(list, (entry) => entry.attack) / list.length),
      defense: Math.round(sumBy(list, (entry) => entry.defense) / list.length),
      weight: round1(sumBy(list, (entry) => entry.weight) / list.length),
      height: round1(sumBy(list, (entry) => entry.height) / list.length),
    },
    champions: {
      strongest: { name: strongest.name, attack: strongest.attack },
      tankiest: { name: tankiest.name, defense: tankiest.defense },
      healthiest: { name: healthiest.name, hp: healthiest.hp },
      mostPowerful: {
        name: mostPowerful.name,
        powerRating: powerRating(mostPowerful),
        breakdown: `${mostPowerful.hp} HP + ${mostPowerful.attack} ATK + ${mostPowerful.defense} DEF`,
      },
    },
    physicalStats: {
      heaviest: pick(maxBy(list, (entry) => entry.weight), "weight"),
      lightest: pick(minBy(list, (entry) => entry.weight), "weight"),
      tallest: pick(maxBy(list, (entry) => entry.height), "height"),
      shortest: pick(minBy(list, (entry) => entry.height), "height"),
    },
    trainerStats: {
      totalBadges,
      averageBadges: round1(totalBadges / trainers.length),
      mostExperienced: {
        name: mostExperienced.name,
        badges: mostExperienced.badges,
        hometown: mostExperienced.hometown,
      },
    },
  };
}

const pick = (entry, field) => ({ name: entry.name, [field]: entry[field] });
