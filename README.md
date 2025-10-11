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
