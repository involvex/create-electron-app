import fs from 'node:fs';
import { join } from 'node:path';
import type { ProjectOptions } from '../cli/prompts';

/**
 * Generate Electron menu and/or tray menu code
 */
export async function generateMenu(projectRoot: string, options: ProjectOptions): Promise<void> {
	const menuDir = join(projectRoot, 'src/main');
	let menuContent = '';

	if (options.navigation === 'native') {
		menuContent = getNativeMenuContent(options);
	} else {
		// Custom HTML navbar - provide component stub
		menuContent = getCustomNavbarContent(options);
	}

	// Write menu.ts (or navbar.ts for custom)
	const filename = options.navigation === 'native' ? 'menu.ts' : 'navbar.ts';
	const filepath = join(menuDir, filename);
	await fs.promises.writeFile(filepath, menuContent, 'utf-8');

	// If tray menu is requested, generate tray menu too
	if (options.uiFeatures.trayMenu) {
		const trayContent = getTrayMenuContent(options);
		await fs.promises.writeFile(join(menuDir, 'tray.ts'), trayContent, 'utf-8');
	}
}

function getNativeMenuContent(_options: ProjectOptions): string {
	return `import { Menu, app, shell } from "electron";

/**
 * Build the application menu
 */
export function buildMenu(): Menu {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideothers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        { type: "separator" },
        { role: "front" },
        { type: "separator" },
        { role: "window" },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Learn More",
          click: async () => {
            await shell.openExternal("https://www.electronjs.org/");
          },
        },
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}
`;
}

function getCustomNavbarContent(_options: ProjectOptions): string {
	return `/**
 * Custom navigation bar component
 * This file is a stub - implement your custom navbar in the renderer process
 * as a React/Vue component and include it in your main App.
 */

export function createCustomNavbar() {
  console.log("Custom navbar would be created here");
}
`;
}

function getTrayMenuContent(_options: ProjectOptions): string {
	return `import { Tray, Menu, app, nativeImage } from "electron";

let tray: Tray | null = null;

/**
 * Create system tray icon and menu
 */
export function createTray() {
  // TODO: Add icon file to assets and load it:
  // const icon = nativeImage.createFromPath(join(__dirname, '../../assets/tray-icon.png'));
  const icon = nativeImage.createEmpty();
  
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show App",
      click: () => {
        // Emit event to show window
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip("{{projectName}}");
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    // Show/hide window logic
  });
}

export function destroyTray() {
  tray?.destroy();
  tray = null;
}
`;
}
