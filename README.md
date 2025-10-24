# @maurocicerchia/cursor-rules

CLI to install **Cursor Rules** by categories (frontend, backend, react, typescript) or all together.
Built and published with **Bun**.

## Usage
```bash
# install all
npx @maurocicerchia/cursor-rules --all

# install specific categories
npx @maurocicerchia/cursor-rules --react --typescript

# utilities
npx @maurocicerchia/cursor-rules --list       # shows available categories
npx @maurocicerchia/cursor-rules --dry-run    # simulates copy
npx @maurocicerchia/cursor-rules --force      # overwrites existing files
```

## Development
```bash
bun install
bun run build
bun run dev -- --help
```

## Publishing
```bash
bun run build
npm publish
```

## Rules Catalog

Rules are organized by category under `rules/<category>/*.mdc`. Use the CLI flags to copy selected categories into your project's `.cursor/rules` directory.

- TypeScript
  - `rules/typescript/ts-strictness.mdc`: Strict compiler options, narrowing, exhaustiveness, generics.
  - `rules/typescript/ts-style.mdc`: Conventions for modules, types vs interfaces, naming, React TSX.

- React
  - `rules/react/react-patterns.mdc`: Components, hooks, data fetching, state, performance, SSR, testing.
  - `rules/react/rtk-query.mdc`: Data fetching and caching patterns with RTK Query. See RTK Query docs: `http://redux-toolkit.js.org/rtk-query/overview`.
  - `rules/react/a11y.mdc`: Accessibility essentials for semantics, keyboard, ARIA, dialogs, forms.
  - `rules/react/shadcn-ui.mdc`: shadcn/ui philosophy, theming, composition, a11y, and examples. See shadcn/ui docs: `https://ui.shadcn.com/docs`.

- Frontend
  - `rules/frontend/style-guides.mdc`
  - `rules/frontend/perf-best-practices.mdc`

- General
  - `rules/general/functional-programming.mdc`
  - `rules/general/solid.mdc`

### Install examples
```bash
# install React + TypeScript rules
npx @maurocicerchia/cursor-rules --react --typescript

# list available categories
npx @maurocicerchia/cursor-rules --list
```
