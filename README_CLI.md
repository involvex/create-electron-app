# create-electron-app

Interactive CLI for scaffolding Electron applications with Bun runtime, TypeScript, and modern tooling.

## Features

- 🚀 **Bun Runtime**: 10-100x faster than npm, built-in bundler
- ⚡ **Hot Reloading**: Instant HMR with electron-vite
- 🎨 **Multiple Templates**: Vanilla, React, Vue
- 🎨 **Styling Options**: Tailwind CSS, Aura UI, Kumo, shadcn/ui, custom CSS
- 🪄 **Glass Morphism**: Built-in frosted glass effects
- 🎭 **Navigation**: Native Electron MenuBar or custom navbar
- 📱 **Tray Menu**: System notification area support
- 🌗 **Themes**: Dark/light mode with multiple presets
- ✨ **Code Quality**: ESLint, Prettier, TypeScript

## Installation

### Global Usage

```bash
bunx @involvex/create-electron-app
```

### Local Development

```bash
# Clone the repository
cd create-electron-app

# Install dependencies
bun install

# Run CLI
bun run src/index.ts
```

## Usage

```bash
bunx @involvex/create-electron-app
```

The CLI will guide you through:

1. **Project Name**: Enter your project name
2. **Template Selection**: Choose vanilla, React, Vue, or React+Tailwind
3. **Styling Framework**: Tailwind, Kumo, shadcn/ui, Aura UI, or custom CSS
4. **UI Features**: Glass morphism, navbar type, tray menu, theme
5. **Code Quality**: ESLint, Prettier, Git initialization
6. **Backend**: Vite backend, Bun.serve, Express, or none

## Templates

### Vanilla + Vite

Minimal TypeScript setup with Bun - perfect for lightweight apps.

### React + Vite

Modern React 19 with fast HMR and Bun dev server.

### React + Vite + Tailwind + Component Library

Full-featured with:

- Tailwind CSS 4
- Optional: Kumo (Cloudflare) or shadcn/ui components
- Glass morphism utilities
- Dark/light theme toggle
- 50+ pre-built components available

### Vue + Vite

Vue 3 Composition API with TypeScript support.

## Styling Options

### Primary Frameworks

- **Tailwind CSS 4**: Industry standard with `@theme` tokens
- **Aura UI**: Vibrant Depth design with glass morphism
- **Kumo**: Cloudflare's design system (87K weekly downloads)
- **shadcn/ui**: 50+ customizable components
- **@casoon/tailwindcss-glass**: Dedicated glass morphism

### Lightweight Alternatives (<35KB)

- **µCSS**: ~19KB, CSS-only, semantic HTML
- **Symphony CSS**: ~35KB, semantic-first
- **Graffiti**: ~26KB minimal toolkit
- **Lissom.CSS**: Classless, minimalist
- **Frankenstyle**: No-build utility-first
- **Cutestrap**: 2.7KB progressive enhancement

## UI Features

### Glass Morphism

Three intensity levels:

- **Soft**: 8px blur, subtle transparency
- **Standard**: 16px blur, moderate
- **Strong**: 24px blur, dense

Plus dark glass and gradient variants.

### Navigation

- **Native MenuBar**: Electron's built-in menu
- **Sticky Navbar**: `position: sticky` with blur
- **Fixed Navbar**: `position: fixed` overlay
- **Custom HTML**: Fully customizable

### Tray Menu

System notification area with:

- Show/hide window
- Recent files
- Quick settings
- Exit application

### Themes

- **Default**: Clean, light design
- **Dark Night**: Deep slate tones
- **Glass**: Frosted translucent
- **Gradient**: Colorful gradients

## Project Structure

```
my-electron-app/
├── src/
│   ├── main/              # Main process
│   │   ├── index.ts       # Electron entry point
│   │   └── menu.ts        # Application menu
│   ├── renderer/          # Renderer process
│   │   ├── App.tsx        # Main component
│   │   ├── index.css      # Global styles
│   │   └── main.tsx       # Renderer entry
│   ├── preload/           # Preload scripts
│   │   └── index.ts
│   └── shared/            # Shared code
│       └── types.ts
├── vite.main.config.ts    # Vite config (main)
├── vite.renderer.config.ts# Vite config (renderer)
├── electron.vite.config.ts# Combined config
├── tailwind.config.js     # Tailwind config (if selected)
├── eslint.config.js       # ESLint config (if selected)
├── prettier.config.js     # Prettier config (if selected)
├── tsconfig.json          # TypeScript config
├── bunfig.toml           # Bun configuration
└── package.json
```

## Development

### Hot Reloading

**electron-vite** (recommended):

- Instant HMR for renderer process
- Hot reloading for main process
- Automatic process management

**Bun Native**:

```bash
bun --watch src/main/index.ts
```

### Build Scripts

```json
{
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "preview": "electron-vite preview"
  }
}
```

## Technical Stack

- **Runtime**: Bun 1.3+
- **Bundler**: Vite + electron-vite
- **Language**: TypeScript 5.x
- **Framework**: React 19 / Vue 3 / Vanilla
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui / Kumo / Aura UI
- **Linting**: ESLint / Biome
- **Formatting**: Prettier

## Bun Benefits

- ⚡ **10-100x faster** than npm/yarn/pnpm
- 🎯 **Built-in bundler** with native TypeScript support
- 🔥 **Watch mode**: `--watch` and `--hot` flags
- 📦 **Zero-config**: Works out of the box
- 🚀 **Standalone**: Compile to single executable

## Contributing

See [PLANNING.md](.kilo/plans/) for detailed technical planning and architecture decisions.

## License

MIT
