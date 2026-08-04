// HTTP adapters for the hero resource. Literal paths before `/:id`, same as
// the other routers.
//
// The handlers are async now that the data comes from Postgres. Express 5
// forwards a rejected promise from a handler to the error middleware on its
// own — in Express 4 this needed a wrapper, and forgetting it meant a failed
// query hung the request instead of answering 500.
import { Router } from "express";

import * as heroes from "../domain/heroService.js";
import { numericParam, requiredQuery } from "../middleware/validate.js";

const router = Router();

router.get("/", async (req, res) => {
  const list = await heroes.listHeroes();
  res.json({ count: list.length, heroes: list });
});

router.get("/teams", async (req, res) => {
  res.json(await heroes.teamBreakdown());
});

router.get("/search", async (req, res) => {
  const query = requiredQuery(req.query.name, "name");
  const results = await heroes.searchHeroes(query);
  res.json({ query, count: results.length, heroes: results });
});

router.get("/team/:team", async (req, res) => {
  const team = req.params.team;
  const matches = await heroes.listByTeam(team);
  res.json({ team, count: matches.length, heroes: matches });
});

router.get("/:id/archive", async (req, res) => {
  const limit = req.query.limit ? numericParam(req.query.limit, "limit") : undefined;
  res.json(await heroes.heroArchive(numericParam(req.params.id), { limit }));
});

router.get("/:id", async (req, res) => {
  res.json(await heroes.getHero(numericParam(req.params.id)));
});

export default router;
