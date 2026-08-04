// Input validation, done once at the edge.
//
// Every id handler used to start with `parseInt(req.params.id)` and then rely on
// the lookup missing. That works by accident: `/pokemon/abc` parses to NaN,
// finds nothing, and answers "Pokémon not found" — which is a lie. Nothing was
// looked up, because "abc" was never a valid id. A client sent a malformed
// request and got told the resource does not exist, which sends them hunting for
// the wrong problem.
//
// Checking the shape of the input before using it separates "you asked wrong"
// (400) from "there is nothing there" (404).
import { badRequest } from "../errors.js";

/**
 * Parses a route parameter that must be a positive integer.
 * @param {string} raw   the raw parameter value
 * @param {string} name  what to call it in the error message
 */
export function numericParam(raw, name = "id") {
  // Guards against parseInt's forgiveness: it happily reads "12abc" as 12.
  if (!/^\d+$/.test(String(raw ?? "").trim())) {
    throw badRequest(`'${name}' must be a positive whole number, got '${raw}'`, {
      code: "INVALID_ID",
    });
  }
  return Number.parseInt(raw, 10);
}

/** Requires a non-empty string query parameter. */
export function requiredQuery(value, name, message) {
  if (typeof value !== "string" || value.trim() === "") {
    throw badRequest(message ?? `Please provide a '${name}' query parameter`, {
      code: "MISSING_QUERY_PARAM",
    });
  }
  return value;
}
