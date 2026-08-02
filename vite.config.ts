// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// On Vercel we must hard-pin the nitro preset so the build emits the Vercel
// Build Output API bundle (.vercel/output) with the server/SSR functions.
// Without it the deploy can end up serving only static files, so every
// server function call (/_serverFn/*) returns 404.
const isVercel = Boolean(process.env["VERCEL"]);

export default defineConfig({
  ...(isVercel ? { nitro: { preset: "vercel" } as const } : {}),
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
