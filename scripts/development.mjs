// Runs `next build` / `next start` with .env.development, i.e. a production
// build that talks to the LOCAL API.
//
// NEXT_PUBLIC_* values are baked into the bundle at build time, so this needs
// its own build. Values from .env.development are put into process.env first
// (Next never overrides vars that are already set, so they win over
// .env.production), and the build goes to .next-development so the real
// production build in .next is untouched.
//
// Usage: node scripts/development.mjs build|start
import { spawn } from "node:child_process";

const command = process.argv[2];
if (command !== "build" && command !== "start") {
  console.error("Usage: node scripts/development.mjs build|start");
  process.exit(1);
}

process.loadEnvFile(".env.development");
process.env.NEXT_DIST_DIR = ".next-development";

const args = command === "build" ? ["build", "--turbopack"] : ["start"];
console.log(`[development] next ${args.join(" ")} -> API ${process.env.NEXT_PUBLIC_API_BASE_URL}`);

const child = spawn("next", args, { stdio: "inherit", shell: true, env: process.env });
child.on("exit", (code) => process.exit(code ?? 1));
