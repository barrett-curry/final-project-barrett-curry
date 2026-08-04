// HTTP adapters for the trainer resource. Same shape as pokemonRoutes: read,
// delegate, respond. Literal paths come before `/:id` for the same reason.
import { Router } from "express";

import * as trainers from "../domain/trainerService.js";
import { numericParam } from "../middleware/validate.js";

const router = Router();

router.get("/", (req, res) => {
  const list = trainers.listTrainers();
  res.json({ count: list.length, trainers: list });
});

router.get("/lineup", (req, res) => {
  const list = trainers.lineup();
  res.json({ count: list.length, lineup: list });
});

router.get("/rankings", (req, res) => {
  const list = trainers.rankings();
  res.json({ count: list.length, rankings: list });
});

router.get("/hometown/:city", (req, res) => {
  const city = req.params.city;
  const matches = trainers.listByHometown(city);
  res.json({ city, count: matches.length, trainers: matches });
});

router.get("/battle/:firstId/:secondId", (req, res) => {
  res.json(
    trainers.battle(
      numericParam(req.params.firstId, "firstId"),
      numericParam(req.params.secondId, "secondId"),
    ),
  );
});

router.get("/:id/ace", (req, res) => {
  res.json(trainers.acePokemon(trainers.getTrainer(numericParam(req.params.id))));
});

router.get("/:id/team-summary", (req, res) => {
  res.json(trainers.teamSummary(trainers.getTrainer(numericParam(req.params.id))));
});

// Must stay last.
router.get("/:id", (req, res) => {
  res.json(trainers.formatTrainer(trainers.getTrainer(numericParam(req.params.id))));
});

export default router;
