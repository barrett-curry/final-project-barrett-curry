// HTTP adapters for the Pokémon resource.
//
// Every handler here does the same three things and nothing else: read the
// request, call one domain function, send the result. There is no arithmetic,
// no filtering, and no `if (!found) return res.status(404)` — failures are
// thrown by the domain and shaped by the error middleware.
//
// Route order still matters. `/pokemon/search` has to be registered before
// `/pokemon/:id`, or Express matches "search" as an id and every search returns
// "Pokémon not found". That is why `:id` is last in the file.
import { Router } from "express";

import * as pokemon from "../domain/pokemonService.js";
import { numericParam, requiredQuery } from "../middleware/validate.js";

const router = Router();

router.get("/", (req, res) => {
  const list = pokemon.listPokemon();
  res.json({ count: list.length, pokemon: list });
});

router.get("/random", (req, res) => {
  res.json({ pokemon: pokemon.randomPokemon() });
});

router.get("/library", (req, res) => {
  res.json(pokemon.library());
});

router.get("/collection-summary", (req, res) => {
  res.json(pokemon.collectionSummary());
});

router.get("/search", (req, res) => {
  const query = requiredQuery(
    req.query.name,
    "name",
    "Please provide a 'name' query parameter",
  );
  const results = pokemon.searchByName(query);
  res.json({ query, count: results.length, pokemon: results });
});

router.get("/type-summary/:type", (req, res) => {
  res.json(pokemon.typeSummary(req.params.type));
});

router.get("/type-matchup/:id", (req, res) => {
  res.json(pokemon.typeMatchups(numericParam(req.params.id)));
});

router.get("/evolution/:id", (req, res) => {
  res.json(pokemon.evolutionChain(numericParam(req.params.id)));
});

router.get("/top/:stat", (req, res) => {
  res.json(pokemon.topByStat(req.params.stat.toLowerCase()));
});

router.get("/compare/:firstId/:secondId", (req, res) => {
  res.json(
    pokemon.comparePokemon(
      numericParam(req.params.firstId, "firstId"),
      numericParam(req.params.secondId, "secondId"),
    ),
  );
});

router.get("/type/:type", (req, res) => {
  const type = req.params.type;
  const matches = pokemon.listByType(type);
  res.json({ type, count: matches.length, pokemon: matches });
});

// Must stay last: a bare `:id` matches anything.
router.get("/:id", (req, res) => {
  res.json(pokemon.getPokemon(numericParam(req.params.id)));
});

export default router;
