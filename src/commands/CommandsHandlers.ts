import KindleVocabPlugin from '../main';
import { DatabaseUploadModal } from '../modals/DatabaseUploadModal';
import { DictionaryUploadModal } from '../modals/DictionaryUploadModal';
import { SyncDatabaseModal } from '../modals/SyncDatabaseModal';

export function registerCommands(plugin: KindleVocabPlugin) {
	// Upload vocabulary database
	plugin.addCommand({
		id: 'upload-vocab-database',
		name: 'Upload your vocabulary database',
		callback: () => {
			new DatabaseUploadModal(plugin.app, plugin).open();
		}
	});

	// Sync to markdown
	plugin.addCommand({
		id: 'sync-vocabulary-builder',
		name: 'Sync the vocabulary builder to your Obsidian',
		callback: () => {
			new SyncDatabaseModal(plugin.app, plugin).open();
		}
	});

	// Upload dictionary CSV
	plugin.addCommand({
		id: 'upload-dictionary-file',
		name: 'Upload your dictionary file',
		callback: () => {
			new DictionaryUploadModal(plugin.app, plugin).open();
		}
	});
}
