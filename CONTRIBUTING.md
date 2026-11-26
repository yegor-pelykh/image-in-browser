<!-- @format -->

# Contributing to image-in-browser

Thanks for your interest in improving **image-in-browser**! Bug reports, fixes,
new tests, documentation and well-scoped features are all welcome.

By participating in this project, you agree to follow our
[Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to contribute

- **Report a bug.** Open an [issue](https://github.com/yegor-pelykh/image-in-browser/issues)
  with a minimal reproduction and the expected vs. actual result.
- **Suggest a feature.** Open an issue first so the design and scope can be
  discussed before you invest time in an implementation.
- **Improve documentation.** The [wiki](https://github.com/yegor-pelykh/image-in-browser/wiki)
  is maintained in a separate repository, and usage examples live in
  [image-in-browser.examples](https://github.com/yegor-pelykh/image-in-browser.examples).
- **Submit code.** Fix a bug, add a test, optimize a hot path or implement an
  agreed feature.
- **Add test fixtures.** A valid image placed in `test/_input/<format>/` becomes
  a round-trip test case automatically.

Questions and support requests are covered in
[SUPPORT.md](.github/SUPPORT.md).

## Before you start

1. Search existing issues and pull requests to avoid duplicate work.
2. Open an issue before starting a large change, a new image format, a new
   public API or a broad refactor. Small fixes and documentation changes can go
   straight to a pull request.
3. Do not report security vulnerabilities in a public issue. See
   [Security](#security) below.
4. Keep pull requests focused: one logical change per PR is much easier to
   review and merge.

## Development setup

### Requirements

- Node.js
- Git

### Getting the code

```bash
git clone https://github.com/<your-username>/image-in-browser.git
cd image-in-browser
git remote add upstream https://github.com/yegor-pelykh/image-in-browser.git
npm ci
```

Use `npm ci` for a reproducible install from `package-lock.json`. Use
`npm install` only when you intentionally change dependencies.

The package has **zero runtime dependencies**. Everything in `devDependencies`
is used for building, testing and releasing only.

### Useful commands

| Command                                          | What it does                                                                            |
| :----------------------------------------------- | :-------------------------------------------------------------------------------------- |
| `npm run build`                                  | Pre-build fixes, formatting, linting, then cleans and compiles to `lib/`                |
| `npm run clean:lib`                              | Removes the generated `lib/` directory                                                  |
| `npm run test:all`                               | Runs the complete test suite                                                            |
| `npm run test:format`                            | Runs the format suite; `test:color`, `test:draw`, `test:exif`, and so on run the others |
| `npx vitest run test/format/format.webp.test.ts` | Runs a single test file                                                                 |
| `npx tsc -p tsconfig.build.json --noEmit`        | Type-checks `src/` without writing files                                                |
| `npm run typecheck`                              | Type-checks `src/`, `test/` and configs without writing files                           |
| `npm run verify`                                 | Runs the formatting check, lint and full typecheck without rewriting files              |
| `npm run format:prettier`                        | Checks Prettier formatting for `src/` and `test/` without rewriting files               |
| `npm run format:lint`                            | Runs ESLint without `--fix`                                                             |
| `npm run format`                                 | Rewrites formatting and applies ESLint fixes                                            |
| `npm run release:check`                          | Maintainer only: full verification, source check and `lib/` build before publishing     |
| `npm run release`                                | Maintainer only: runs `release:check`, bumps the version, tags and publishes            |

There is no `npm test`; use `npm run test:all`.

`npm run release` executes `release:check` through release-it's `before:init`
hook, before the version bump. A manual `npm publish` runs the same check
through `prepublishOnly`; release-it itself publishes with `--ignore-scripts`
so the check does not run twice.

> **Note:** `npm run build` and `npm run format` rewrite files. For a
> non-mutating check, use `npm run verify` (or the `tsc --noEmit` commands
> above).

CI runs the non-mutating formatting, lint, type and test checks, followed by a
source build, on every pull request. Before opening one, run `npm run verify`
and `npm run test:all` locally.

## Project layout

| Path                                                       | Contents                                                                          |
| :--------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| `src/index.ts`                                             | The only public barrel file. Export new public APIs here.                         |
| `src/formats/`                                             | Hand-written decoders and encoders for each image format.                         |
| `src/image/`                                               | `MemoryImage`, pixels, palettes and frames.                                       |
| `src/color/`, `src/filter/`, `src/draw/`, `src/transform/` | Image processing building blocks.                                                 |
| `src/packer/`                                              | Internal deflate/inflate and binary read/write helpers.                           |
| `test/format/`                                             | Round-trip and malformed-input tests for all codecs.                              |
| `test/_input/<section>/`                                   | Source fixtures. `jpeg` maps to `test/_input/jpg`; APNG has `apng`.               |
| `test/_output/<section>/`                                  | Re-encoded files written by tests for inspection (gitignored).                    |
| `test/_utils/`                                             | Shared test helpers and fixture/section mapping.                                  |
| `docs/`                                                    | GitHub Pages source root (`main` → `/docs`); the static donation page lives here. |
| `lib/`                                                     | Generated build output (gitignored).                                              |

`MemoryImage` (`src/image/image.ts`) is the central type: decoders return it,
encoders consume it, and drawing, filters and transforms operate on it.
Animations are stored in `MemoryImage.frames`; for a still image, `frames[0]` is
the image itself.

## Documentation and GitHub Pages

`docs/` is published as-is by GitHub Pages from the `main` branch and the
`/docs` folder (repository **Settings → Pages → Deploy from a branch**). There
is no build step: everything committed here becomes public at
`https://yegor-pelykh.github.io/image-in-browser/`, so do not put drafts,
secrets or generated build output in this directory.

- `docs/donate/index.html` — the static donation page. It must stay
  self-contained: no analytics and no external requests.
- `docs/donate/README.md` — publishing and maintenance instructions.
- `docs/donate/qr/*.svg` — QR codes generated by `npm run donate:qr`.

Wallet addresses live in the `COINS` block of `docs/donate/index.html`, which is
the single source of truth. After changing them, run `npm run donate:qr`; the
script regenerates the SVGs and updates `DONATE.md` and `README.md`. Preview the
page with `npx --yes serve docs/donate`, scan a few QR codes, and make sure the
"Template mode" banner is gone before opening a pull request.

The library's API documentation is the
[wiki](https://github.com/yegor-pelykh/image-in-browser/wiki), not `docs/`.

## Coding guidelines

- **Language:** TypeScript in strict mode with `noUnusedParameters`, compiled to
  ESM (`"type": "module"`). The package targets both browsers and Node.js.
- **Formatting:** Prettier with 2 spaces, LF line endings, single quotes and
  semicolons. Run `npm run format` before committing; use `npm run verify` to
  check without rewriting files.
- **Linting:** ESLint with `strictTypeChecked`. Fix warnings rather than
  disabling rules.
- **Imports:** In `src/`, relative imports end in `.js` (ESM; `pre-build.js`
  enforces this). In `test/`, imports are extensionless.
- **Environment safety:** `src/` must not use Node built-ins (`fs`, `path`,
  `Buffer`) or DOM APIs. Work with `Uint8Array`. Only `test/` may use `fs` and
  `path`.
- **No runtime dependencies:** codecs and helpers are hand-written TypeScript.
  Do not add a runtime dependency or a native/WASM module without prior
  discussion.
- **Public API:** add or update exports in `src/index.ts`. New public classes
  and types should be exported deliberately, with matching type declarations.
- **Decoders:** validate input, enforce the max-pixels budget
  (`src/formats/max-pixels.ts`), use `guardDecode` and throw `LibError` for
  malformed data. See existing codecs before writing a new one.
- **Style:** follow the surrounding structure and naming. Avoid mixing
  unrelated refactors or reformatting into a bug-fix PR.

## Tests

- Add a regression test for every bug fix and coverage for every new behavior.
- Put fixtures in `test/_input/<section>/`. Format tests enumerate files
  dynamically, so a valid fixture becomes a new case automatically.
- Tests may write re-encoded files to `test/_output/<section>/`; treat them as
  debugging artifacts, not committed output.
- Assertions use pixel/byte equality or CRC32 hashes rather than snapshots.
- Run the full suite before opening a pull request:

```bash
npm run test:all
```

The Vitest timeout is 60 seconds per test, and tests run in Node.js.

## Commit messages

The project follows [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>: <Summary>
```

Common types are `feat`, `fix`, `perf`, `refactor`, `test`, `docs`, `style` and
`chore`. Write the summary in the imperative mood and capitalize it, for example:

```text
fix: Correct HSV hue wrap in color conversion
docs: Document frame decoding in decodeImage
```

Reference an issue from the commit body or the pull request description, e.g.
`Fixes #123`.

## Pull requests

1. Branch from `main` and keep the branch reasonably up to date.
2. Make sure `npm run test:all` passes and `npm run build` succeeds.
3. Describe **what** changed and **why**, how it was tested, and link related
   issues.
4. Include a before/after image or a small code sample for visual or API
   changes.
5. Update the README, wiki or examples when public behavior changes.
6. Do not edit `CHANGELOG.md`, bump the version or commit generated `lib/`,
   `node_modules/` or `test/_output/` files. Releases are produced by
   `release-it`.
7. Be responsive to review comments. The maintainer may squash commits or adjust
   the final wording when merging.

The project is maintained in spare time, so reviews can take a few days. A
polite ping after a week is fine.

## Security

Please do not open a public issue for security problems. Report them privately
to **yegor.dev@gmail.com** with a description, reproduction steps and affected
versions. You will get a response as soon as possible, and the issue will be
disclosed responsibly after a fix is available.

## License

By contributing, you agree that your contributions are licensed under the
[MIT License](LICENSE.md). No contributor license agreement (CLA) is required.
