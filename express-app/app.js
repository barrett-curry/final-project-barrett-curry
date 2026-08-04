// Composition root.
//
// This file used to be 917 lines: the Pokémon and trainer data, every business
// rule, and every HTTP handler in one place. Now it only wires things together,
// and you can read the whole shape of the application in one screen.
//
// The order of the middleware below is not cosmetic — it is the request's path
// through the app, and two positions in it are load-bearing. See the comments.
import cors from "cors";
import express from "express";

import { errorHandler, notFoundHandler } from "./src/middleware/errorHandler.js";
import { requestLogger } from "./src/middleware/requestLogger.js";
import archiveRoutes from "./src/routes/archiveRoutes.js";
import healthRoutes from "./src/routes/healthRoutes.js";
import heroRoutes from "./src/routes/heroRoutes.js";
import metaRoutes from "./src/routes/metaRoutes.js";
import pokemonRoutes from "./src/routes/pokemonRoutes.js";
import statsRoutes from "./src/routes/statsRoutes.js";
import trainerRoutes from "./src/routes/trainerRoutes.js";

const app = express();

// CORS goes first, before anything that can reject a request. A browser sends a
// preflight OPTIONS before any cross-origin request with a JSON body or an auth
// header, and if that preflight is answered by something further down the stack
// it never gets the allow-origin header — so the real request is never sent and
// the browser reports a generic "Failed to fetch" with no useful detail.
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Before the resource routes: a health probe should stay cheap and should not
// be affected by anything the rest of the app does.
app.use("/health", healthRoutes);

app.use("/", metaRoutes);
app.use("/pokemon", pokemonRoutes);
app.use("/trainers", trainerRoutes);
app.use("/stats", statsRoutes);
// Adding a whole second resource is one line here, because the layering means
// heroes bring their own connector, service, and router rather than being
// spliced into someone else's file.
app.use("/heroes", heroRoutes);
app.use("/archive", archiveRoutes);

// Anything that matched no route above is a 404, answered as JSON.
app.use(notFoundHandler);

// Error handling goes last. Express only sends an error to a four-argument
// handler registered *after* the route that threw, so moving this up would
// silently stop it working.
app.use(errorHandler);

export default app;

// Re-exported so the module's public surface is unchanged by the refactor.
// Nothing in the repo imports these, but removing an export is a breaking
// change, and a refactor that changes no behavior should not force a MAJOR
// version bump. They now point at the domain layer instead of at local
// functions.
export {
  formatTrainer,
  teamSummary as getTrainerTeamSummary,
} from "./src/domain/trainerService.js";

export {
  comparePokemon as buildPokemonComparison,
  pokedexStats as getPokemonStats,
  powerRating as getPokemonPowerRating,
  searchByName as searchPokemonByName,
  statValue as getPokemonStatValue,
} from "./src/domain/pokemonService.js";

// These two come from the repository rather than the domain service on purpose.
// The service's getPokemon() throws when nothing matches, but the old exported
// getPokemonById() returned undefined — and quietly turning a return value into
// a thrown error is exactly the kind of breaking change a caller finds out
// about in production. The repository's finder has the original semantics.
export {
  findPokemonById as getPokemonById,
  findPokemonByType as searchPokemonByType,
  allPokemon as pokemon,
  allTrainers as trainers,
} from "./src/data/pokedexRepository.js";
