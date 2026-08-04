// Tests for the API client, separate from the screen tests.
//
// The screen suite mocks this layer away so it can test filtering and sorting
// synchronously. That leaves the fetch behavior itself untested, which is what
// this file covers — one suite per reason to fail.
import { fetchArchive, fetchHero, fetchHeroes } from "../src/api/heroes";

const mockFetch = (body: unknown, init: { ok?: boolean; status?: number } = {}) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  }) as unknown as typeof fetch;
};

describe("hero API client", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("unwraps the roster from the response envelope", async () => {
    // The endpoint answers { count, heroes }; callers should get the array.
    mockFetch({ count: 1, heroes: [{ id: 1, name: "Spider-Man" }] });

    await expect(fetchHeroes()).resolves.toEqual([{ id: 1, name: "Spider-Man" }]);
  });

  it("surfaces the server's own error message rather than a status code", async () => {
    mockFetch({ error: "Hero not found", code: "HERO_NOT_FOUND" }, { ok: false, status: 404 });

    await expect(fetchHero(999)).rejects.toThrow("Hero not found");
  });

  it("sends the archive filters as query parameters", async () => {
    // These have to reach the server. If they were dropped the app would still
    // work — it would fetch all 1,400 rows and the screen would look right —
    // so the bug would be invisible except as a slow page.
    mockFetch({ count: 0, total: 0, entries: [] });

    await fetchArchive({ search: "Gotham", team: "Justice League", limit: 25 });

    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain("search=Gotham");
    expect(url).toContain("team=Justice+League");
    expect(url).toContain("limit=25");
  });

  it("omits the team filter when the screen says 'All'", async () => {
    // "All" is the UI's word for no filter. Sending it verbatim would ask the
    // database for a team literally named All and return nothing.
    mockFetch({ count: 0, total: 0, entries: [] });

    await fetchArchive({ team: "All" });

    expect((global.fetch as jest.Mock).mock.calls[0][0]).not.toContain("team=");
  });

  it("explains how to start the API when the network call itself fails", async () => {
    // A dead server and a 404 are different problems, and only one of them is
    // something the developer can fix by starting a process.
    global.fetch = jest.fn().mockRejectedValue(new TypeError("Failed to fetch")) as never;

    await expect(fetchHeroes()).rejects.toThrow(/Is it running/);
  });
});
