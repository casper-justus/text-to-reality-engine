#!/usr/bin/env node
// One-shot: create the D1 database, apply schema, then deploy to Cloudflare Pages.
// Usage: npm install && npm run setup
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const DB_NAME = "edumarket";
const WRANGLER = path.join(__dirname, "..", "node_modules", ".bin", "wrangler");

function run(cmd, opts = {}) {
  console.log("\n$ " + cmd);
  execSync(cmd, { stdio: "inherit", ...opts });
}

(async () => {
  // 1. Create D1 database (idempotent-ish: capture id from output)
  let dbId = "";
  try {
    const out = execSync(`"${WRANGLER}" d1 create ${DB_NAME}`, { encoding: "utf8" });
    const m = out.match(/database_id\s*\(?([a-f0-9-]{36})\)?/i) || out.match(/([a-f0-9]{8}-[a-f0-9-]+)/i);
    if (m) dbId = m[1];
    console.log("D1 created with id:", dbId);
  } catch (e) {
    console.log("d1 create failed or already exists — continuing.");
  }

  // 2. Write id into wrangler.toml if we got one
  const tomlPath = path.join(__dirname, "..", "wrangler.toml");
  let toml = fs.readFileSync(tomlPath, "utf8");
  if (dbId && toml.includes("REPLACE_WITH_YOUR_D1_ID")) {
    toml = toml.replace("REPLACE_WITH_YOUR_D1_ID", dbId);
    fs.writeFileSync(tomlPath, toml);
    console.log("Wrote database_id into wrangler.toml");
  }

  // 3. Apply schema (local + remote). Remote needs the id.
  if (!toml.includes("REPLACE_WITH_YOUR_D1_ID")) {
    try { run(`"${WRANGLER}" d1 execute ${DB_NAME} --local --file=./migrations/schema.sql`); } catch {}
    try { run(`"${WRANGLER}" d1 execute ${DB_NAME} --remote --file=./migrations/schema.sql`); } catch {}
  } else {
    console.log("Skipping remote migration — set database_id in wrangler.toml first.");
  }

  // 4. Ensure Pages project exists, then deploy
  try {
    run(`"${WRANGLER}" pages project create ${DB_NAME} --production-branch=main`);
  } catch {
    console.log("Pages project already exists (or creation skipped) — continuing to deploy.");
  }
  run(`"${WRANGLER}" pages deploy public --project-name=${DB_NAME}`);
  console.log("\nDone. Visit your Pages URL. Login works with D1 once database_id is configured.");
})();
