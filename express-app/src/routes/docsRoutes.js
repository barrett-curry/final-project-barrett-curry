// The API documentation page.
//
// Rendered from the same catalog `GET /` serves, so the page cannot describe a
// route that does not exist or miss one that does. The previous hand-written
// endpoint list had drifted to 7 entries out of 30 inside a single working
// session; a docs page is that failure mode with ten times the surface, which
// is why none of the route list below is typed out.
//
// It is server-rendered plain HTML with no build step and no dependencies. A
// docs page that needs its own toolchain is a docs page that stops working.
import { Router } from "express";

import { buildCatalog } from "./catalog.js";
import { descriptions } from "./descriptions.js";

/** Escapes text destined for HTML. Descriptions are ours, but that is a reason
 *  to be consistent rather than a reason to skip it — the day someone accepts a
 *  description from elsewhere, this is already correct. */
const escape = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function renderParams(label, entries) {
  if (!entries) return "";
  const rows = Object.entries(entries)
    .map(
      ([name, meaning]) =>
        `<tr><td><code>${escape(name)}</code></td><td>${escape(meaning)}</td></tr>`,
    )
    .join("");
  return `<div class="params"><h4>${escape(label)}</h4><table>${rows}</table></div>`;
}

function renderEndpoint(entry) {
  const id = `${entry.method}-${entry.path}`.replace(/[^\w]+/g, "-");

  // Only endpoints with a working example get a Try button. An example that
  // 404s teaches the reader the wrong thing about the API.
  const tryButton = entry.example
    ? `<button class="try" data-url="${escape(entry.example)}" aria-controls="out-${id}">Try it</button>`
    : "";

  return `
    <article class="endpoint" id="${id}">
      <header>
        <span class="method">${escape(entry.method)}</span>
        <code class="path">${escape(entry.path)}</code>
        ${tryButton}
      </header>
      ${entry.summary ? `<p class="summary">${escape(entry.summary)}</p>` : ""}
      ${renderParams("Path parameters", entry.params)}
      ${renderParams("Query parameters", entry.query)}
      ${entry.notes ? `<p class="notes">${escape(entry.notes)}</p>` : ""}
      <pre class="output" id="out-${id}" hidden></pre>
    </article>`;
}

export function createDocsRoutes(mounts) {
  const router = Router();

  router.get("/", (req, res) => {
    const catalog = buildCatalog(mounts, descriptions);

    const groups = catalog.reduce((acc, entry) => {
      (acc[entry.resource] ??= []).push(entry);
      return acc;
    }, {});

    // Meta and health first, then the resources — the order someone reads in.
    const order = ["meta", "health", "heroes", "archive", "pokemon", "trainers", "stats"];
    const sortedGroups = Object.keys(groups).sort(
      (a, b) => order.indexOf(a) - order.indexOf(b),
    );

    const nav = sortedGroups
      .map(
        (name) =>
          `<a href="#group-${escape(name)}">${escape(name)} <span>${groups[name].length}</span></a>`,
      )
      .join("");

    const sections = sortedGroups
      .map(
        (name) => `
        <section id="group-${escape(name)}">
          <h2>${escape(name)}</h2>
          ${groups[name].map(renderEndpoint).join("")}
        </section>`,
      )
      .join("");

    res.type("html").send(page({ nav, sections, count: catalog.length }));
  });

  return router;
}

const page = ({ nav, sections, count }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pokédex API — Reference</title>
<style>
  :root {
    --bg: #0d1117; --panel: #161b22; --line: #272e37;
    --text: #e6edf3; --muted: #9aa7b4;
    --get: #4ec9b0; --accent: #79c0ff; --warn: #f0b429;
    color-scheme: dark;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--text);
    font: 15px/1.6 ui-sans-serif, -apple-system, "Segoe UI", sans-serif;
  }
  code, pre { font-family: ui-monospace, "SF Mono", Menlo, monospace; }

  header.top { padding: 2.5rem 1.5rem 1.5rem; border-bottom: 1px solid var(--line); }
  header.top h1 { margin: 0; font-size: 1.6rem; letter-spacing: -0.01em; }
  header.top p { margin: .4rem 0 0; color: var(--muted); max-width: 62ch; }

  .layout { display: grid; grid-template-columns: 200px 1fr; gap: 2rem;
            max-width: 1100px; margin: 0 auto; padding: 1.5rem; }
  @media (max-width: 720px) { .layout { grid-template-columns: 1fr; } nav { position: static !important; } }

  nav { position: sticky; top: 1.5rem; align-self: start; display: flex; flex-direction: column; gap: 2px; }
  nav a { color: var(--muted); text-decoration: none; padding: .4rem .6rem; border-radius: 6px;
          display: flex; justify-content: space-between; text-transform: capitalize; }
  nav a:hover { background: var(--panel); color: var(--text); }
  nav a span { color: var(--muted); font-size: .8rem; }

  section { margin-bottom: 2.5rem; }
  section h2 { text-transform: capitalize; font-size: 1.1rem; color: var(--accent);
               border-bottom: 1px solid var(--line); padding-bottom: .4rem; }

  .endpoint { background: var(--panel); border: 1px solid var(--line);
              border-radius: 10px; padding: 1rem 1.1rem; margin-bottom: .9rem; }
  .endpoint header { display: flex; align-items: center; gap: .7rem; flex-wrap: wrap; }
  .method { color: var(--get); font-weight: 700; font-size: .78rem; letter-spacing: .06em; }
  .path { font-size: .95rem; }
  .summary { margin: .6rem 0 0; }
  .notes { margin: .6rem 0 0; color: var(--muted); font-size: .9rem;
           border-left: 2px solid var(--warn); padding-left: .8rem; }

  .params { margin-top: .8rem; }
  .params h4 { margin: 0 0 .3rem; font-size: .75rem; text-transform: uppercase;
               letter-spacing: .08em; color: var(--muted); }
  .params table { border-collapse: collapse; width: 100%; font-size: .9rem; }
  .params td { padding: .25rem .6rem .25rem 0; vertical-align: top; }
  .params td:first-child { width: 8rem; color: var(--accent); }

  button.try { margin-left: auto; background: transparent; color: var(--accent);
               border: 1px solid var(--line); border-radius: 6px; padding: .3rem .7rem;
               font: inherit; font-size: .82rem; cursor: pointer; }
  button.try:hover { border-color: var(--accent); }
  button.try[aria-busy="true"] { opacity: .6; cursor: progress; }

  pre.output { margin: .8rem 0 0; padding: .8rem; background: #0b0f14;
               border: 1px solid var(--line); border-radius: 8px;
               max-height: 22rem; overflow: auto; font-size: .82rem; }
  pre.output.error { border-color: #f85149; }
</style>
</head>
<body>
  <header class="top">
    <h1>Pokédex API</h1>
    <p>
      ${count} endpoints. This page is generated from the router at request
      time, so it cannot list a route that does not exist or omit one that does.
      Every example below runs against this server — press Try it.
    </p>
  </header>

  <div class="layout">
    <nav aria-label="Resources">${nav}</nav>
    <main>${sections}</main>
  </div>

<script>
  // Same origin, so no CORS involved and no base URL to configure — the page is
  // served by the API it documents.
  document.addEventListener("click", async (event) => {
    const button = event.target.closest("button.try");
    if (!button) return;

    const output = document.getElementById(button.getAttribute("aria-controls"));
    button.setAttribute("aria-busy", "true");
    output.hidden = false;
    output.classList.remove("error");
    output.textContent = "Loading…";

    try {
      const response = await fetch(button.dataset.url);
      const body = await response.json();
      output.textContent = response.status + " " + response.statusText + "\\n\\n"
        + JSON.stringify(body, null, 2);
      // A 4xx is a real answer worth showing, not a failure of the page.
      if (!response.ok) output.classList.add("error");
    } catch (error) {
      output.classList.add("error");
      output.textContent = "Request failed: " + error.message;
    } finally {
      button.removeAttribute("aria-busy");
    }
  });
</script>
</body>
</html>`;
