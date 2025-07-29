import { App, PluginSettingTab, Setting, Notice, TFolder, normalizePath } from 'obsidian';
import KindleVocabPlugin from '../main';
import {FolderSuggest, isTFolder} from '../utils/FolderSuggest';

export class KindleVocabSettingTab extends PluginSettingTab {
	constructor(app: App, private plugin: KindleVocabPlugin) {
		super(app, plugin);
	}

	async display(): Promise<void> {
		const { containerEl } = this;
		containerEl.empty();

		// 🔹 Section: Sync Options
		containerEl.createEl('h3', { text: 'Sync Options' });

		new Setting(containerEl)
			.setName('Sort Order')
			.setDesc('Choose how to sort your markdown file.')
			.addDropdown(drop => {
				drop
					.addOption('timestamp', 'Newest First (Timestamp)')
					.addOption('unlearned', 'Unlearned First');
				drop.setValue(this.plugin.settings.sortOrder || 'timestamp');
				drop.onChange(async (value) => {
					this.plugin.settings.sortOrder = value;
					await this.plugin.saveSettings();
					new Notice(`Sort order set to "${value}"`);
				});
			});

		// 🔹 Section: Markdown Output Folder
		new Setting(containerEl)
			.setName('Markdown Output Folder')
			.setDesc('Choose the folder to save your markdown file.')
			.addText(text => {
			const current = this.plugin.settings.markdownFolderPath || '';
			text.setValue(current);
			console.log('Current markdown folder:', current);

			// Attach the FolderSuggest to the text input
			new FolderSuggest(this.app, text.inputEl);
			
			// onblur ensure the change only happens when the user leaves the input
			text.inputEl.onblur = async () => {
				const value = text.getValue().trim();
				const folderExists = this.app.vault.getAllLoadedFiles()
					.some(f => isTFolder(f) && f.path === value);

				if (value && !folderExists) {
					new Notice('Invalid folder path entered');
					return;
				}

				this.plugin.settings.markdownFolderPath = value;
				await this.plugin.saveSettings();
				new Notice(`Markdown folder set to: ${value || 'Vault root'}`);
				};
		});

		// 🔹 Section: Database Folder
		new Setting(containerEl)
			.setName('Assets Folder')
			.setDesc('Choose the folder to save your database/dictionary files.')
			.addText(text => {
			const current = this.plugin.settings.assetsFolderPath || '';
			text.setValue(current);

			// Attach the FolderSuggest to the text input
			new FolderSuggest(this.app, text.inputEl);

			text.inputEl.onblur = async () => {
				const value = text.getValue().trim();
				const folderExists = this.app.vault.getAllLoadedFiles()
					.some(f => isTFolder(f) && f.path === value);

				if (value && !folderExists) {
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
			.setName('Sponsor')
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
