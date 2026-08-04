// Routes about the API itself rather than about a resource.
import { Router } from "express";

const router = Router();

// A self-describing index. Cheap to keep accurate and it means a new client can
// discover what exists without the README.
router.get("/", (req, res) => {
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

export default router;
