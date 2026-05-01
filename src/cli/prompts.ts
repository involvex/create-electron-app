import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cancel, confirm, multiselect, select, text } from '@clack/prompts';
import type {
	BackendOption,
	GlassLevel,
	NavigationType,
	StylingOption,
	TemplateType,
	ThemePreset,
} from './constants';
import { TEMPLATES } from './constants';
import { validateProjectName } from './validation';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Safely handle prompt result, throwing if cancelled
 */
function unwrap<T>(result: T | symbol): T {
	if (typeof result === 'symbol') {
		throw cancel();
	}
	return result;
}

/**
 * Collect all user input via interactive prompts
 * Returns ProjectOptions object with all selections
 */
export async function collectUserInput(): Promise<ProjectOptions> {
	console.log('\n');

	// Step 1: Project name
	const projectNameRaw = await text({
		message: 'What is your project name?',
		placeholder: 'my-electron-app',
		initialValue: 'my-electron-app',
		validate: (value) => validateProjectName(value),
	});
	const projectName = unwrap<string>(projectNameRaw).trim().toLowerCase();

	// Verify directory doesn't exist
	const projectPath = resolve(process.cwd(), projectName);
	const dirExists = await Bun.file(projectPath).exists();
	if (dirExists) {
		console.error(`Error: Directory "${projectPath}" already exists`);
		console.error('Choose a different name.');
		process.exit(1);
	}

	// Step 2: Project description (optional)
	const descRaw = await text({
		message: 'Project description (optional)',
		placeholder: `An Electron app built with ${projectName}`,
		initialValue: `An Electron app built with ${projectName}`,
	});
	const description =
		typeof descRaw === 'string' ? descRaw : `An Electron app built with ${projectName}`;

	// Step 3: Template selection
	const template = unwrap<string>(
		await select({
			message: 'Select a template:',
			options: [
				{
					label: 'Vanilla + Vite (Minimal)',
					value: TEMPLATES.VANILLA,
					hint: 'Pure TypeScript + Vite, no framework',
				},
				{ label: 'React + Vite', value: TEMPLATES.REACT, hint: 'React 19 with HMR' },
				{
					label: 'React + Tailwind + Components',
					value: TEMPLATES.REACT_TAILWIND,
					hint: 'Full-stack with styling library',
				},
				{ label: 'Vue 3 + Vite', value: TEMPLATES.VUE, hint: 'Vue Composition API' },
			],
		})
	);

	// Step 4: Styling framework (skip for vanilla)
	let styling: StylingOption | null = null;
	if (template !== TEMPLATES.VANILLA) {
		const styleRaw = await select({
			message: 'Choose a styling framework:',
			options: [
				{ label: 'Tailwind CSS 4', value: 'tailwind', hint: 'Industry standard utility-first CSS' },
				{ label: 'Aura UI', value: 'aura', hint: 'Vibrant Depth design with glass morphism' },
				{ label: 'Cloudflare Kumo', value: 'kumo', hint: 'Base UI + Tailwind v4 (87K downloads)' },
				{ label: 'shadcn/ui', value: 'shadcn', hint: '50+ customizable components (React only)' },
				{ label: 'Custom CSS', value: 'custom', hint: 'Write your own styles' },
			],
			initialValue: 'tailwind',
		});
		styling = unwrap<string>(styleRaw) as StylingOption;
	}

	// Step 5: UI Features (multi-select)
	let glassMorphism = false;
	let themeToggle = false;
	if (template !== TEMPLATES.VANILLA) {
		const selected = unwrap<string[]>(
			await multiselect({
				message: 'Select UI features:',
				options: [
					{ label: 'Glass morphism effects', value: 'glassMorphism' },
					{ label: 'Dark/light mode toggle', value: 'themeToggle' },
				],
				initialValues: ['glassMorphism', 'themeToggle'],
			})
		);
		glassMorphism = selected.includes('glassMorphism');
		themeToggle = selected.includes('themeToggle');
	}

	// Step 6: Theme preset (if theme enabled)
	let selectedTheme: ThemePreset | null = null;
	if (themeToggle) {
		const themeRaw = await select({
			message: 'Select theme preset:',
			options: [
				{ label: 'Default (Light)', value: 'default' },
				{ label: 'Dark Night', value: 'dark-night' },
				{ label: 'Glass', value: 'glass' },
				{ label: 'Gradient', value: 'gradient' },
			],
			initialValue: 'default',
		});
		selectedTheme = unwrap<string>(themeRaw) as ThemePreset;
	}

	// Step 7: Glass morphism settings (if selected)
	let selectedGlass: GlassLevel | null = null;
	if (glassMorphism) {
		const glassRaw = await select({
			message: 'Select glass morphism style:',
			options: [
				{ label: 'Soft (8px blur, subtle)', value: 'soft' },
				{ label: 'Standard (16px blur, balanced)', value: 'standard' },
				{ label: 'Strong (24px blur, dense)', value: 'strong' },
				{ label: 'Dark glass (dark mode tint)', value: 'dark' },
				{ label: 'Gradient glass (colorful)', value: 'gradient' },
			],
			initialValue: 'standard',
		});
		selectedGlass = unwrap<string>(glassRaw) as GlassLevel;
	}

	// Step 8: Navigation type
	const navRaw = await select({
		message: 'Choose navigation style:',
		options: [
			{ label: 'Native Electron MenuBar', value: 'native' },
			{ label: 'Sticky Navbar', value: 'sticky' },
			{ label: 'Fixed Navbar', value: 'fixed' },
			{ label: 'Custom HTML', value: 'custom' },
		],
		initialValue: 'native',
	});
	const navigationType = unwrap<string>(navRaw) as NavigationType;

	// Step 9: Tray menu (if not vanilla)
	let hasTray = false;
	if (template !== TEMPLATES.VANILLA) {
		const trayResult = await confirm({
			message: 'Add system tray menu?',
			initialValue: true,
		});
		hasTray = unwrap<boolean>(trayResult);
	}

	// Step 10: Backend/API
	const backendRaw = await select({
		message: 'Backend / API setup:',
		options: [
			{ label: 'Vite Backend', value: 'vite-backend' },
			{ label: 'Bun.serve()', value: 'bun-serve' },
			{ label: 'Express', value: 'express' },
			{ label: 'None (Frontend only)', value: 'none' },
		],
		initialValue: 'vite-backend',
	});
	const backend = unwrap<string>(backendRaw) as BackendOption;

	// Step 11: Code quality tools
	const selectedQuality = unwrap<string[]>(
		await multiselect({
			message: 'Select code quality tools:',
			options: [
				{ label: 'ESLint', value: 'eslint' },
				{ label: 'Prettier', value: 'prettier' },
				{ label: 'Git initialization', value: 'git' },
				{ label: 'Husky hooks', value: 'husky' },
			],
			initialValues: ['eslint', 'prettier', 'git'],
		})
	);

	const codeQuality = {
		eslint: selectedQuality.includes('eslint'),
		prettier: selectedQuality.includes('prettier'),
		git: selectedQuality.includes('git'),
		husky: selectedQuality.includes('husky') && selectedQuality.includes('git'),
	};

	// Step 12: Git init (if not already selected)
	const gitInit = codeQuality.git;

	// Step 13: Author name (from git or manual)
	let gitName = '';
	try {
		const proc = Bun.spawnSync(['git', 'config', 'user.name']);
		if ((proc as { code?: number }).code === 0 && proc.stdout) {
			gitName = String(proc.stdout).trim();
		}
	} catch {
		// ignore
	}
	const authorRaw = await text({
		message: 'Author name:',
		placeholder: 'Your Name',
		initialValue: gitName,
	});
	const author = typeof authorRaw === 'string' && authorRaw ? authorRaw : 'Anonymous';

	// Step 14: License
	const licenseRaw = await select({
		message: 'License:',
		options: [
			{ label: 'MIT', value: 'MIT' },
			{ label: 'Apache-2.0', value: 'Apache-2.0' },
			{ label: 'GPL-3.0', value: 'GPL-3.0' },
			{ label: 'Unlicensed', value: 'UNLICENSED' },
		],
		initialValue: 'MIT',
	});
	const license = unwrap<string>(licenseRaw);

	// Determine final styling
	const finalStyling = template === TEMPLATES.VANILLA ? null : styling || 'custom';

	return {
		projectName,
		description,
		template: template as TemplateType,
		styling: finalStyling as StylingOption | null,
		uiFeatures: {
			glassMorphism,
			themeToggle,
			trayMenu: hasTray,
		},
		theme: selectedTheme,
		glassLevel: selectedGlass,
		navigation: navigationType,
		backend,
		codeQuality,
		gitInit,
		author,
		license,
	};
}

/**
 * ProjectOptions interface
 */
export interface ProjectOptions {
	projectName: string;
	description: string;
	template: TemplateType;
	styling: StylingOption | null;
	uiFeatures: {
		glassMorphism: boolean;
		themeToggle: boolean;
		trayMenu: boolean;
	};
	theme: ThemePreset | null;
	glassLevel: GlassLevel | null;
	navigation: NavigationType;
	backend: BackendOption;
	codeQuality: {
		eslint: boolean;
		prettier: boolean;
		husky: boolean;
	};
	gitInit: boolean;
	author: string;
	license: string;
}
