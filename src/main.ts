import { Plugin, Notice } from 'obsidian';
import { MyPluginSettings, DEFAULT_SETTINGS } from './settings/Settings';
import { SampleSettingTab } from './settings/SettingTab';
import { registerCommands } from './commands/CommandsHandlers';
import { registerRibbons } from './ribbon/RibbonHandlers';
import { loadStyles } from './styles/StyleLoader';


export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// Load styles
		loadStyles();
		// Core logic
		registerRibbons(this);
		registerCommands(this);

		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		// cleanup logic if needed
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
function registerStyles() {
	throw new Error('Function not implemented.');
}

