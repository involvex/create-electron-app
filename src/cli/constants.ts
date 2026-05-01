// Template types supported by the CLI
export const TEMPLATES = {
	VANILLA: 'vanilla',
	REACT: 'react',
	REACT_TAILWIND: 'react-tailwind',
	VUE: 'vue',
} as const;

export type TemplateType = (typeof TEMPLATES)[keyof typeof TEMPLATES];

// Styling frameworks available
export const STYLING_OPTIONS = [
	{
		label: 'Tailwind CSS 4',
		value: 'tailwind',
		description: 'Industry standard utility-first CSS',
	},
	{ label: 'Aura UI', value: 'aura', description: 'Vibrant Depth design with glass morphism' },
	{ label: 'Cloudflare Kumo', value: 'kumo', description: 'Base UI + Tailwind v4 (87K downloads)' },
	{ label: 'shadcn/ui', value: 'shadcn', description: '50+ customizable components (React only)' },
	{ label: 'Custom CSS', value: 'custom', description: 'Write your own styles' },
] as const;

export type StylingOption = (typeof STYLING_OPTIONS)[number]['value'];

// Lightweight CSS alternatives
export const LIGHTWEIGHT_CSS = [
	'µCSS (~19KB)',
	'Symphony CSS (~35KB)',
	'Graffiti (~26KB)',
	'Lissom.CSS (classless)',
	'Frankenstyle (no-build)',
	'Cutestrap (2.7KB)',
	'SamphireCSS (12KB)',
] as const;

// Navigation types
export const NAVIGATION_OPTIONS = [
	{
		label: 'Native Electron MenuBar',
		value: 'native',
		description: 'Standard desktop application menus',
	},
	{ label: 'Sticky Navbar', value: 'sticky', description: 'Top navigation bar with blur effect' },
	{ label: 'Fixed Navbar', value: 'fixed', description: 'Fixed overlay navigation' },
	{ label: 'Custom HTML', value: 'custom', description: 'Fully custom navigation component' },
] as const;

export type NavigationType = (typeof NAVIGATION_OPTIONS)[number]['value'];

// Glass morphism intensity levels
export const GLASS_LEVELS = {
	SOFT: 'soft',
	STANDARD: 'standard',
	STRONG: 'strong',
	DARK: 'dark',
	GRADIENT: 'gradient',
} as const;

export type GlassLevel = (typeof GLASS_LEVELS)[keyof typeof GLASS_LEVELS];

// Theme presets
export const THEME_PRESETS = [
	{ label: 'Default (Light)', value: 'default', description: 'Clean, light design' },
	{ label: 'Dark Night', value: 'dark-night', description: 'Deep slate tones' },
	{ label: 'Glass', value: 'glass', description: 'Frosted translucent effect' },
	{ label: 'Gradient', value: 'gradient', description: 'Colorful gradients' },
] as const;

export type ThemePreset = (typeof THEME_PRESETS)[number]['value'];

// Backend options
export const BACKEND_OPTIONS = [
	{ label: 'Vite Backend', value: 'vite-backend', description: 'Node.js server with Vite' },
	{ label: 'Bun.serve()', value: 'bun-serve', description: 'Native Bun HTTP server' },
	{ label: 'Express', value: 'express', description: 'Express.js framework' },
	{ label: 'None (Frontend only)', value: 'none', description: 'No backend server needed' },
] as const;

export type BackendOption = (typeof BACKEND_OPTIONS)[number]['value'];

// Code quality options
export const CODE_QUALITY_OPTIONS = [
	{ label: 'ESLint', value: 'eslint', description: 'Linting for code quality' },
	{ label: 'Prettier', value: 'prettier', description: 'Code formatting' },
	{ label: 'Git initialization', value: 'git', description: 'Initialize git repository' },
	{ label: 'Husky hooks', value: 'husky', description: 'Pre-commit hooks' },
] as const;

// Package manager preference (future use)
export const PACKAGE_MANAGERS = ['bun', 'npm', 'pnpm', 'yarn'] as const;
