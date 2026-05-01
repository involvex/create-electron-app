import fs from 'node:fs';
import { join } from 'node:path';
import type { GlassLevel, ThemePreset } from '../cli/constants';
import type { ProjectOptions } from '../cli/prompts';

/**
 * Generate theme CSS variables and glass morphism utilities
 */
export async function generateThemes(projectRoot: string, options: ProjectOptions): Promise<void> {
	let cssContent = '';

	if (options.uiFeatures.themeToggle && options.theme) {
		cssContent += generateThemeVariables(options.theme);
	}

	if (options.uiFeatures.glassMorphism && options.glassLevel) {
		const glassCss = generateGlassUtilities(options.glassLevel);
		if (glassCss) {
			cssContent += `\n\n${glassCss}`;
		}
	}

	// Write to CSS file in renderer
	if (cssContent) {
		const cssPath = join(projectRoot, 'src/renderer', 'theme.css');
		await fs.promises.writeFile(cssPath, cssContent, 'utf-8');
	}
}

/**
 * Generate CSS variables for theme
 */
function generateThemeVariables(theme: ThemePreset): string {
	const themes: Record<string, Record<string, string>> = {
		default: {
			'--color-bg': '#ffffff',
			'--color-surface': '#f8fafc',
			'--color-text': '#1a1a1a',
			'--color-text-secondary': '#666666',
			'--color-primary-50': '#eff6ff',
			'--color-primary-100': '#dbeafe',
			'--color-primary-200': '#bfdbfe',
			'--color-primary-300': '#93c5fd',
			'--color-primary-400': '#60a5fa',
			'--color-primary-500': '#3b82f6',
			'--color-primary-600': '#2563eb',
			'--color-primary-700': '#1d4ed8',
			'--color-primary-800': '#1e40af',
			'--color-primary-900': '#1e3a8a',
			'--glass-bg': 'rgba(255, 255, 255, 0.15)',
			'--glass-border': 'rgba(255, 255, 255, 0.2)',
		},
		'dark-night': {
			'--color-bg': '#0f172a',
			'--color-surface': '#1e293b',
			'--color-text': '#f1f5f9',
			'--color-text-secondary': '#94a3b8',
			'--color-primary-50': '#1e3a8a',
			'--color-primary-100': '#1e40af',
			'--color-primary-200': '#2563eb',
			'--color-primary-300': '#3b82f6',
			'--color-primary-400': '#60a5fa',
			'--color-primary-500': '#93c5fd',
			'--color-primary-600': '#bfdbfe',
			'--color-primary-700': '#dbeafe',
			'--color-primary-800': '#eff6ff',
			'--color-primary-900': '#f0f9ff',
			'--glass-bg': 'rgba(0, 0, 0, 0.3)',
			'--glass-border': 'rgba(255, 255, 255, 0.1)',
		},
		glass: {
			'--color-bg': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
			'--color-surface': 'rgba(255, 255, 255, 0.1)',
			'--color-text': '#ffffff',
			'--color-text-secondary': 'rgba(255, 255, 255, 0.7)',
			'--color-primary-50': '#e0e7ff',
			'--color-primary-100': '#c7d2fe',
			'--color-primary-200': '#a5b4fc',
			'--color-primary-300': '#818cf8',
			'--color-primary-400': '#6366f1',
			'--color-primary-500': '#4f46e5',
			'--color-primary-600': '#4338ca',
			'--color-primary-700': '#3730a3',
			'--color-primary-800': '#312e81',
			'--color-primary-900': '#1e1b4b',
			'--glass-bg': 'rgba(255, 255, 255, 0.2)',
			'--glass-border': 'rgba(255, 255, 255, 0.3)',
		},
		gradient: {
			'--color-bg': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
			'--color-surface': 'rgba(255, 255, 255, 0.15)',
			'--color-text': '#1a1a1a',
			'--color-text-secondary': '#666666',
			'--color-primary-50': '#fef3c7',
			'--color-primary-100': '#fde68a',
			'--color-primary-200': '#fcd34d',
			'--color-primary-300': '#fbbf24',
			'--color-primary-400': '#f59e0b',
			'--color-primary-500': '#d97706',
			'--color-primary-600': '#b45309',
			'--color-primary-700': '#92400e',
			'--color-primary-800': '#78350f',
			'--color-primary-900': '#451a03',
			'--glass-bg': 'rgba(255, 255, 255, 0.2)',
			'--glass-border': 'rgba(255, 255, 255, 0.3)',
		},
	};

	const colors = themes[theme] || themes.default;

	let css = ':root {\n';
	for (const [key, value] of Object.entries(colors || {})) {
		css += `  ${key}: ${value};\n`;
	}
	css += '}\n';

	// Add dark class if theme is dark-night
	if (theme === 'dark-night') {
		css += '\n:root.dark {\n';
		for (const [key, value] of Object.entries(colors || {})) {
			css += `  ${key}: ${value};\n`;
		}
		css += '}\n';
	}

	return css;
}

/**
 * Generate glass morphism utility classes
 */
function generateGlassUtilities(level: GlassLevel): string {
	const glassStyles: Record<string, Record<string, string>> = {
		soft: { blur: '8px', opacity: '0.1', border: '0.2' },
		standard: { blur: '16px', opacity: '0.15', border: '0.2' },
		strong: { blur: '24px', opacity: '0.2', border: '0.3' },
		dark: { blur: '16px', opacity: '0.3', border: '0.1' },
		gradient: { blur: '16px', opacity: '0.2', border: '0.3' },
	};

	const style = glassStyles[level];
	if (!style) {
		return '';
	}

	const blur = style.blur;
	const opacity = style.opacity;
	const border = style.border;

	return `/* Glass morphism utilities */
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(${blur});
  -webkit-backdrop-filter: blur(${blur});
  border: 1px solid var(--glass-border);
}

.glass-soft {
  background: rgba(255, 255, 255, ${opacity});
  backdrop-filter: blur(${blur});
  -webkit-backdrop-filter: blur(${blur});
  border: 1px solid rgba(255, 255, 255, ${border});
}

.glass-standard {
  background: rgba(255, 255, 255, ${opacity});
  backdrop-filter: blur(${blur});
  -webkit-backdrop-filter: blur(${blur});
  border: 1px solid rgba(255, 255, 255, ${border});
}

.glass-strong {
  background: rgba(255, 255, 255, ${opacity});
  backdrop-filter: blur(${blur});
  -webkit-backdrop-filter: blur(${blur});
  border: 1px solid rgba(255, 255, 255, ${border});
}
`;
}
