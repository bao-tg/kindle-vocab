import { App, PluginSettingTab, Setting, Notice, normalizePath } from 'obsidian';
import MyPlugin from '../main';
import { getVocabDbPath, getDictionaryCsvPath, getdatafolderPath } from '../utils/PathHelper';
import { TFolder } from 'obsidian';


export class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	async display(): Promise<void> {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h1', { text: 'Kindle Vocabulary Sync Settings' });

		containerEl.createEl('h3', { text: 'Advanced Features (Use carefully)' });

		// Setting: Dictionary CSV Path
		new Setting(containerEl)
			.setName('Dictionary CSV Path')
			.setDesc('Path to your dictionary CSV file inside vault.')
			.addText(text => text
				.setPlaceholder(getDictionaryCsvPath())
				.setValue(this.plugin.settings.dictionaryCsvPath || getDictionaryCsvPath())
				.onChange(async (value) => {
					this.plugin.settings.dictionaryCsvPath = value.trim();
					await this.plugin.saveSettings();
					new Notice('Dictionary CSV path updated.');
				}));

		// Setting: Vocab Database Path
		new Setting(containerEl)
			.setName('Vocab Database Path')
			.setDesc('Path to your vocab database file inside vault.')
			.addText(text => text
				.setPlaceholder(getVocabDbPath())
				.setValue(this.plugin.settings.vocabDbPath || getVocabDbPath())
				.onChange(async (value) => {
					this.plugin.settings.vocabDbPath = value.trim();
					await this.plugin.saveSettings();
					new Notice('Vocab DB path updated.');
				}));
		
		containerEl.createEl('h3', { text: 'Upload Statistics' });
		
		// Show dictionary and vocab.db counts
		const dictCount = await this.countFiles('csv');
		containerEl.createEl('p', { text: `Dictionary CSVs managed internally: ${dictCount}` });
		
		const dbCount = await this.countFiles('db');
		containerEl.createEl('p', { text: `Vocab DBs managed internally: ${dbCount}` });

		// Setting: Sort Order
		new Setting(containerEl)
			.setName('Sort Order')
			.setDesc('Choose how to sort your markdown file.')
			.addDropdown(drop => {
				drop
					.addOption('timestamp', 'Newest First (Timestamp)')
					.addOption('unlearned', 'Unlearned First')

				// ✅ Ensure the dropdown reflects the current value
				drop.setValue(this.plugin.settings.sortOrder || 'timestamp');

				drop.onChange(async (value) => {
					console.log('[DEBUG] Dropdown changed to:', value);
					this.plugin.settings.sortOrder = value;
					await this.plugin.saveSettings();
					new Notice(`Sort order set to "${value}"`);
				});
			});

		new Setting(containerEl)
			.setName('Markdown Output Folder')
			.setDesc('Choose the folder to save your markdown file.')
			.addDropdown(drop => {
				const folders = this.app.vault.getAllLoadedFiles()
					.filter(f => f instanceof TFolder) as TFolder[];

				const current = this.plugin.settings.markdownFolderPath || '';

				// Add folders to dropdown
				drop.addOption('', 'Vault root');
				for (const folder of folders) {
					drop.addOption(folder.path, folder.path);
				}

				drop.setValue(current);

				drop.onChange(async (value) => {
					this.plugin.settings.markdownFolderPath = value;
					await this.plugin.saveSettings();
					new Notice(`Markdown folder set to: ${value || 'Vault root'}`);
				});
			});
	}

	// Utility function: Count files in 'data/' folder with extension
	private async countFiles(extension: string): Promise<number> {
		try {
			const folderPath = getdatafolderPath();
			const files = await this.app.vault.adapter.list(folderPath);
			return files.files.filter(file => file.endsWith(`.${extension}`)).length;
		} catch (err) {
			console.error('Error counting files:', err);
			return 0;
		}
	}
}
