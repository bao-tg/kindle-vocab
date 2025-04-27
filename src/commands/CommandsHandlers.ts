import { Editor, MarkdownView } from 'obsidian';
import MyPlugin from '../main';
import { DatabaseUploadModal } from '../modals/DatabaseUploadModal';
import { DictionaryUploadModal } from '../modals/DictionaryUploadModal';
import { SyncDatabaseModal } from '../modals/SyncDatabaseModal';

export function registerCommands(plugin: MyPlugin) {
	plugin.addCommand({
		id: 'Upload your vocabulary database',
		name: 'Upload your vocabulary database',
		callback: () => {
			new DatabaseUploadModal(this.app).open();
		}
	});

	plugin.addCommand({
		id: 'Sync the vocabulary builder to your Obsidian',
		name: 'Sync the vocabulary builder to your Obsidian',
		callback: () => {
			new SyncDatabaseModal(this.app).open();
		}
	});

	plugin.addCommand({
		id: 'Upload your dictionary file',
		name: 'Upload your dictionary file',
		callback: () => {
			new DictionaryUploadModal(this.app).open();
		}
	});
}
