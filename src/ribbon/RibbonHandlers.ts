import { Plugin, Notice } from 'obsidian';
import { SyncDatabaseModal } from '../modals/SyncDatabaseModal';

export function registerRibbons(plugin: Plugin) {
	// Ribbon: Sync Database
	const syncRibbon = plugin.addRibbonIcon('book-open', 'Sync Kindle Vocabulary', () => {
        new SyncDatabaseModal(plugin.app).open();
    });

	syncRibbon.addClass('my-plugin-sync-ribbon');
}
