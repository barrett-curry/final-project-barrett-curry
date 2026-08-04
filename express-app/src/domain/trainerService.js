// The domain layer for trainers.
//
// Split from Pokémon rules because they change for different reasons: team
// power and badge tiebreakers are trainer concerns, and type effectiveness is
// not. Both lean on `powerRating` from pokemonService, which is the one place
// that decides what "strong" means.
import * as repository from "../data/pokedexRepository.js";
import { notFound } from "../errors.js";
import { powerRating } from "./pokemonService.js";

const round1 = (value) => Math.round(value * 10) / 10;
const sumBy = (list, pick) => list.reduce((total, entry) => total + pick(entry), 0);
const maxBy = (list, pick) => list.reduce((best, entry) => (pick(entry) > pick(best) ? entry : best));

/** Swaps a trainer's team of ids for the names a human wants to read. */
export const formatTrainer = (trainer) => ({
  ...trainer,
  team: trainer.team.map(
    (pokemonId) => repository.findPokemonById(pokemonId)?.name || `Unknown (ID: ${pokemonId})`,
  ),
});

export function getTrainer(id) {
  const trainer = repository.findTrainerById(id);
  if (!trainer) throw notFound("Trainer not found", { code: "TRAINER_NOT_FOUND" });
  return trainer;
}

export const listTrainers = () => repository.allTrainers().map(formatTrainer);

export function listByHometown(city) {
  const matches = repository.findTrainersByHometown(city);
  if (matches.length === 0) {
    throw notFound(`No trainers found from ${city}`, { code: "HOMETOWN_NOT_FOUND" });
  }
  return matches.map(formatTrainer);
}

// `filter(Boolean)` matters: a team can name a Pokémon id that no longer
// exists, and the lookup returns undefined for it. That also means a team can
// come back empty even when the trainer lists members — which is why
// everything below has to survive an empty team rather than assume one.
const teamOf = (trainer) =>
  trainer.team.map((pokemonId) => repository.findPokemonById(pokemonId)).filter(Boolean);

export function teamSummary(trainer) {
  const team = teamOf(trainer);
  // `reduce` with no initial value throws on an empty array, so `maxBy` is only
  // safe once there is something to compare. Both seeded trainers have full
  // teams, which is exactly why this crashed silently for so long: the bug was
  // unreachable with the current data and would have surfaced the first time
  // someone added a trainer without one, as a 500 with a TypeError in the log.
  const strongest = team.length ? maxBy(team, powerRating) : null;
  const totalPower = sumBy(team, powerRating);

  return {
    trainer: {
      id: trainer.id,
      name: trainer.name,
      hometown: trainer.hometown,
      badges: trainer.badges,
    },
    team: formatTrainer(trainer).team,
    summary: {
      totalMembers: team.length,
      totalPower,
      // 0/0 is NaN, which does not survive JSON — it serializes to null anyway,
      // but by accident rather than on purpose. Saying null deliberately means
      // "no average exists", which is true of a trainer with no Pokémon.
      averagePower: team.length ? round1(totalPower / team.length) : null,
      strongestPokemon: strongest
        ? { id: strongest.id, name: strongest.name, powerRating: powerRating(strongest) }
        : null,
      typeCoverage: [...new Set(team.flatMap((entry) => entry.type))],
    },
  };
}

export function acePokemon(trainer) {
  const team = teamOf(trainer);
  const ace = team.length ? maxBy(team, powerRating) : null;

  return {
    trainer: formatTrainer(trainer),
    // A trainer with no Pokémon has no ace. Null says that; inventing one or
    // throwing would both be worse answers to a legitimate question.
    ace: ace ? { id: ace.id, name: ace.name, powerRating: powerRating(ace) } : null,
    teamPower: sumBy(team, powerRating),
  };
}

/** Trainers by badge count — a leaderboard of experience, not of strength. */
export const lineup = () =>
  repository
    .allTrainers()
    .sort((left, right) => right.badges - left.badges)
    .map((trainer, index) => ({
      position: index + 1,
      trainer: trainer.name,
      hometown: trainer.hometown,
      badges: trainer.badges,
    }));

/** Trainers by total team power, with badges as the tiebreaker. */
export const rankings = () =>
  repository
    .allTrainers()
    .map(teamSummary)
    .sort((left, right) => {
      if (right.summary.totalPower !== left.summary.totalPower) {
        return right.summary.totalPower - left.summary.totalPower;
      }
      return right.trainer.badges - left.trainer.badges;
    });

export function battle(firstId, secondId) {
  const first = repository.findTrainerById(firstId);
  const second = repository.findTrainerById(secondId);

  if (!first || !second) {
    throw notFound("One or both trainers were not found", { code: "TRAINER_NOT_FOUND" });
  }

  const firstSummary = teamSummary(first);
  const secondSummary = teamSummary(second);

  // Power decides it; badges only break a tie; an exact tie on both is a draw.
  const win = (trainer, reason) => ({
    result: "winner",
    trainerId: trainer.id,
    trainerName: trainer.name,
    reason,
  });

  let winner = { result: "tie" };
  if (firstSummary.summary.totalPower !== secondSummary.summary.totalPower) {
    const stronger =
      firstSummary.summary.totalPower > secondSummary.summary.totalPower ? first : second;
    winner = win(stronger, "higher total team power");
  } else if (first.badges !== second.badges) {
    winner = win(first.badges > second.badges ? first : second, "badge tiebreaker");
  }

  return { first: firstSummary, second: secondSummary, winner };
}
