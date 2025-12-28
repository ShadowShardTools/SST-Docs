# SST Docs - React JSON Documentation Template

A React + Vite template for building fast, searchable, versioned documentation sites from structured JSON. It ships with product/version selectors, keyboard-friendly navigation, a rich block library, light/dark themes, and optional static HTML export for offline or JS-free delivery.

![SST Docs Light Theme](https://github.com/user-attachments/assets/aa06a602-4333-46d1-be1f-a15eddcaeb7e)
![SST Docs Dark Theme](https://github.com/user-attachments/assets/f002795b-dab4-4b6c-9b26-5e468b5394e0)

## Features
- JSON-driven multi-product, multi-version docs with per-version assets.
- Keyboard-centric UX: focus filter with `F`, navigate the tree with `Ctrl + Up/Down/Left/Right`, open selection with `Ctrl + Enter`, and launch search with `/` or `Ctrl + K` (results navigable with arrow keys/Enter/Escape).
- Search modal with highlighted snippets, lazy-loaded rich blocks, and deep links for every doc/category.
- Rich block set: titles, text, lists, message boxes, dividers, tables, code blocks (Prism), math (KaTeX), charts (Chart.js), images, grids, carousels, comparisons, audio, and YouTube embeds.
- Light/Dark theme toggle, responsive layout, and a download-static button wired to the static export manifest.
- Static HTML exporter (charts pre-rendered) plus auto-generated block imports and Prism language bundles to keep the runtime lean.
- GitHub Pages-ready (`base` set to `/SST-Docs/`) with Tailwind CSS v4 and React 19.

## Quick Start
1) Requirements: Node 20+, npm 10+.  
2) Install deps: `npm install`  
3) Run dev server: `npm run dev` (runs generators, then Vite).  
4) Production build: `npm run build` and preview with `npm run start`.  
5) Deploy to GitHub Pages: `npm run deploy` (build + `gh-pages -d dist`).

## Project Scripts
- `npm run generate` - runs all generators below.
  - `generate:blocks` builds lazy block import map from the JSON content.
  - `generate:index` regenerates `index.json` files listing categories/items per version.
  - `generate:prism` bundles only the Prism languages detected in your code blocks.
- `npm run generate:static-html` - renders static HTML (plus charts/media) using the settings in `sst-docs.config.json`.
- `npm run dev` / `npm run build` / `npm run start` / `npm run deploy` - standard Vite workflow with the generators run upfront.
- `npm run format` - Prettier over `src/**/*.{ts,tsx,md}`.

Re-run `npm run generate` after adding new content types, code languages, or docs so imports and indexes stay in sync.

## Content Model
All documentation data lives under `public/SST-Docs/data` (changeable via `sst-docs.config.json`):

```
public/SST-Docs/data/
  products.json                # List of products shown in the selector
  <product>/
    versions.json              # Available versions and labels
    index.json                 # Generated (non-versioned placeholder; kept for consistency)
    <version>/
      index.json               # Generated list of categories/items for this version
      categories/*.json        # Category metadata (id, title, children, docs)
      items/*.json             # Doc content with ordered block arrays
      images/ | audio/ | charts/  # Assets referenced by blocks
      static/                  # Static export output + static-manifest.json
    static-styles/             # Shared styles/assets for static export
sst-docs.config.json           # FS path, product versioning flag, branding, static export settings
```

Adding content:
1) Update `products.json` (add `{ "product": "myProduct", "label": "My Product" }`).
2) Create `myProduct/versions.json` to list versions and `myProduct/<version>/` with `categories` and `items` JSON.
3) Populate `items/*.json` with `content` arrays. Each block must include a `type` matching a block component (e.g., `title`, `text`, `code`, `chart`, `imageGrid`, `imageCompare`, `youtube`, `audio`, etc.).
4) Run `npm run generate` so block imports, Prism languages, and indexes reflect your data.

## Static HTML Export
- Configure `HTML_GENERATOR_SETTINGS` in `sst-docs.config.json` (output directory, theme, separate build flag).
- Run `npm run generate:static-html` to produce per-product/per-version static pages and assets manifests (see `static/static-manifest.json`).
- The "Download" button in the header reads that manifest so users can grab the offline bundle for the selected product/version.

## Configuration Notes
- `sst-docs.config.json` controls the data root (`FS_DATA_PATH`), whether product versioning is enabled, header branding, and static export options.
- Vite `base` is set to `/SST-Docs/` for GitHub Pages. Change it in `vite.config.ts` if deploying elsewhere.
- Engine constraints: Node >= 20, npm >= 10 (see `package.json`).

## License
MIT

## Links
- https://shadowshardtools.github.io
- https://github.com/ShadowShardTools
- https://assetstore.unity.com/publishers/46006
- https://www.youtube.com/@shadowshardtools
- https://www.linkedin.com/company/shadowshardtools
- https://discord.gg/QyQACA5YvA
