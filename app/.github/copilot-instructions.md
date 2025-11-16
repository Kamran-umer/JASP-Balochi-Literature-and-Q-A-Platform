## Repo Overview

- Type: Next.js (App Router) + TypeScript project created with create-next-app.
- Entry points: `src/app/layout.tsx` (root layout) and `src/app/page.tsx` (home page).
- Styling: Tailwind via `src/app/globals.css` (imports `tailwindcss`).
- Fonts: `next/font` is used to load Geist fonts in `layout.tsx`.
- API / integrations: `@supabase/supabase-js` is listed in `package.json`; look for env vars when adding integration code.

## Big-picture architecture & patterns

- App Router (app/): prefer adding routes under `src/app/` as directories with `page.tsx` or `layout.tsx` rather than the old pages/ router.
- Root layout: `src/app/layout.tsx` sets global fonts and the HTML/body wrapper — changes here affect app-wide styling and metadata.
- Styling: global CSS + Tailwind utility classes inline in components. Use `globals.css` for theme variables and global rules.
- Images: `next/image` is used (see `src/app/page.tsx`) — supply width/height and prefer `priority` for critical assets.

## Developer workflows (commands you can call)

- Dev server: `npm run dev` (also works with yarn/pnpm/bun as noted in README).
- Build: `npm run build` then `npm run start` for production preview.
- Lint: `npm run lint` (runs `eslint`; project includes `eslint-config-next`).

When generating or editing code, follow these quick checks locally:
- Run `npm run dev` to validate route registrations and fast refresh.
- Run `npm run build` if you change Next-specific configuration (e.g., `next.config.ts`) to ensure build-time errors are caught.

## Project-specific conventions & notes for AI edits

- TypeScript: `tsconfig.json` is strict (`strict: true`) and `noEmit: true` — keep types exact and add types where needed.
- Path alias: `@/*` maps to `./src/*` in `tsconfig.json` — import internal modules using `@/...`.
- Module resolution: bundler-style resolution; prefer ESM imports and React JSX (`jsx: react-jsx`).
- CSS/theme: `globals.css` defines CSS variables for color and uses `@import "tailwindcss"`. Prefer adding Tailwind utilities in JSX; add global tokens only in `globals.css`.
- Dark mode: CSS includes `prefers-color-scheme` adjustments and components use `dark:` Tailwind variants.

## Integration & external dependencies

- Supabase: `@supabase/supabase-js` is installed but there is no visible initialization file. Before adding code that uses Supabase, search the repo for existing `createClient` usage or for environment variables like `SUPABASE_URL` / `SUPABASE_ANON_KEY`.
- Fonts: `next/font` usage in `layout.tsx` — prefer this over CDN fonts for consistency.

## Concrete examples to copy/paste

- Add a new route: create `src/app/my-route/page.tsx` with a React component default export; update `src/app/layout.tsx` only if you need a nested layout.
- Use alias imports: `import Something from '@/lib/something'` (maps to `src/lib/something`).
- Use images via Next Image:

- Keep types strict: export props interfaces for components and use `React.FC` or typed function components.

## Where to look when unsure

- `package.json` — scripts and dependencies.
- `tsconfig.json` — path aliases and TS rules.
- `src/app/layout.tsx` — global layout, fonts, and metadata.
- `src/app/globals.css` — Tailwind setup and global variables.
- `next.config.ts` — project-level Next settings (currently minimal).

## Do NOT assume (and what to check)

- There is no explicit API folder or server functions visible; do not create serverless endpoints without checking for an existing pattern.
- Environment variables for Supabase or other services are not visible — search repo and `.env*` files before coding secrets.

## When adding tests or build changes

- This repo uses standard Next.js toolchain. If you add custom scripts or tools, update `package.json` and mention the commands in the README.

---
If anything here is unclear or you'd like the instructions to be stricter (for example, enforcing a component style or adding example code templates), tell me which areas to expand and I will iterate.
