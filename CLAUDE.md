# Notes for Claude (and humans)

Living notes about non-obvious things in this repo. Keep this short and only add things that are noteworthy enough to matter for future work.

## Project

Expo SDK 54 React Native app using TypeScript, Expo Router (file-based routing), and bun as the primary package manager. Also works with npm/yarn.

## Running

```sh
bun run start          # dev server
bun run start --tunnel # for Expo Go on different networks
bun run web            # web only
```

For Expo Go on a physical device, SDK 54 is required (SDK 55 not yet supported by current Expo Go versions).

## Conventions

- Branch: `feature/<issue#>_PascalCase` or `fix/<issue#>_PascalCase`. Always a GitHub issue first.
- Commit subject: short imperative, no AI attribution.
- Squash merge.
- PR labels: `bug`, `enhancement`, `refactor`, `stale`.
