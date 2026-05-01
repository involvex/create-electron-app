/**
 * Validation functions for CLI user input
 */

/**
 * Validate project name
 * Returns string error message, Error, or undefined for valid
 */
export function validateProjectName(value: string | undefined): string | Error | undefined {
	if (!value || value.trim() === '') {
		return 'Project name is required';
	}

	const trimmed = value.trim();

	// Check for spaces
	if (/\s/.test(trimmed)) {
		return 'Project name cannot contain spaces';
	}

	// Check for invalid characters (only allow alphanumeric, hyphen, underscore)
	if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
		return 'Project name can only contain letters, numbers, hyphens, and underscores';
	}

	// Should not start with hyphen (bad practice)
	if (trimmed.startsWith('-')) {
		return 'Project name cannot start with a hyphen';
	}

	// Reserved names check (basic)
	const reserved = [
		'node_modules',
		'npm',
		'create-electron-app',
		'electron',
		'bun',
		'test',
		'temp',
		'tmp',
		'src',
		'dist',
		'build',
		'out',
	];
	if (reserved.includes(trimmed.toLowerCase())) {
		return `"${trimmed}" is a reserved name; please choose another`;
	}

	// Valid
	return undefined;
}

/**
 * Validate that project name doesn't conflict with existing node_modules
 */
export function validateNoNodeModules(name: string): string | true {
	const trimmed = name.trim();
	if (trimmed === 'node_modules') {
		return "Cannot create project named 'node_modules'";
	}
	return true;
}

/**
 * Check if directory already exists
 * Returns true if safe to proceed (doesn't exist)
 */
export async function validateDirectoryNotExists(
	projectPath: string,
	override: boolean = false
): Promise<boolean> {
	const fs = Bun.file;

	try {
		const exists = await fs(projectPath).exists();
		if (exists) {
			if (override) {
				console.warn(`Directory "${projectPath}" already exists - will overwrite`);
				return true;
			} else {
				console.error(`Error: Directory "${projectPath}" already exists`);
				console.error('Choose a different name or use --force to override');
				return false;
			}
		}
		return true;
	} catch {
		console.warn(`Could not check directory`);
		return true;
	}
}

/**
 * Validate project path doesn't contain invalid characters for the current OS
 */
export function validateProjectPath(path: string): string | true {
	const illegalChars = /[<>:"|?*]/;
	if (illegalChars.test(path)) {
		return 'Project path contains invalid characters (<, >, :, ", |, ?, *)';
	}
	return true;
}

/**
 * Validate git branch name (for future use)
 */
export function validateBranchName(branch: string): string | true {
	if (!branch || branch.trim() === '') {
		return 'Branch name is required';
	}
	const invalidPattern = /^\.|.*\.\.|.*@\{|.*\\|^.*\s.*$/;
	if (invalidPattern.test(branch)) {
		return 'Invalid branch name';
	}
	return true;
}
