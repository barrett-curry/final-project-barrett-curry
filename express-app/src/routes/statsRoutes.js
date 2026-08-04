// Aggregate statistics across the whole Pokédex.
import { Router } from "express";

import * as pokemon from "../domain/pokemonService.js";

const router = Router();

router.get("/", (req, res) => {
  res.json(pokemon.pokedexStats());
});

export default router;
