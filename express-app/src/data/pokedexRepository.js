// The connector: the only module that knows where the data physically lives.
//
// Right now it lives in memory. That is the point of isolating it — when this
// becomes a real database, every query moves into this file and nothing above
// it changes, because the layer above only ever asked for "the Pokémon with
// this id", never for a row from an array.
//
// Rules for this layer: lookups only. No business rules, no shaping for the
// wire, no HTTP status codes. It answers questions about storage and nothing
// else.

const pokemon = [
  { id: 1, name: "Bulbasaur", type: ["Grass", "Poison"], hp: 45, attack: 49, defense: 49, height: 0.7, weight: 6.9 },
  { id: 2, name: "Ivysaur", type: ["Grass", "Poison"], hp: 60, attack: 62, defense: 63, height: 1.0, weight: 13.0 },
  { id: 3, name: "Venusaur", type: ["Grass", "Poison"], hp: 80, attack: 82, defense: 83, height: 2.0, weight: 100.0 },
  { id: 4, name: "Charmander", type: ["Fire"], hp: 39, attack: 52, defense: 43, height: 0.6, weight: 8.5 },
  { id: 5, name: "Charmeleon", type: ["Fire"], hp: 58, attack: 64, defense: 58, height: 1.1, weight: 19.0 },
  { id: 6, name: "Charizard", type: ["Fire", "Flying"], hp: 78, attack: 84, defense: 78, height: 1.7, weight: 90.5 },
  { id: 7, name: "Squirtle", type: ["Water"], hp: 44, attack: 48, defense: 65, height: 0.5, weight: 9.0 },
  { id: 8, name: "Wartortle", type: ["Water"], hp: 59, attack: 63, defense: 80, height: 1.0, weight: 22.5 },
  { id: 9, name: "Blastoise", type: ["Water"], hp: 79, attack: 83, defense: 100, height: 1.6, weight: 85.5 },
  { id: 25, name: "Pikachu", type: ["Electric"], hp: 35, attack: 55, defense: 40, height: 0.4, weight: 6.0 },
];

const trainers = [
  { id: 1, name: "Ash Ketchum", hometown: "Pallet Town", badges: 8, team: [25, 1, 4] },
  { id: 2, name: "Misty", hometown: "Cerulean City", badges: 1, team: [7, 8, 9] },
];

// Which species a given Pokémon can still evolve into, itself included.
const evolutionChains = {
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

// `trainers` used to be an exported `let`, which meant any importer could
// reassign the whole roster out from under everyone else. Handing back copies
// keeps the store the only thing that can change the store.
export const allPokemon = () => [...pokemon];
export const allTrainers = () => [...trainers];

export const findPokemonById = (id) => pokemon.find((entry) => entry.id === id);
export const findTrainerById = (id) => trainers.find((entry) => entry.id === id);

export const findPokemonByName = (query) =>
  pokemon.filter((entry) => entry.name.toLowerCase().includes(query.toLowerCase()));

export const findPokemonByType = (type) =>
  pokemon.filter((entry) =>
    entry.type.some((entryType) => entryType.toLowerCase() === type.toLowerCase()),
  );

export const findTrainersByHometown = (city) =>
  trainers.filter((trainer) => trainer.hometown.toLowerCase().includes(city.toLowerCase()));

export const findEvolutionChain = (id) => evolutionChains[id] ?? [id];
