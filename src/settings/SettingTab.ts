import { App, PluginSettingTab, Setting, Notice, normalizePath, TFolder } from 'obsidian';
import MyPlugin from '../main';

export class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	async display(): Promise<void> {
		const { containerEl } = this;
		containerEl.empty();

		// Header
		containerEl.createEl('h1', { text: 'Kindle Vocabulary Sync Settings' });

		// Setting: Sort Order
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

		// Setting: Markdown Output Folder
		new Setting(containerEl)
			.setName('Markdown Output Folder')
			.setDesc('Choose the folder to save your markdown file.')
			.addDropdown(drop => {
				const folders = this.app.vault.getAllLoadedFiles()
					.filter(f => f instanceof TFolder) as TFolder[];

				const current = this.plugin.settings.markdownFolderPath || '';

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

		// Developer credit and Buy Me a Coffee button
		const sponsorSetting = new Setting(containerEl)
			.setName('Sponsor')
			.setDesc('Developed and maintained by Truong Gia Bao');

		const coffeeContainer = sponsorSetting.settingEl.createDiv();
		const coffeeButton = coffeeContainer.createEl('a', {
			href: 'https://www.buymeacoffee.com/bao-tg',
		});
		coffeeButton.setAttr('target', '_blank');

		const img = coffeeButton.createEl('img', {
			attr: {
				src: 'https://cdn.buymeacoffee.com/buttons/v2/default-violet.png',
				alt: 'Buy Me a Coffee',
			}
		});
		img.style.height = '40px';
		img.style.borderRadius = '8px';
		img.style.marginTop = '1px';
		img.style.marginBottom = '1px';
	}
}
