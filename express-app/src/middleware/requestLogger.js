// One line per request, at debug level so it is silent in production and in
// tests. Enough to answer "did the mobile app actually call me?" without
// reaching for a debugger.
import * as logger from "../logger.js";

export function requestLogger(req, res, next) {
  const startedAt = Date.now();

  // 'finish' rather than logging up front, so the line can carry the status and
  // the duration — the two things you actually want when something is slow.
  res.on("finish", () => {
    logger.devLog(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms`);
  });

  next();
}
