import { spawnSync } from 'node:child_process';

/**
 * Initialize git repository in the project directory
 */
export async function initializeGit(projectRoot: string): Promise<void> {
	console.log('Initializing git repository...');

	try {
		// git init
		const initResult = spawnSync('git', ['init'], {
			cwd: projectRoot,
			stdio: 'pipe',
		});

		const initCode = (initResult as { code?: number }).code;
		if (initCode !== 0) {
			console.warn('Failed to initialize git repository:', String(initResult.stderr));
			return;
		}

		// git add
		const addResult = spawnSync('git', ['add', '.'], {
			cwd: projectRoot,
			stdio: 'pipe',
		});

		const addCode = (addResult as { code?: number }).code;
		if (addCode !== 0) {
			console.warn('Failed to stage files:', String(addResult.stderr));
			return;
		}

		// git commit
		const commitMessage = `Initial commit from create-electron-app\n\nGenerated project: ${projectRoot}`;
		const commitResult = spawnSync('git', ['commit', '-m', commitMessage], {
			cwd: projectRoot,
			stdio: 'pipe',
			env: {
				...process.env,
				GIT_AUTHOR_NAME: 'create-electron-app',
				GIT_AUTHOR_EMAIL: 'cli@involvex.dev',
			},
		});

		const commitCode = (commitResult as { code?: number }).code;
		if (commitCode !== 0) {
			console.warn('Failed to create initial commit:', String(commitResult.stderr));
		} else {
			console.log('Git repository initialized and initial commit created.');
		}
	} catch (error) {
		console.warn('Git initialization error:', String(error));
	}
}
