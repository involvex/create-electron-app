import type { ProjectOptions } from '../cli/prompts';

/**
 * Generate package.json based on template and user options
 */
export function generatePackageJson(options: ProjectOptions): Record<string, unknown> {
	const pkg: Record<string, unknown> = {
		name: options.projectName,
		version: '1.0.0',
		description: options.description,
		author: options.author,
		license: options.license,
		type: 'module',
		main: 'dist/main/index.js',
		scripts: {
			dev: 'electron-vite dev',
			build: 'electron-vite build',
			preview: 'electron-vite preview',
			format: 'biome format --write .',
			lint: 'biome check --write .',
			typecheck: 'tsc --noEmit',
			check: 'bun run format && bun run lint && bun run typecheck',
		},
	};

	// Base dev dependencies
	const devDeps: Record<string, string> = {
		'@biomejs/biome': '^2.4.13',
		'@types/node': '^25.6.0',
		electron: '^36.0.0',
		'electron-vite': '^3.0.0',
		typescript: '^6.0.0',
	};

	// Template-specific dependencies
	if (options.template === 'react') {
		Object.assign(devDeps, {
			react: '^19.0.0',
			'react-dom': '^19.0.0',
			'@types/react': '^19.0.0',
			'@types/react-dom': '^19.0.0',
		});
	} else if (options.template === 'react-tailwind') {
		Object.assign(devDeps, {
			react: '^19.0.0',
			'react-dom': '^19.0.0',
			'@types/react': '^19.0.0',
			'@types/react-dom': '^19.0.0',
			tailwindcss: '^4.0.0',
			postcss: '^8.4.0',
			autoprefixer: '^10.4.0',
		});
	} else if (options.template === 'vue') {
		Object.assign(devDeps, {
			vue: '^3.5.0',
			'@vitejs/plugin-vue': '^5.0.0',
			'vue-tsc': '^2.0.0',
		});
	}

	// Common runtime dependencies
	const deps: Record<string, string> = {
		'electron-store': '^9.0.0',
	};

	// Add styling framework dependencies if selected
	if (options.template === 'react-tailwind' && options.styling) {
		switch (options.styling) {
			case 'shadcn':
				// shadcn/ui components are added manually; nothing to install
				break;
			case 'kumo':
				Object.assign(deps, {
					'@cloudflare/kumo': '^0.2.0',
				});
				break;
			case 'aura':
				Object.assign(deps, {
					'aura-ui': 'latest',
				});
				break;
		}
	}

	pkg.devDependencies = devDeps;
	pkg.dependencies = deps;

	return pkg;
}

/**
 * Generate additional config files content as needed
 */
export function generateAllConfigs(options: ProjectOptions): Record<string, string> {
	const configs: Record<string, string> = {};

	// tsconfig.json
	configs['tsconfig.json'] = JSON.stringify(getTsConfig(options), null, 2);

	// electron.vite.config.ts
	configs['electron.vite.config.ts'] = getElectronViteConfig(options);

	// bunfig.toml
	configs['bunfig.toml'] = `[install]
save = "exact"

[run]
hmr = true
hot = true

[build]
target = "browser"
outdir = "dist"
`;

	// Add tailwind files if applicable
	if (options.template === 'react-tailwind' && options.styling === 'tailwind') {
		configs['tailwind.config.js'] = getTailwindConfig(options);
		configs['postcss.config.js'] = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
	}

	// Code quality configs
	if (options.codeQuality.eslint) {
		configs['eslint.config.js'] = getEslintConfig();
	}
	if (options.codeQuality.prettier) {
		configs['prettier.config.js'] = `module.exports = {
  semi: false,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "es5",
  printWidth: 100,
};
`;
	}

	return configs;
}

function getTsConfig(_options: ProjectOptions): object {
	return {
		compilerOptions: {
			target: 'ES2022',
			module: 'ESNext',
			moduleResolution: 'bundler',
			strict: true,
			esModuleInterop: true,
			skipLibCheck: true,
			forceConsistentCasingInFileNames: true,
			outDir: 'dist',
			rootDir: 'src',
			baseUrl: '.',
			paths: {
				'@/*': ['src/*'],
			},
			// Add JSX config for React
			jsx: ['react', 'react-jsx'].includes(_options.template) ? 'react-jsx' : undefined,
		},
		include: ['src/**/*'],
		exclude: ['node_modules', 'dist'],
	};
}

function getElectronViteConfig(_options: ProjectOptions): string {
	// For simplicity, return a single config that works for all templates
	return `import { defineConfig, externalizeDepsPlugin } from "electron-vite";

export default defineConfig({
  main: {
    build: {
      outDir: "dist/main",
      rollupOptions: {
        external: ["electron"],
        plugins: [externalizeDepsPlugin({ explicit: ["electron"] })],
      },
    },
  },
  preload: {
    build: {
      outDir: "dist/preload",
      rollupOptions: {
        external: ["electron"],
        plugins: [externalizeDepsPlugin({ explicit: ["electron"] })],
      },
    },
  },
  renderer: {
    build: {
      outDir: "dist/renderer",
    },
  },
});
`;
}

function getTailwindConfig(_options: ProjectOptions): string {
	return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/renderer/**/*.{js,ts,jsx,tsx,vue}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
        },
        background: "var(--color-bg)",
        surface: "var(--color-surface)",
        text: "var(--color-text)",
        "text-secondary": "var(--color-text-secondary)",
      },
    },
  },
  plugins: [
    require("@casoon/tailwindcss-glass"),
  ],
}
`;
}

function getEslintConfig(): string {
	return `import js from "@eslint/js";

export default [
  { ignores: ["dist", "node_modules"] },
  { extends: js.configs.recommended },
  { languageOptions: { ecmaVersion: 2022, sourceType: "module" } },
  { rules: { "no-unused-vars": ["warn"] } },
];
`;
}
