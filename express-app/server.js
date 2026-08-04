// The process entry point. Kept separate from app.js on purpose: app.js builds
// the Express application and server.js is the only thing that binds a port.
// That split is what lets Supertest run the whole API in-process during tests
// without ever opening a socket.
import app from "./app.js";
import * as logger from "./src/logger.js";

const port = process.env.PORT || 3000;

app.listen(port, () => {
  logger.log(`Pokédex API listening on http://localhost:${port}`);
});
