// One error type for the whole API.
//
// Before this, every handler hand-rolled `return res.status(404).json({...})`,
// which meant the HTTP status and the message were decided in the same place as
// the business rule. That is the thing worth separating: the domain knows
// "there is no Pokémon with that id", but it should not know that the web calls
// that 404. So domain code throws an ApiError describing *what* went wrong, and
// a single middleware decides how to say it over HTTP.

export class ApiError extends Error {
  /**
   * @param {number} status  HTTP status to answer with
   * @param {string} message Safe to show a client — never an internal detail
   * @param {object} [extra] Extra fields merged into the response body
   */
  constructor(status, message, { code, ...extra } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    // A stable machine-readable code. Clients should branch on this rather than
    // on the human-readable message, which we want to stay free to reword.
    this.code = code ?? defaultCodeFor(status);
    this.extra = extra;
  }
}

function defaultCodeFor(status) {
  if (status === 400) return "BAD_REQUEST";
  if (status === 404) return "NOT_FOUND";
  return "INTERNAL_ERROR";
}

export const notFound = (message, options) => new ApiError(404, message, options);
export const badRequest = (message, options) => new ApiError(400, message, options);
