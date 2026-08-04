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

// Kept because a test guards it. It is a leftover scratch endpoint with no
// caller, and the honest fix is to delete it and the test together — but that
// is a breaking change to the public surface, so it belongs in its own commit
// with a MAJOR version bump rather than smuggled into a refactor.
router.get("/bug", (req, res) => {
  res.json({
    message: "Bug Pokémon endpoint hit",
    venomoth: "a cool bug Pokémon",
  });
});

export default router;
