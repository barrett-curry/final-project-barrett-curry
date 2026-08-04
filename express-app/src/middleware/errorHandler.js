// The single place the API decides how a failure looks over HTTP.
//
// Every handler used to build its own `res.status(...).json({ error })`, which
// meant the response shape drifted and any new endpoint had to remember the
// convention. Now handlers throw and this decides, so the shape cannot drift.
//
// The important rule here is the last one: an error we did not raise on purpose
// is answered with a generic message. A stack trace or a database error string
// tells an attacker about your internals, and tells an ordinary user nothing
// useful. The real detail goes to the log, where it belongs.
import { ApiError } from "../errors.js";
import * as logger from "../logger.js";

export function notFoundHandler(req, res) {
  // Without this, an unknown path fell through to Express's default HTML page —
  // a JSON API answering in HTML, which breaks any client that parses it.
  res.status(404).json({
    error: `No route matches ${req.method} ${req.originalUrl}`,
    code: "ROUTE_NOT_FOUND",
  });
}

// Express identifies an error handler by its four parameters, so `next` has to
// stay even though it is unused.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    // Expected: a rule said no. Interesting while developing, not a server
    // problem, so it does not get logged at error level.
    logger.devLog(`${req.method} ${req.originalUrl} -> ${err.status} ${err.code}`);
    return res.status(err.status).json({
      error: err.message,
      code: err.code,
      ...err.extra,
    });
  }

  // Unexpected: a genuine bug. Log everything, tell the client nothing.
  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, err);
  res.status(500).json({
    error: "Something went wrong on our end.",
    code: "INTERNAL_ERROR",
  });
}
