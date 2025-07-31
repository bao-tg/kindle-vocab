import { Plugin, Notice } from 'obsidian';
import { KindleVocabSettings, DEFAULT_SETTINGS } from './settings/Settings';
import { KindleVocabSettingTab } from './settings/SettingTab';
import { registerCommands } from './commands/CommandsHandlers';
import { registerRibbons } from './ribbon/RibbonHandlers';
import { registerCheckboxPostProcessor } from "./utils/checkboxProcessor";

export default class KindleVocabPlugin extends Plugin {
	settings: KindleVocabSettings;

	async onload() {
		await this.loadSettings();

		// 📌 Add checkbox processor to mark words as learned/unlearned
		registerCheckboxPostProcessor(this);

		// 📌 Register UI and logic
		registerRibbons(this);
		registerCommands(this);

		// 📌 Add settings tab
		this.addSettingTab(new KindleVocabSettingTab(this.app, this));
	}

	onunload() {
		// Clean-up logic can go here if needed
	}

	async loadSettings() {
		const loaded = await this.loadData();
		this.settings = {
			...DEFAULT_SETTINGS,
			...loaded,
		};
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
