#!/usr/bin/env bun
/**
 * Quick test script to verify project generation for each template
 * Run with: bun test-generate.ts
 */

import { generateProject } from "./src/generators/project";
import type { ProjectOptions } from "./src/cli/prompts";
import { TEMPLATES } from "./src/cli/constants";
import { mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEST_DIR = join(__dirname, "test-output");

async function cleanup() {
  try {
    await rm(TEST_DIR, { recursive: true, force: true });
  } catch {
    // ignore
  }
  await mkdir(TEST_DIR, { recursive: true });
}

function createOptions(template: string): ProjectOptions {
  return {
    projectName: `test-${template}`,
    description: `Test ${template} project`,
    template: template as any,
    styling: template === "vanilla" ? null : ("tailwind" as any),
    uiFeatures: {
      glassMorphism: true,
      themeToggle: true,
      trayMenu: false,
    },
    theme: "default" as any,
    glassLevel: "standard" as any,
    navigation: "native" as any,
    backend: "vite-backend" as any,
    codeQuality: {
      eslint: true,
      prettier: true,
      husky: false,
    },
    gitInit: false,
    author: "Test Author",
    license: "MIT",
  };
}

async function testTemplate(template: string) {
  console.log(`\n🧪 Testing template: ${template}...`);
  const options = createOptions(template);
  try {
    await generateProject(options);
    console.log(`✅ ${template} generation succeeded`);
    // Check some expected files
    const projectPath = join(TEST_DIR, options.projectName);
    // Could add file existence checks here
  } catch (error) {
    console.error(`❌ ${template} generation failed:`, error);
    process.exit(1);
  }
}

async function main() {
  await cleanup();
  await testTemplate(TEMPLATES.VANILLA);
  await testTemplate(TEMPLATES.REACT);
  await testTemplate(TEMPLATES.REACT_TAILWIND);
  await testTemplate(TEMPLATES.VUE);
  console.log("\n🎉 All template tests passed!");
  // Cleanup
  // await rm(TEST_DIR, { recursive: true, force: true });
}

await main();
