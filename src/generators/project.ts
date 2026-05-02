import fs from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ProjectOptions } from '../cli/prompts';
import { generatePackageJson } from './configs';
import { initializeGit } from './git';
import { generateMenu } from './menu';
import { generateThemes } from './themes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Main project generation orchestrator
 */
export async function generateProject(options: ProjectOptions): Promise<void> {
	const projectRoot = resolve(process.cwd(), options.projectName);

	console.log(`\nCreating project in ${projectRoot}...`);

	// Create directory structure
	await createDirectories(projectRoot, options);

	// Copy template files with variable substitution
	await copyTemplateFiles(projectRoot, options);

	// Generate config files (package.json, tsconfig, vite configs)
	await generateConfigFiles(projectRoot, options);

	// Generate menu/tray code if native
	if (options.navigation === 'native' || options.uiFeatures.trayMenu) {
		await generateMenu(projectRoot, options);
	}

	// Generate backend server if requested
	if (options.backend === 'bun-serve') {
		await generateBackendServer(projectRoot, options);
	}

	// Generate theme CSS if theme features enabled
	if (options.uiFeatures.themeToggle || options.uiFeatures.glassMorphism) {
		await generateThemes(projectRoot, options);
	}

	// Generate glass morphism CSS if selected
	if (options.uiFeatures.glassMorphism) {
		await generateGlassMorphism(projectRoot, options);
	}

	// Generate .gitignore
	await writeFile(join(projectRoot, '.gitignore'), getGitignoreContent());

	// Initialize git if requested
	if (options.gitInit) {
		await initializeGit(projectRoot);
	}

	// Create bunfig.toml
	await writeFile(join(projectRoot, 'bunfig.toml'), getBunfigContent());

	console.log(`\n✅ Project "${options.projectName}" created successfully!`);
	console.log(`\nNext steps:`);
	console.log(`  cd ${options.projectName}`);
	console.log(`  bun install`);
	console.log(`  bun run dev`);
}

/**
 * Create all required directories
 */
async function createDirectories(projectRoot: string, options: ProjectOptions): Promise<void> {
	const dirs = ['src/main', 'src/preload', 'src/renderer', 'src/shared'];

	for (const dir of dirs) {
		const fullPath = join(projectRoot, dir);
		await fs.promises.mkdir(fullPath, { recursive: true });
	}

	// Create components directory for React Tailwind
	if (options.template === 'react-tailwind') {
		await fs.promises.mkdir(join(projectRoot, 'src/renderer/components'), {
			recursive: true,
		});
		await fs.promises.mkdir(join(projectRoot, 'src/renderer/contexts'), {
			recursive: true,
		});
	}
}

/**
 * Copy template files from templates/ directory
 */
async function copyTemplateFiles(projectRoot: string, options: ProjectOptions): Promise<void> {
	// Templates are in the CLI's installation directory: project-root/templates
	const templateDir = join(__dirname, '..', '..', 'templates', options.template);

	// Read all files from template directory recursively
	await copyDirectory(templateDir, projectRoot, options);
}

/**
 * Recursively copy directory contents with template variable substitution
 */
async function copyDirectory(
	srcDir: string,
	destRoot: string,
	options: ProjectOptions
): Promise<void> {
	const entries = await fs.promises.readdir(srcDir, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = join(srcDir, entry.name);
		const destPath = join(destRoot, entry.name);

		if (entry.isDirectory()) {
			await fs.promises.mkdir(destPath, { recursive: true });
			await copyDirectory(srcPath, destPath, options);
		} else {
			let content = await fs.promises.readFile(srcPath, 'utf-8');

			// Replace template variables
			content = substituteVariables(content, options);

			// Determine destination filename (remove .tmpl if present)
			const destFilename = destPath.endsWith('.tmpl') ? destPath.slice(0, -5) : destPath;

			await writeFile(destFilename, content);
		}
	}
}

/**
 * Substitute template variables in file content
 */
function substituteVariables(content: string, options: ProjectOptions): string {
	const substitutions: Record<string, string> = {
		'{{projectName}}': options.projectName,
		'{{description}}': options.description,
		'{{author}}': options.author || 'Anonymous',
		'{{license}}': options.license,
	};

	let result = content;
	for (const [key, value] of Object.entries(substitutions)) {
		result = result.split(key).join(value);
	}

	return result;
}

/**
 * Write file with proper encoding
 */
async function writeFile(filePath: string, content: string): Promise<void> {
	await fs.promises.writeFile(filePath, content, 'utf-8');

	// Make .ts/.js files executable if they're scripts
	if (filePath.endsWith('.ts') || filePath.endsWith('.js')) {
		try {
			const stat = await fs.promises.stat(filePath);
			await fs.promises.chmod(filePath, stat.mode | 0o111);
		} catch {
			// chmod may fail on Windows, ignore
		}
	}
}

/**
 * Generate config files (package.json, tsconfig, vite configs)
 */
async function generateConfigFiles(projectRoot: string, options: ProjectOptions): Promise<void> {
	// Generate package.json (always generate to include user options)
	const packageJson = generatePackageJson(options);
	await writeFile(join(projectRoot, 'package.json'), JSON.stringify(packageJson, null, 2));

	// Generate tsconfig.json if not in template
	const tsconfigPath = join(projectRoot, 'tsconfig.json');
	if (!(await fileExists(tsconfigPath))) {
		const tsconfig = getTsConfigContent();
		await writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2));
	}

	// Generate vite config if not in template
	const viteConfigPath = join(projectRoot, 'electron.vite.config.ts');
	if (!(await fileExists(viteConfigPath))) {
		const viteContent = getViteConfigContent(options);
		await writeFile(viteConfigPath, viteContent);
	}

	// Generate tailwind config if applicable
	if (options.template === 'react-tailwind' && options.styling === 'tailwind') {
		const tailwindConfig = getTailwindConfigContent();
		await writeFile(join(projectRoot, 'tailwind.config.js'), tailwindConfig);
		await writeFile(join(projectRoot, 'postcss.config.js'), getPostcssConfigContent());
	}

	// Generate eslint/prettier if selected
	if (options.codeQuality.eslint) {
		await writeFile(join(projectRoot, 'eslint.config.js'), getEslintConfigContent());
	}
	if (options.codeQuality.prettier) {
		await writeFile(join(projectRoot, 'prettier.config.js'), getPrettierConfigContent());
	}
}

/**
 * Check if file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
	try {
		await fs.promises.access(filePath);
		return true;
	} catch {
		return false;
	}
}

/**
 * Get .gitignore content
 */
function getGitignoreContent(): string {
	return `# Node modules
node_modules/
dist/
out/
*.log
.env
.env.local
.DS_Store
*.pid
*.seed
.vscode/
.idea/
*.sw*
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Bun
bun.lockb

# OS
Thumbs.db
Desktop.ini
`;
}

/**
 * Get bunfig.toml content
 */
function getBunfigContent(): string {
	return `# Bun configuration for Electron app
[install]
save = "exact"

[run]
hmr = true
hot = true

[build]
target = "browser"
outdir = "dist"
`;
}

/**
 * Generate glass morphism CSS
 */
async function generateGlassMorphism(projectRoot: string, options: ProjectOptions): Promise<void> {
	const glassLevel = options.glassLevel || 'standard';

	const glassStyles: Record<string, string> = {
		soft: `
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.75rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.glass-dark {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}
`,
		standard: `
.glass {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.glass-dark {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
`,
		strong: `
.glass {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 1.25rem;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
}

.glass-dark {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.25rem;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
}
`,
		dark: `
.glass {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.glass-dark {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}
`,
		gradient: `
.glass {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.glass-dark {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
`,
	};

	const glassCSS = glassStyles[glassLevel] ?? glassStyles.standard;
	if (glassCSS) {
		await writeFile(join(projectRoot, 'src/renderer/glass.css'), glassCSS.trim());
	}
}

/**
 * Generate Bun.serve() backend server
 */
async function generateBackendServer(projectRoot: string, options: ProjectOptions): Promise<void> {
	const backendDir = join(projectRoot, 'src/backend');
	await fs.promises.mkdir(backendDir, { recursive: true });

	const serverContent = `import { serve } from "bun";

const server = serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // API routes
    if (url.pathname === "/api/health") {
      return Response.json({ status: "ok", timestamp: Date.now() });
    }

    if (url.pathname === "/api/info") {
      return Response.json({
        name: "${options.projectName}",
        version: "1.0.0",
        description: "${options.description}",
      });
    }

    // 404 for unknown routes
    return new Response("Not Found", { status: 404 });
  },
});

console.log(\`Backend server running on http://localhost:\${server.port}\`);

export default server;
`;

	await writeFile(join(backendDir, 'server.ts'), serverContent);
}

/**
 * Get tsconfig.json content
 */
function getTsConfigContent(): object {
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
		},
		include: ['src/**/*'],
		exclude: ['node_modules', 'dist'],
	};
}

/**
 * Get electron-vite config content
 */
function getViteConfigContent(_options: ProjectOptions): string {
	// For simplicity, return a generic config that works for all templates
	return `import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import { resolve } from "node:path";

export default defineConfig({
  main: {
    build: {
      outDir: "dist/main",
      rollupOptions: {
        external: ["electron"],
        plugins: [externalizeDepsPlugin({ explicit: ["electron"] })],
        input: {
          main: resolve(__dirname, 'src/main/index.ts'),
        },
      },
    },
  },
  preload: {
    build: {
      outDir: "dist/preload",
      rollupOptions: {
        external: ["electron"],
        plugins: [externalizeDepsPlugin({ explicit: ["electron"] })],
        input: {
          preload: resolve(__dirname, 'src/preload/index.ts'),
        },
      },
    },
  },
  renderer: {
    build: {
      outDir: "dist/renderer",
      rollupOptions: {
        input: {
          renderer: resolve(__dirname, 'src/renderer/index.html'),
        },
      },
    },
  },
});
`;
}

/**
 * Get Tailwind config content
 */
function getTailwindConfigContent(): string {
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

/**
 * Get PostCSS config content
 */
function getPostcssConfigContent(): string {
	return `export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
`;
}

/**
 * Get ESLint config content
 */
function getEslintConfigContent(): string {
	return `import js from "@eslint/js";

export default [
  { ignores: ["dist", "node_modules"] },
  { extends: js.configs.recommended },
  { languageOptions: { ecmaVersion: 2022, sourceType: "module" } },
  { rules: { semi: ["error", "never"], quotes: ["error", "double"] } },
];
`;
}

/**
 * Get Prettier config content
 */
function getPrettierConfigContent(): string {
	return `module.exports = {
  semi: false,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "es5",
  printWidth: 100,
};
`;
}
