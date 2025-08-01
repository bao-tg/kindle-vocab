import { App, PluginSettingTab, Setting, Notice} from 'obsidian';
import KindleVocabPlugin from '../main';
import {FolderSuggest, isTFolder} from '../utils/FolderSuggest';

export class KindleVocabSettingTab extends PluginSettingTab {
	constructor(app: App, private plugin: KindleVocabPlugin) {
		super(app, plugin);
	}

	async display(): Promise<void> {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Kindle Vocabulary')
			.setHeading();

		new Setting(containerEl)
			.setDesc('Choose how to sort your markdown file.')
			.addDropdown(drop => {
				drop
					.addOption('timestamp', 'Newest first')
					.addOption('unlearned', 'Unlearned first');
				drop.setValue(this.plugin.settings.sortOrder || 'timestamp');
				drop.onChange(async (value) => {
					this.plugin.settings.sortOrder = value;
					await this.plugin.saveSettings();
					new Notice(`Sort order set to "${value}"`);
				});
			});

		// 🔹 Section: Markdown output folder
		new Setting(containerEl)
			.setDesc('Choose the folder to save your markdown file.')
			.addText(text => {
			const current = this.plugin.settings.markdownFolderPath || '';
			text.setValue(current);

			// Attach the FolderSuggest to the text input
			new FolderSuggest(this.app, text.inputEl);
			
			// onblur ensure the change only happens when the user leaves the input
			text.inputEl.onblur = async () => {
				const value = text.getValue().trim();
				const folder = this.app.vault.getFolderByPath(value);

				if (value && !folder) {
					new Notice('Invalid folder path entered');
					return;
				}

				this.plugin.settings.markdownFolderPath = value;
				await this.plugin.saveSettings();
				new Notice(`Markdown folder set to: ${value || 'Vault root'}`);
				}
			});

		// 🔹 Section: Database Folder
		new Setting(containerEl)
			.setDesc('Choose the folder to save your database/dictionary files.')
			.addText(text => {
			const current = this.plugin.settings.assetsFolderPath || '';
			text.setValue(current);

			// Attach the FolderSuggest to the text input
			new FolderSuggest(this.app, text.inputEl);

			text.inputEl.onblur = async () => {
				const value = text.getValue().trim();
				const folder = this.app.vault.getFolderByPath(value);

				if (value && !folder) {
					new Notice('Invalid folder path entered');
					return;
				}

				this.plugin.settings.assetsFolderPath = value;
				await this.plugin.saveSettings();
				new Notice(`Assets folder set to: ${value || 'Vault root'}`);
				};
		});

		// 🔹 Section: Sponsor 
		new Setting(containerEl)
			.setDesc('Developed and maintained by Truong Gia Bao')
			.addButton((btn) =>
				btn
					.setButtonText('☕ Buy Me a Coffee')
					.setCta()
					.onClick(() => {
						window.open('https://www.buymeacoffee.com/bao-tg', '_blank');
					})
			);
		}
}
