import { Plugin, Notice } from 'obsidian';
import { MyPluginSettings, DEFAULT_SETTINGS } from './settings/Settings';
import { SampleSettingTab } from './settings/SettingTab';
import { registerCommands } from './commands/CommandsHandlers';
import { registerRibbons } from './ribbon/RibbonHandlers';
import { setupCheckboxListeners } from './utils/MarkdownFormat';


export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();


		console.log('[VocabPlugin] Plugin loaded');

		// 1. Handle live file-open events
		this.registerEvent(
			this.app.workspace.on('file-open', () => {
				console.log('[VocabPlugin] file-open triggered');
				setTimeout(() => {
					console.log('[VocabPlugin] calling setupCheckboxListeners from file-open');
					setupCheckboxListeners(this.app);
				}, 1000);
			})
		);

		// 2. Manually bind in case file was already open
		setTimeout(() => {
			console.log('[VocabPlugin] manually calling setupCheckboxListeners after load');
			setupCheckboxListeners(this.app);
		}, 2000);

		// Core logic
		registerRibbons(this);
		registerCommands(this);

		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// Register settings tab
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

