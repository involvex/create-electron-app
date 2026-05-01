#!/usr/bin/env bun

import { intro, isCancel, outro } from '@clack/prompts';
import { collectUserInput, type ProjectOptions } from './cli/prompts';
import { generateProject } from './generators/project';

/**
 * create-electron-app CLI
 * Interactive scaffolding tool for Electron applications with Bun runtime
 */

async function main(): Promise<void> {
	intro('create-electron-app');

	try {
		// Gather user preferences via interactive prompts
		const options: ProjectOptions = await collectUserInput();

		// Generate the project
		await generateProject(options);

		outro(`Project "${options.projectName}" created successfully!`);

		console.log('\n📝 Quick start:');
		console.log(`   cd ${options.projectName}`);
		console.log('   bun install');
		console.log('   bun run dev\n');
	} catch (error) {
		if (isCancel(error)) {
			console.log('\n❌ Operation cancelled.');
			process.exit(0);
		} else {
			console.error('\n❌ An error occurred:', error);
			process.exit(1);
		}
	}
}

// Run
await main();
