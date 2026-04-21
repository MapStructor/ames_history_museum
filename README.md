# Ames History Museum — Map

A config-driven web map built for the Ames History Museum. Also the proving ground for [Mapstructor](https://github.com/MapStructor), a universal web mapping platform.

---

## Running locally

Copy `js/mapbox-token.js` from a safe location and set your Mapbox token there (gitignored — never commit it).

The token in the repo is domain-locked to the production URL. The map won't render locally without swapping it.

---

## Branches and deploy

| Branch | Deploys to | URL |
|--------|-----------|-----|
| `main` | gh-pages root | production site |
| `dev` | gh-pages `/dev/` subfolder | preview |

Both branches deploy automatically via GitHub Actions on push (see [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)).

**`main` is branch-protected** — changes go through a pull request from `dev`. Merge the PR → deploy fires automatically.

---

## Repo structure

```
js/engine/     ← map engine (addLayers, eventsHandle, infoPanel, etc.)
js/lists/      ← config files (layersList, bounds, header, etc.)
css/           ← styles
legacy/        ← reference builds (read-only): first_students, second_students, victor
docs/          ← dev plan and Claude briefing (gitignored, local only)
```

---

## Mapstructor dev plan

Full architecture and implementation plan lives in `docs/mapstructor_dev_plan.md` (gitignored — local only, never pushed).
