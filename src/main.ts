import { Plugin, Notice } from 'obsidian';
import { KindleVocabSettings, DEFAULT_SETTINGS } from './settings/Settings';
import { KindleVocabSettingTab } from './settings/SettingTab';
import { registerCommands } from './commands/CommandsHandlers';
import { registerRibbons } from './ribbon/RibbonHandlers';
import { setupCheckboxListeners } from './utils/MarkdownFormat';

export default class KindleVocabPlugin extends Plugin {
	settings: KindleVocabSettings;

	async onload() {
		await this.loadSettings();

		// 📌 Apply checkbox listeners when a file is opened
		this.registerEvent(
			this.app.workspace.on('file-open', () => {
				setTimeout(() => setupCheckboxListeners(this.app), 1000);
			})
		);

		// 📌 Run once in case a file is already open
		setTimeout(() => setupCheckboxListeners(this.app), 2000);

		// 📌 Register UI and logic
		registerRibbons(this);
		registerCommands(this);

		// 📌 Add status bar
		this.addStatusBarItem().setText('Status Bar Text');

		// 📌 Add settings tab
		this.addSettingTab(new KindleVocabSettingTab(this.app, this));
	}

	onunload() {
		// Clean-up logic can go here if needed
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
